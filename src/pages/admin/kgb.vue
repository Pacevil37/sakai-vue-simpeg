<template>
  <div class="w-full  mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
    
    <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xl shadow-amber-500/20">
            <i class="pi pi-chart-line text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Financial Progression System v2.1
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0 uppercase">Manajemen KGB</h1>
            <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
              Sistem Kenaikan Gaji Berkala dengan validasi otomatis terhadap riwayat gaji terakhir di database.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
            <Button icon="pi pi-sync" class="p-4 bg-zinc-100 text-zinc-600 border-0 rounded-xl hover:bg-zinc-200 transition-all" @click="loadData" :loading="loading" />
            <Button label="Registrasi KGB" icon="pi pi-plus" class="text-xs font-black bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-xl border-0 shadow-lg uppercase tracking-widest" @click="openCreateModal" />
        </div>
      </div>

      <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

      <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
        <InputGroup class="max-w-md group shadow-sm rounded-xl overflow-hidden">
          <InputGroupAddon class="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            <i class="pi pi-search text-[10px] text-zinc-400"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari NIP, Nama, atau No. SK..." class="text-xs p-3 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus:ring-0" />
        </InputGroup>
        
        <div class="flex gap-10">
          <div v-for="(val, key) in stats" :key="key" class="flex flex-col items-end">
            <span class="text-[9px] uppercase font-black text-zinc-400 tracking-widest">{{ key }}</span>
            <span class="text-base font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <DataTable :value="filteredItems" :loading="loading" :pt="tablePT" paginator :rows="10">
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
        
        <Column header="Nominal Gaji">
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="text-[10px] text-zinc-400 line-through font-bold">{{ formatRupiah(data.gaji_lama) }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-emerald-600">{{ formatRupiah(data.gaji_baru) }}</span>
                <i class="pi pi-arrow-up text-[8px] text-emerald-500"></i>
              </div>
            </div>
          </template>
        </Column>

        <Column field="nomor_sk" header="Keterangan SK" class="text-xs font-medium text-zinc-500" />

        <Column header="TMT Efektif" class="w-[150px]">
          <template #body="{ data }">
            <Tag :value="formatDate(data.tmt_kgb)" class="bg-zinc-900 text-white text-[9px] px-3 py-1 rounded-lg uppercase font-bold" />
          </template>
        </Column>

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

    <Dialog v-model:visible="showDialog" :header="isEditing ? 'REVISI DATA KGB' : 'REGISTRASI KGB BARU'" :pt="dialogPT" modal :style="{ width: '600px' }">
      <div class="flex flex-col gap-8 py-6">
        <div class="flex flex-col gap-3">
          <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Employee <span class="text-red-500">*</span></label>
          <Select 
            v-model="form.pegawai_id" 
            :options="pegawaiOptions" 
            optionLabel="label" 
            optionValue="value" 
            filter 
            placeholder="Cari pegawai untuk tarik gaji lama..." 
            class="w-full text-xs border-zinc-200 bg-zinc-50/50 rounded-xl h-14 flex items-center px-2"
            :class="{ 'p-invalid': errors.pegawai_id }"
            @change="(e) => fetchLastGaji(e.value)"
          />
          <small v-if="errors.pegawai_id" class="text-[9px] text-red-500 font-bold uppercase">{{ errors.pegawai_id }}</small>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Nomor SK</label>
            <InputText v-model="form.nomor_sk" placeholder="800/KGB/..." class="w-full text-xs p-4 border-zinc-200 bg-zinc-50/50 rounded-xl" />
          </div>
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Tanggal SK</label>
            <DatePicker v-model="form.tanggal_sk" dateFormat="yy-mm-dd" class="w-full text-xs rounded-xl" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Gaji Lama (System)</label>
            <div class="relative">
              <InputNumber v-model="form.gaji_lama" mode="currency" currency="IDR" locale="id-ID" readonly class="w-full text-xs bg-zinc-100 rounded-xl font-bold" />
              <i v-if="loadingLastGaji" class="pi pi-spin pi-spinner absolute right-4 top-4 text-zinc-400"></i>
            </div>
          </div>
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Gaji Baru <span class="text-red-500">*</span></label>
            <InputNumber v-model="form.gaji_baru" mode="currency" currency="IDR" locale="id-ID" class="w-full text-xs rounded-xl font-bold" :class="{ 'p-invalid': errors.gaji_baru }" />
            <small v-if="errors.gaji_baru" class="text-[9px] text-red-500 font-bold uppercase">{{ errors.gaji_baru }}</small>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">TMT KGB (Efektif) <span class="text-red-500">*</span></label>
          <DatePicker v-model="form.tmt_kgb" dateFormat="yy-mm-dd" showIcon class="w-full text-xs rounded-xl" :class="{ 'p-invalid': errors.tmt_kgb }" />
          <small v-if="errors.tmt_kgb" class="text-[9px] text-red-500 font-bold uppercase">{{ errors.tmt_kgb }}</small>
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3 w-full pt-6 border-t border-zinc-50">
          <Button label="Batalkan" text class="text-[10px] font-black uppercase text-zinc-400 px-6" @click="closeDialog" />
          <Button label="Simpan Record" class="text-[10px] font-black bg-zinc-950 text-white px-10 py-5 rounded-xl border-0 uppercase tracking-widest shadow-2xl" :loading="submitting" @click="saveData" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="showDetailDialog" header="DETAIL RECORD KGB" :style="{ width: '450px' }" :pt="dialogPT" modal>
       <div class="flex flex-col gap-4 py-4" v-if="detailData">
          <div v-for="(val, label) in detailViewMapping" :key="label" class="flex justify-between items-center border-b border-zinc-50 pb-3">
             <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{{ label }}</span>
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

// PrimeVue Imports
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// ZINC DESIGN PASSTHROUGH
const tablePT = {
  root: { class: 'border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm bg-white' },
  thead: { class: 'bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200' },
  headerCell: { class: 'p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest' },
  bodyRow: { class: 'hover:bg-zinc-50/50 transition-all border-b border-zinc-50 last:border-0' },
  rowCell: { class: 'p-5 text-xs font-medium' }
};

const dialogPT = {
  root: { class: 'border border-zinc-200 bg-white dark:bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden' },
  header: { class: 'p-8 pb-0 border-b-0 text-base font-black uppercase tracking-tighter' },
  content: { class: 'px-8' },
  footer: { class: 'p-8' }
};

// STATE
const items = ref([]);
const loading = ref(false);
const submitting = ref(false);
const loadingLastGaji = ref(false);
const showDialog = ref(false);
const showDetailDialog = ref(false);
const isEditing = ref(false);
const searchQuery = ref('');
const pegawaiOptions = ref([]);
const selectedId = ref(null);
const detailData = ref(null);
const errors = ref({});

const form = ref({
  pegawai_id: null,
  nomor_sk: '',
  tanggal_sk: null,
  gaji_lama: null,
  gaji_baru: null,
  tmt_kgb: null
});

// UTILITY
const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
const formatDate = (date) => date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

// LOGIC: FETCH GAJI TERAKHIR (AUTO-SYNC)
const fetchLastGaji = async (pegawaiId) => {
  if (!pegawaiId) return;
  loadingLastGaji.value = true;
  try {
    const { data, error } = await supabase
      .from('kgb')
      .select('gaji_baru')
      .eq('pegawai_id', pegawaiId)
      .order('tmt_kgb', { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      form.value.gaji_lama = data.gaji_baru;
      form.value.gaji_baru = Math.floor(data.gaji_baru * 1.1); // Prediksi kenaikan 10%
    } else {
      form.value.gaji_lama = 0;
    }
  } catch (err) {
    form.value.gaji_lama = 0;
  } finally {
    loadingLastGaji.value = false;
  }
};

// LOGIC: LOAD DATA & OPTIONS
const loadData = async () => {
  loading.value = true;
  try {
    const { data: kgbData } = await supabase
      .from('kgb')
      .select('*, pegawai(id, nip, nama)')
      .order('tmt_kgb', { ascending: false });
    items.value = kgbData || [];
    
    const { data: pData } = await supabase.from('pegawai').select('id, nip, nama').order('nama');
    pegawaiOptions.value = pData?.map(p => ({ label: `${p.nip} - ${p.nama}`, value: p.id })) || [];
  } finally {
    loading.value = false;
  }
};

// LOGIC: SAVE WITH VALIDATION
const saveData = async () => {
  errors.value = {};
  if (!form.value.pegawai_id) errors.value.pegawai_id = 'Pilih pegawai';
  if (!form.value.gaji_baru) errors.value.gaji_baru = 'Isi nominal gaji baru';
  if (!form.value.tmt_kgb) errors.value.tmt_kgb = 'Tentukan TMT';

  if (Object.keys(errors.value).length > 0) return;

  submitting.value = true;
  try {
    const payload = {
      pegawai_id: form.value.pegawai_id,
      nomor_sk: form.value.nomor_sk,
      tanggal_sk: form.value.tanggal_sk?.toISOString().split('T')[0],
      gaji_lama: form.value.gaji_lama,
      gaji_baru: form.value.gaji_baru,
      tmt_kgb: form.value.tmt_kgb?.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };

    if (isEditing.value) {
      await supabase.from('kgb').update(payload).eq('id', selectedId.value);
    } else {
      await supabase.from('kgb').insert([payload]);
    }
    showDialog.value = false;
    await loadData();
    toast.add({ severity: 'success', summary: 'Success', detail: 'Data KGB Berhasil Disimpan' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err.message });
  } finally {
    submitting.value = false;
  }
};

// ACTIONS
const openCreateModal = () => {
  isEditing.value = false;
  selectedId.value = null;
  form.value = { pegawai_id: null, nomor_sk: '', tanggal_sk: null, gaji_lama: null, gaji_baru: null, tmt_kgb: null };
  errors.value = {};
  showDialog.value = true;
};

const openEditModal = (data) => {
  isEditing.value = true;
  selectedId.value = data.id;
  form.value = { 
    ...data, 
    tanggal_sk: data.tanggal_sk ? new Date(data.tanggal_sk) : null,
    tmt_kgb: data.tmt_kgb ? new Date(data.tmt_kgb) : null 
  };
  errors.value = {};
  showDialog.value = true;
};

const viewDetail = (row) => {
  detailData.value = row;
  showDetailDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  errors.value = {};
};

const confirmDelete = async (data) => {
  if (confirm(`Hapus record KGB untuk ${data.pegawai?.nama}?`)) {
    await supabase.from('kgb').delete().eq('id', data.id);
    loadData();
    toast.add({ severity: 'info', summary: 'Deleted', detail: 'Record berhasil dihapus' });
  }
};

// COMPUTED LOGIC
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  const q = searchQuery.value.toLowerCase();
  return items.value.filter(i => 
    i.pegawai?.nama?.toLowerCase().includes(q) || 
    i.pegawai?.nip?.includes(q) || 
    i.nomor_sk?.toLowerCase().includes(q)
  );
});

const stats = computed(() => {
  const total = items.value.length;
  const totalGajiBaru = items.value.reduce((acc, curr) => acc + (curr.gaji_baru || 0), 0);
  return {
    'Total Records': total,
    'Avg Progression': total > 0 ? formatRupiah(totalGajiBaru / total) : 'Rp 0'
  };
});

const detailViewMapping = computed(() => {
  if (!detailData.value) return {};
  return {
    'Nama Pegawai': detailData.value.pegawai?.nama,
    'NIP': detailData.value.pegawai?.nip,
    'Nomor SK': detailData.value.nomor_sk || 'N/A',
    'Tanggal SK': formatDate(detailData.value.tanggal_sk),
    'Gaji Lama': formatRupiah(detailData.value.gaji_lama),
    'Gaji Baru': formatRupiah(detailData.value.gaji_baru),
    'TMT Efektif': formatDate(detailData.value.tmt_kgb)
  };
});

onMounted(loadData);
</script>