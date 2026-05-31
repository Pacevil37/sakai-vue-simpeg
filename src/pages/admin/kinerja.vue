<template>
  <div class="w-full mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
    
    <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xl shadow-zinc-500/20">
            <i class="pi pi-chart-line text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Performance Metrics System
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0 uppercase">Penilaian Kinerja</h1>
            <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
              Monitor pencapaian target dan evaluasi kompetensi pegawai secara periodik.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
            <Button icon="pi pi-sync" class="p-4 bg-zinc-100 text-zinc-600 border-0 rounded-xl hover:bg-zinc-200 transition-all" @click="loadData" :loading="loading" />
            <Button label="Tambah Penilaian" icon="pi pi-plus" class="text-xs font-black bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-xl border-0 shadow-lg uppercase tracking-widest" @click="openCreateModal" />
        </div>
      </div>

      <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

      <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <InputGroup class="max-w-md group shadow-sm rounded-xl overflow-hidden">
            <InputGroupAddon class="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
              <i class="pi pi-search text-[10px] text-zinc-400"></i>
            </InputGroupAddon>
            <InputText v-model="searchQuery" placeholder="Cari NIP atau Nama..." class="text-xs p-3 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus:ring-0" />
          </InputGroup>
          
          <div class="flex items-center gap-2">
            <InputNumber v-model="filterTahun" placeholder="Tahun" :useGrouping="false" class="w-24 text-xs h-10 border-zinc-200" />
            <Select v-model="filterRangeNilai" :options="rangeNilaiOptions" optionLabel="label" optionValue="value" placeholder="Range" class="text-xs h-10 w-40 border-zinc-200" />
            <Button icon="pi pi-filter" text class="p-2 text-zinc-400 hover:text-zinc-900" @click="loadData" />
          </div>
        </div>
        
        <div class="flex gap-8">
          <div v-for="(val, label) in statsSummary" :key="label" class="flex flex-col items-end">
            <span class="text-[9px] uppercase font-black text-zinc-400 tracking-widest">{{ label }}</span>
            <span class="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <DataTable :value="items" :loading="loading" :pt="tablePT" paginator :rows="10">
        <Column header="Profil Pegawai">
          <template #body="{ data }">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-400 text-[10px]">
                    {{ data.pegawai?.nama?.substring(0,2).toUpperCase() }}
                </div>
                <div class="flex flex-col">
                  <span class="font-black text-zinc-800 dark:text-zinc-200 tracking-tight text-sm uppercase">{{ data.pegawai?.nama }}</span>
                  <span class="text-[10px] font-mono text-zinc-400 tracking-tighter">NIP: {{ data.pegawai?.nip || '-' }}</span>
                </div>
            </div>
          </template>
        </Column>
        
        <Column field="tahun" header="Tahun" class="text-xs font-bold text-zinc-600" />
        <Column field="periode" header="Periode" class="text-xs text-zinc-500" />

        <Column header="Evaluasi">
          <template #body="{ data }">
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-black text-zinc-900">{{ data.nilai }}</span>
                <div class="h-1 w-12 bg-zinc-100 rounded-full overflow-hidden">
                  <div class="h-full bg-zinc-900" :style="{ width: data.nilai + '%' }"></div>
                </div>
              </div>
              <Tag :value="getKategoriNilai(data.nilai)" :pt="tagPT(data.nilai)" />
            </div>
          </template>
        </Column>

        <Column field="penilai" header="Penilai" class="text-[10px] uppercase font-bold text-zinc-400" />

        <Column header="Action" class="w-[120px]" bodyClass="text-right">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-1">
              <Button icon="pi pi-eye" text rounded class="p-button-sm text-zinc-400 hover:text-blue-500" @click="viewDetail(data)" />
              <Button icon="pi pi-pencil" text rounded class="p-button-sm text-zinc-400 hover:text-zinc-950" @click="openEditModal(data)" />
              <Button icon="pi pi-trash" text rounded severity="danger" class="p-button-sm text-zinc-300 hover:text-red-500" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showDialog" :header="isEditing ? 'REVISI PENILAIAN' : 'TAMBAH PENILAIAN'" :pt="dialogPT" modal :style="{ width: '550px' }">
      <div class="flex flex-col gap-6 py-6">
        <div class="flex flex-col gap-3">
          <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Employee <span class="text-red-500">*</span></label>
          <Select v-model="form.pegawai_id" :options="pegawaiOptions" optionLabel="label" optionValue="value" filter placeholder="Cari nama pegawai..." class="w-full text-xs border-zinc-200 bg-zinc-50/50 rounded-xl h-14 flex items-center px-2" />
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Tahun <span class="text-red-500">*</span></label>
            <InputNumber v-model="form.tahun" :useGrouping="false" class="w-full text-xs p-2 border-zinc-200 bg-zinc-50/50 rounded-xl" />
          </div>
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Nilai (0-100) <span class="text-red-500">*</span></label>
            <InputNumber v-model="form.nilai" :min="0" :max="100" class="w-full text-xs p-2 border-zinc-200 bg-zinc-50/50 rounded-xl font-bold" />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Periode & Penilai</label>
          <div class="flex gap-2">
            <InputText v-model="form.periode" placeholder="Contoh: Semester I" class="flex-1 text-xs p-4 border-zinc-200 rounded-xl" />
            <InputText v-model="form.penilai" placeholder="Nama Penilai" class="flex-1 text-xs p-4 border-zinc-200 rounded-xl" />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Komentar & Catatan</label>
          <Textarea v-model="form.komentar" rows="3" class="w-full text-xs p-4 border-zinc-200 rounded-xl" />
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3 w-full pt-6 border-t border-zinc-50">
          <Button label="Batalkan" text class="text-[10px] font-black uppercase text-zinc-400 px-6" @click="showDialog = false" />
          <Button label="Simpan Penilaian" class="text-[10px] font-black bg-zinc-950 text-white px-10 py-5 rounded-xl border-0 uppercase tracking-widest shadow-2xl" :loading="submitting" @click="saveData" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="showDetailDialog" header="DETAIL PERFORMANCE" :style="{ width: '450px' }" :pt="dialogPT" modal>
       <div class="flex flex-col gap-4 py-6" v-if="detailData">
          <div v-for="(val, label) in detailViewMapping" :key="label" class="flex justify-between items-center border-b border-zinc-50 pb-3">
             <span class="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{{ label }}</span>
             <span class="text-xs font-black text-zinc-800 uppercase">{{ val }}</span>
          </div>
       </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';

// PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// ZINC PASSTHROUGH STYLING
const tablePT = {
  root: { class: 'border border-zinc-200 rounded-2xl overflow-hidden shadow-sm bg-white' },
  thead: { class: 'bg-zinc-50 border-b border-zinc-200' },
  headerCell: { class: 'p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest' },
  bodyRow: { class: 'hover:bg-zinc-50/50 transition-all border-b border-zinc-50 last:border-0' },
  rowCell: { class: 'p-5 text-xs font-medium' }
};

const dialogPT = {
  root: { class: 'border border-zinc-200 bg-white rounded-[2rem] shadow-2xl overflow-hidden' },
  header: { class: 'p-8 pb-0 border-b-0 text-base font-black uppercase tracking-tighter' },
  content: { class: 'px-8' },
  footer: { class: 'p-8' }
};

const tagPT = (nilai) => ({
  root: { 
    class: `text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
      nilai >= 80 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
      nilai >= 70 ? 'bg-amber-50 border-amber-100 text-amber-700' : 
      'bg-zinc-50 border-zinc-100 text-zinc-700'
    }`
  }
});

// LOGIC & STATE
const items = ref([]);
const loading = ref(false);
const submitting = ref(false);
const showDialog = ref(false);
const showDetailDialog = ref(false);
const isEditing = ref(false);
const searchQuery = ref('');
const filterTahun = ref(new Date().getFullYear());
const filterRangeNilai = ref(null);
const pegawaiOptions = ref([]);
const selectedId = ref(null);
const detailData = ref(null);

