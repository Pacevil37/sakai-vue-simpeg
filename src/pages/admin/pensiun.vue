<template>
  <div class="w-full  mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
    
    <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xl shadow-zinc-500/20">
            <i class="pi pi-calendar-times text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span> Termination & Retirement
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0 uppercase">Manajemen Pensiun</h1>
            <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
              Kelola arsip pemberhentian, batas usia pensiun (BUP), dan administrasi purna bakti pegawai.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <Button icon="pi pi-sync" class="p-4 bg-zinc-100 text-zinc-600 border-0 rounded-xl hover:bg-zinc-200 transition-all" @click="loadData" :loading="loading" />
          <Button label="Tambah Data Pensiun" icon="pi pi-plus" class="text-[11px] font-black bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-xl border-0 shadow-lg uppercase tracking-widest" @click="openCreateModal" />
        </div>
      </div>

      <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

      <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <InputGroup class="max-w-md group shadow-sm rounded-xl overflow-hidden">
            <InputGroupAddon class="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
              <i class="pi pi-search text-[10px] text-zinc-400"></i>
            </InputGroupAddon>
            <InputText v-model="searchQuery" placeholder="Cari NIP atau nama pegawai..." class="text-xs p-3 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus:ring-0" @input="debouncedSearch" />
          </InputGroup>
          
          <Select
            v-model="filterJenisPensiun"
            :options="jenisPensiunOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Semua Jenis Pensiun"
            class="text-xs h-11 w-64 border-zinc-200 rounded-xl shadow-sm"
            showClear
            @change="loadData"
          />
        </div>

        <div class="flex gap-8">
          <div class="flex flex-col items-end">
            <span class="text-[9px] uppercase font-black text-zinc-400 tracking-widest">Total Pensiun</span>
            <span class="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">{{ stats.total }}</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-[9px] uppercase font-black text-zinc-400 tracking-widest">BUP</span>
            <span class="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">{{ stats.bup }}</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-[9px] uppercase font-black text-zinc-400 tracking-widest">Janda/Duda</span>
            <span class="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">{{ stats.jandaDuda }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <DataTable :value="items" :loading="loading" :pt="tablePT" paginator :rows="10">
        <Column header="Identitas Pegawai">
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-black text-zinc-800 dark:text-zinc-200 text-sm uppercase tracking-tight">{{ data.pegawai?.nama }}</span>
              <span class="text-[10px] font-mono text-zinc-400 tracking-widest">NIP: {{ data.pegawai?.nip }}</span>
            </div>
          </template>
        </Column>

        <Column header="Jenis Pensiun">
          <template #body="{ data }">
            <Tag :value="getJenisPensiunLabel(data.jenis_pensiun)" :pt="tagPT(data.jenis_pensiun)" />
          </template>
        </Column>

        <Column header="TMT Pensiun">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <i class="pi pi-calendar text-[10px] text-zinc-300"></i>
              <span class="text-xs font-bold text-zinc-600 uppercase">{{ formatDate(data.tmt_pensiun) }}</span>
            </div>
          </template>
        </Column>

        <Column header="Administrasi SK">
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="text-[11px] font-bold text-zinc-700">{{ data.nomor_sk || 'No SK Belum Ada' }}</span>
              <span class="text-[10px] text-zinc-400 italic">Tgl SK: {{ formatDate(data.tanggal_sk) }}</span>
            </div>
          </template>
        </Column>

        <Column header="Action" class="w-[120px]" bodyClass="text-right">
          <template #body="{ data }">
            <div class="flex justify-end gap-2">
              <Button icon="pi pi-pencil" text rounded class="p-button-sm text-zinc-400 hover:text-zinc-950 transition-colors" @click="openEditModal(data)" v-tooltip.top="'Edit Data'" />
              <Button icon="pi pi-trash" text rounded class="p-button-sm text-zinc-300 hover:text-red-600 transition-colors" @click="confirmDelete(data)" v-tooltip.top="'Hapus Data'" />
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="flex flex-col items-center justify-center py-20 gap-4">
            <i class="pi pi-inbox text-4xl text-zinc-100"></i>
            <span class="text-xs font-black text-zinc-400 uppercase tracking-widest">Data pensiun tidak ditemukan</span>
          </div>
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="showDialog" :header="isEditing ? 'MODIFIKASI DATA PENSIUN' : 'REGISTRASI DATA PENSIUN'" :pt="dialogPT" modal :style="{ width: '550px' }">
      <div class="flex flex-col gap-8 py-8">
        
        <div class="flex flex-col gap-3">
          <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Pilih Pegawai <span class="text-red-500">*</span></label>
          <Select
            v-model="form.pegawai_id"
            :options="pegawaiOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Cari NIP atau Nama..."
            class="w-full text-xs h-12 flex items-center px-2 border-zinc-200 bg-zinc-50/50 rounded-xl"
            filter
            :disabled="isEditing"
          />
          <small v-if="errors.pegawai_id" class="text-red-500 text-[10px] font-bold uppercase tracking-tight">{{ errors.pegawai_id }}</small>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Jenis Pensiun <span class="text-red-500">*</span></label>
            <Select
              v-model="form.jenis_pensiun"
              :options="jenisPensiunOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih Jenis"
              class="w-full text-xs h-12 flex items-center px-2 border-zinc-200 rounded-xl"
            />
          </div>

          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">TMT Pensiun <span class="text-red-500">*</span></label>
            <DatePicker v-model="form.tmt_pensiun" dateFormat="yy-mm-dd" placeholder="Pilih Tanggal" class="w-full" inputClass="h-12 text-xs border-zinc-200 rounded-xl" />
          </div>
        </div>

        <div class="h-[1px] w-full bg-zinc-100"></div>

        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Nomor Surat Keputusan (SK)</label>
            <InputText v-model="form.nomor_sk" placeholder="Contoh: 800/123/BKPSDM/2024" class="w-full text-xs p-4 border-zinc-200 rounded-xl" />
          </div>
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Tanggal Penetapan SK</label>
            <DatePicker v-model="form.tanggal_sk" dateFormat="yy-mm-dd" placeholder="Pilih Tanggal Penetapan" class="w-full" inputClass="h-12 text-xs border-zinc-200 rounded-xl" />
          </div>
        </div>

        <div class="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
            <i class="pi pi-info-circle text-amber-600 mt-1"></i>
            <p class="text-[10px] text-amber-700 leading-relaxed font-medium">
              Penetapan status pensiun akan menonaktifkan akun user pegawai tersebut secara otomatis dalam sistem operasional.
            </p>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3 w-full pt-6 border-t border-zinc-50">
          <Button label="Batalkan" text class="text-[10px] font-black uppercase text-zinc-400 px-6" @click="closeDialog" />
          <Button :label="isEditing ? 'Simpan Perubahan' : 'Finalisasi Data Pensiun'" class="text-[10px] font-black bg-zinc-950 text-white px-10 py-5 rounded-xl border-0 uppercase tracking-widest shadow-2xl" :loading="submitting" @click="saveData" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteDialog" header="KONFIRMASI PENGHAPUSAN" :pt="dialogPT" modal :style="{ width: '400px' }">
      <div class="flex flex-col items-center text-center gap-6 py-8">
        <div class="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm font-black text-zinc-900 uppercase">Hapus Data Pensiun?</p>
          <p class="text-xs text-zinc-500 leading-relaxed px-4">
            Menghapus data pensiun <b>{{ selectedItem?.pegawai?.nama }}</b> tidak akan mengaktifkan kembali pegawai tersebut secara otomatis.
          </p>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col gap-3 w-full">
          <Button label="HAPUS PERMANEN" class="w-full bg-red-600 text-white text-[10px] font-black py-4 rounded-xl border-0 uppercase tracking-widest" @click="deleteData" :loading="deleting" />
          <Button label="BATALKAN" text class="w-full text-zinc-400 text-[10px] font-black py-2 uppercase tracking-widest" @click="deleteDialog = false" />
        </div>
      </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';

// UI Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Tag from 'primevue/tag';

const toast = useToast();

// PassThrough Styles (Consistency with User Management)
const tablePT = {
  root: { class: 'border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm' },
  thead: { class: 'bg-zinc-50 border-b border-zinc-200' },
  headerCell: { class: 'p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest' },
  bodyRow: { class: 'hover:bg-zinc-50/50 transition-all border-b border-zinc-50 last:border-0' },
  rowCell: { class: 'p-5 text-xs font-medium' }
};

const dialogPT = {
  root: { class: 'border border-zinc-200 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden' },
  header: { class: 'p-8 pb-0 border-b-0 text-base font-black uppercase tracking-tighter' },
  content: { class: 'px-8' },
  footer: { class: 'p-8 bg-zinc-50/30' }
};

const tagPT = (jenis) => ({
  root: { 
    class: `text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
      jenis === 'bup' ? 'bg-zinc-950 text-white border-zinc-950' : 
      jenis === 'janda_duda' ? 'bg-pink-50 text-pink-700 border-pink-100' : 
      'bg-zinc-50 text-zinc-600 border-zinc-100'
    }`
  }
});

// State
const items = ref([]);
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const showDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const selectedItem = ref(null);
const searchQuery = ref('');
const filterJenisPensiun = ref(null);
const pegawaiOptions = ref([]);
const errors = ref({});

const form = ref({
  pegawai_id: null,
  jenis_pensiun: '',
  tmt_pensiun: null,
  nomor_sk: '',
  tanggal_sk: null
});

const jenisPensiunOptions = [
  { label: 'BUP (Batas Usia Pensiun)', value: 'bup' },
  { label: 'Janda/Duda', value: 'janda_duda' },
  { label: 'Atas Permintaan Sendiri (APS)', value: 'aps' },
  { label: 'Pemberhentian', value: 'pemberhentian' },
  { label: 'Meninggal Dunia', value: 'meninggal_dunia' }
];

// Computed Stats
const stats = computed(() => {
  return {
    total: items.value.length,
    bup: items.value.filter(i => i.jenis_pensiun === 'bup').length,
    jandaDuda: items.value.filter(i => i.jenis_pensiun === 'janda_duda').length
  };
});

// Logic: Load Data
const loadData = async () => {
  loading.value = true;
  try {
    let query = supabase
      .from('pensiun')
      .select('*, pegawai(id, nip, nama)')
      .order('tmt_pensiun', { ascending: false });

    if (filterJenisPensiun.value) {
      query = query.eq('jenis_pensiun', filterJenisPensiun.value);
    }

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];
    if (searchQuery.value) {
      const term = searchQuery.value.toLowerCase();
      filtered = filtered.filter(item => 
        item.pegawai?.nip?.toLowerCase().includes(term) || 
        item.pegawai?.nama?.toLowerCase().includes(term)
      );
    }
    items.value = filtered;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal Load', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Logic: Pegawai Options (Hanya yang belum pensiun jika Tambah)
const loadPegawaiOptions = async () => {
  // Ambil pegawai yang belum ada di tabel pensiun (Opsional, tergantung kebijakan)
  const { data, error } = await supabase
    .from('pegawai')
    .select('id, nama, nip')
    .order('nama');
    
  if (!error && data) {
    pegawaiOptions.value = data.map(p => ({
      label: `${p.nip} - ${p.nama}`,
      value: p.id
    }));
  }
};

// CRUD
const openCreateModal = () => {
  isEditing.value = false;
  form.value = { pegawai_id: null, jenis_pensiun: '', tmt_pensiun: null, nomor_sk: '', tanggal_sk: null };
  errors.value = {};
  showDialog.value = true;
};

const openEditModal = (row) => {
  isEditing.value = true;
  selectedItem.value = row;
  form.value = {
    pegawai_id: row.pegawai_id,
    jenis_pensiun: row.jenis_pensiun,
    tmt_pensiun: row.tmt_pensiun ? new Date(row.tmt_pensiun) : null,
    nomor_sk: row.nomor_sk || '',
    tanggal_sk: row.tanggal_sk ? new Date(row.tanggal_sk) : null
  };
  errors.value = {};
  showDialog.value = true;
};

const validate = () => {
  errors.value = {};
  if (!form.value.pegawai_id) errors.value.pegawai_id = 'Pilih pegawai terlebih dahulu';
  if (!form.value.jenis_pensiun) errors.value.jenis_pensiun = 'Tentukan jenis pensiun';
  if (!form.value.tmt_pensiun) errors.value.tmt_pensiun = 'TMT Pensiun wajib diisi';
  return Object.keys(errors.value).length === 0;
};

const saveData = async () => {
  if (!validate()) return;
  submitting.value = true;
  try {
    const payload = {
      pegawai_id: form.value.pegawai_id,
      jenis_pensiun: form.value.jenis_pensiun,
      tmt_pensiun: toYMD(form.value.tmt_pensiun),
      nomor_sk: form.value.nomor_sk || null,
      tanggal_sk: toYMD(form.value.tanggal_sk)
    };

    if (isEditing.value) {
      const { error } = await supabase.from('pensiun').update(payload).eq('id', selectedItem.value.id);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data pensiun diperbarui' });
    } else {
      const { error } = await supabase.from('pensiun').insert([payload]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data pensiun diregistrasi' });
    }
    showDialog.value = false;
    loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal Simpan', detail: err.message });
  } finally {
    submitting.value = false;
  }
};

const deleteData = async () => {
  deleting.value = true;
  try {
    const { error } = await supabase.from('pensiun').delete().eq('id', selectedItem.value.id);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Terhapus', detail: 'Data pensiun berhasil dihapus' });
    deleteDialog.value = false;
    loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal Hapus', detail: err.message });
  } finally {
    deleting.value = false;
  }
};

// Utils
const formatDate = (date) => date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const toYMD = (date) => date ? new Date(date).toISOString().split('T')[0] : null;
const getJenisPensiunLabel = (val) => jenisPensiunOptions.find(o => o.value === val)?.label || val;
const closeDialog = () => { showDialog.value = false; selectedItem.value = null; };
const confirmDelete = (row) => { selectedItem.value = row; deleteDialog.value = true; };

onMounted(() => {
  loadPegawaiOptions();
  loadData();
});
</script>

<style scoped>
:deep(.p-datatable-wrapper) {
  @apply rounded-2xl border border-zinc-100;
}

:deep(.p-datepicker input) {
  @apply border-zinc-200 focus:border-zinc-950;
}
</style>