const form = ref({
  pegawai_id: null,
  tahun: new Date().getFullYear(),
  periode: '',
  nilai: null,
  penilai: '',
  komentar: '',
  rekomendasi: ''
});

const rangeNilaiOptions = [
  { label: 'Sangat Baik (90-100)', value: '90-100' },
  { label: 'Baik (80-89)', value: '80-89' },
  { label: 'Cukup (70-79)', value: '70-79' },
  { label: 'Kurang (<70)', value: '0-69' }
];

const getKategoriNilai = (n) => {
  if (n >= 90) return 'Sangat Baik';
  if (n >= 80) return 'Baik';
  if (n >= 70) return 'Cukup';
  return 'Kurang';
};

const loadData = async () => {
  loading.value = true;
  try {
    let query = supabase.from('penilaian_kinerja').select('*, pegawai(id, nip, nama)');
    if (filterTahun.value) query = query.eq('tahun', filterTahun.value);
    
    const { data } = await query.order('tahun', { ascending: false });
    items.value = data || [];

    const { data: pData } = await supabase.from('pegawai').select('id, nip, nama').order('nama');
    pegawaiOptions.value = pData?.map(p => ({ label: `${p.nip} - ${p.nama}`, value: p.id })) || [];
  } finally {
    loading.value = false;
  }
};

const saveData = async () => {
  if (!form.value.pegawai_id || !form.value.nilai) {
    toast.add({ severity: 'warn', summary: 'Input Error', detail: 'Lengkapi data wajib!' });
    return;
  }
  submitting.value = true;
  try {
    if (isEditing.value) {
      await supabase.from('penilaian_kinerja').update(form.value).eq('id', selectedId.value);
    } else {
      await supabase.from('penilaian_kinerja').insert([form.value]);
    }
    showDialog.value = false;
    await loadData();
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data kinerja disimpan' });
  } finally {
    submitting.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  form.value = { pegawai_id: null, tahun: new Date().getFullYear(), periode: '', nilai: null, penilai: '', komentar: '', rekomendasi: '' };
  showDialog.value = true;
};

const openEditModal = (data) => {
  isEditing.value = true;
  selectedId.value = data.id;
  form.value = { ...data };
  delete form.value.pegawai; // Clean relation
  showDialog.value = true;
};

const viewDetail = (row) => {
  detailData.value = row;
  showDetailDialog.value = true;
};

const confirmDelete = async (data) => {
  if (confirm(`Hapus penilaian ${data.pegawai?.nama}?`)) {
    await supabase.from('penilaian_kinerja').delete().eq('id', data.id);
    loadData();
  }
};

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  const q = searchQuery.value.toLowerCase();
  return items.value.filter(i => i.pegawai?.nama?.toLowerCase().includes(q) || i.pegawai?.nip?.includes(q));
});

const statsSummary = computed(() => ({
  'Total Review': items.value.length,
  'Avg Score': items.value.length ? (items.value.reduce((a, b) => a + b.nilai, 0) / items.value.length).toFixed(1) : 0,
  'High Performer': items.value.filter(i => i.nilai >= 90).length
}));

const detailViewMapping = computed(() => {
  if (!detailData.value) return {};
  return {
    'Pegawai': detailData.value.pegawai?.nama,
    'Tahun': detailData.value.tahun,
    'Periode': detailData.value.periode,
    'Nilai': detailData.value.nilai,
    'Predikat': getKategoriNilai(detailData.value.nilai),
    'Penilai': detailData.value.penilai
  };
});

onMounted(loadData);
</script>