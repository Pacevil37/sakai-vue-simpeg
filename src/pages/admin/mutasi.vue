<template>
  <div class="w-full  mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
    
    <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-xl shadow-zinc-500/10">
            <i class="pi pi-sort-alt text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Personnel Movement System v2.0
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0 uppercase">Manajemen Mutasi Pegawai</h1>
            <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
              Sistem otomatisasi perpindahan unit kerja dengan sinkronisasi database relasional dan validasi unit tujuan secara real-time.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
            <Button icon="pi pi-sync" class="p-4 bg-zinc-100 text-zinc-600 border-0 rounded-xl hover:bg-zinc-200 transition-all" @click="fetchInitialData" />
            <Button label="Registrasi Mutasi" icon="pi pi-plus" class="text-xs font-black bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-xl border-0 shadow-lg uppercase tracking-widest" @click="openCreateModal" />
        </div>
      </div>

      <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

      <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
        <InputGroup class="max-w-md group shadow-sm rounded-xl overflow-hidden">
          <InputGroupAddon class="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            <i class="pi pi-search text-[10px] text-zinc-400"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari NIP atau Nama Pegawai..." class="text-xs p-3 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus:ring-0" />
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
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-2 text-zinc-400">
            <i class="pi pi-database text-[10px]"></i>
            <span class="text-[10px] font-bold uppercase tracking-[0.3em]">Database Records</span>
        </div>
        <div class="text-[10px] font-bold text-zinc-400 uppercase italic">Sorted by Latest Update</div>
      </div>
      
      <DataTable 
        :value="filteredItems" 
        :loading="loading" 
        :pt="tablePT" 
        paginator 
        :rows="10" 
        responsiveLayout="stack"
        class="shadow-xl shadow-zinc-500/5"
      >
        <Column header="Profil Pegawai">
          <template #body="{ data }">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-400 text-[10px]">
                    {{ data.pegawai?.nama?.substring(0,2).toUpperCase() }}
                </div>
                <div class="flex flex-col">
                  <span class="font-black text-zinc-800 dark:text-zinc-200 tracking-tight text-sm uppercase">{{ data.pegawai?.nama }}</span>
                  <span class="text-[10px] font-mono text-zinc-400 tracking-tighter">ID: {{ data.pegawai?.nip || data.pegawai_id }}</span>
                </div>
            </div>
          </template>
        </Column>
        
        <Column header="Alur Mutasi">
          <template #body="{ data }">
            <div class="flex items-center gap-3 font-bold">
              <div class="flex flex-col items-end">
                  <span class="text-[9px] text-zinc-400 uppercase tracking-tighter">Asal</span>
                  <span class="text-xs text-zinc-600">{{ data.dari_unit }}</span>
              </div>
              <div class="px-2 py-1 rounded-full bg-zinc-50 border border-zinc-100">
                  <i class="pi pi-arrow-right text-[8px] text-zinc-400"></i>
              </div>
              <div class="flex flex-col items-start">
                  <span class="text-[9px] text-zinc-950 uppercase tracking-tighter">Tujuan</span>
                  <Tag :value="data.ke_unit" class="bg-zinc-950 text-white text-[9px] px-2 py-0.5 rounded-md uppercase" />
              </div>
            </div>
          </template>
        </Column>

        <Column header="Validitas SK" class="w-[200px]">
            <template #body="{ data }">
                <div class="flex flex-col gap-1">
                    <span class="text-xs font-black text-zinc-700 uppercase">{{ data.tanggal_mutasi }}</span>
                    <a v-if="data.surat_sk_file" :href="data.surat_sk_file" target="_blank" class="text-[9px] text-blue-500 font-bold hover:underline">LIHAT DOKUMEN SK <i class="pi pi-external-link ml-1"></i></a>
                    <span v-else class="text-[9px] text-zinc-300 italic uppercase">Dokumen belum diunggah</span>
                </div>
            </template>
        </Column>

        <Column header="Action" class="w-[100px]" bodyClass="text-right">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-2">
              <Button icon="pi pi-pencil" text rounded class="p-button-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950" @click="openEditModal(data)" />
              <Button icon="pi pi-trash" text rounded severity="danger" class="p-button-sm text-zinc-300 hover:text-red-500" @click="confirmDelete(data.id)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog 
        v-model:visible="showDialog" 
        :header="isEditing ? 'REVISI DATA MUTASI' : 'REGISTRASI MUTASI BARU'" 
        :pt="dialogPT" 
        modal 
        :style="{ width: '600px' }"
        :closable="!submitting"
    >
      <div class="flex flex-col gap-8 py-6">
        
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Select Employee <span class="text-red-500 text-base">*</span></label>
              <span v-if="form.pegawai_id" class="text-[9px] font-bold text-emerald-500 uppercase bg-emerald-50 px-2 py-0.5 rounded">UUID Verified</span>
          </div>
          <Select 
            v-model="form.pegawai_id" 
            :options="pegawaiOptions" 
            optionLabel="label" 
            optionValue="value" 
            filter 
            placeholder="Pilih Pegawai untuk menarik data unit asal..." 
            class="w-full text-xs border-zinc-200 bg-zinc-50/50 rounded-xl h-14 flex items-center px-2"
            :class="{ 'p-invalid': errors.pegawai_id }"
            @change="(e) => handlePegawaiSync(e.value)"
          />
          <small v-if="errors.pegawai_id" class="text-[9px] text-red-500 font-bold uppercase tracking-widest">{{ errors.pegawai_id }}</small>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Unit Asal (System Get)</label>
            <div class="relative">
                <InputText 
                    v-model="form.dari_unit" 
                    placeholder="Auto-detected..." 
                    readonly 
                    class="w-full text-xs p-4 bg-zinc-100 border-zinc-200 text-zinc-400 font-bold rounded-xl italic cursor-not-allowed" 
                />
                <i v-if="loadingOrigin" class="pi pi-spin pi-spinner absolute right-4 top-4 text-zinc-400"></i>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Unit Tujuan (DB Select) <span class="text-red-500 text-base">*</span></label>
            <Select 
                v-model="form.ke_unit" 
                :options="unitOptions" 
                optionLabel="label" 
                optionValue="label" 
                filter 
                placeholder="Pilih Unit Baru..." 
                class="w-full text-xs border-zinc-200 bg-zinc-50/50 rounded-xl h-14 flex items-center px-2"
                :class="{ 'p-invalid': errors.ke_unit }" 
            />
            <small v-if="errors.ke_unit" class="text-[9px] text-red-500 font-bold uppercase tracking-widest">{{ errors.ke_unit }}</small>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">TMT Efektif <span class="text-red-500 text-base">*</span></label>
            <DatePicker 
                v-model="form.tanggal_mutasi" 
                dateFormat="yy-mm-dd" 
                placeholder="Pilih Tanggal" 
                showIcon
                class="w-full text-xs rounded-xl" 
                :class="{ 'p-invalid': errors.tanggal_mutasi }" 
            />
          </div>
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Dokumen SK (URL/Cloud)</label>
            <InputText v-model="form.surat_sk_file" placeholder="https://drive.google.com/..." class="w-full text-xs p-4 border-zinc-200 bg-zinc-50/50 rounded-xl font-mono text-blue-600" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3 w-full pt-6 border-t border-zinc-50">
          <Button label="Batalkan" text class="text-[10px] font-black uppercase text-zinc-400 px-6" @click="showDialog = false" />
          <Button 
            :label="isEditing ? 'Perbarui Data Mutasi' : 'Submit ke Database'" 
            class="text-[10px] font-black bg-zinc-950 text-white px-10 py-5 rounded-xl border-0 uppercase tracking-widest shadow-2xl shadow-zinc-500/40" 
            :loading="submitting" 
            @click="handleSave" 
          />
        </div>
      </template>
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
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// Reactive States
const items = ref([]);
const pegawaiOptions = ref([]);
const unitOptions = ref([]); // Untuk Unit Tujuan dari DB
const loading = ref(false);
const loadingOrigin = ref(false);
const submitting = ref(false);
const showDialog = ref(false);
const isEditing = ref(false);
const searchQuery = ref('');
const selectedId = ref(null);
const errors = ref({});

const form = ref({
  pegawai_id: null,
  dari_unit: '',
  ke_unit: '',
  tanggal_mutasi: null,
  surat_sk_file: ''
});

// --- UI CONFIGURATION (PASSTHROUGH) ---
const tablePT = {
  root: { class: 'border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm bg-white' },
  thead: { class: 'bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200' },
  headerCell: { class: 'p-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest' },
  bodyRow: { class: 'hover:bg-zinc-50/50 transition-all border-b border-zinc-50 last:border-0' },
  rowCell: { class: 'p-5 text-xs font-medium' }
};

const dialogPT = {
  root: { class: 'border border-zinc-200 bg-white dark:bg-zinc-950 rounded-[2rem] shadow-2xl overflow-hidden' },
  header: { class: 'p-8 pb-0 border-b-0' },
  title: { class: 'text-base font-black text-zinc-950 uppercase tracking-tighter' },
  content: { class: 'px-8' },
  footer: { class: 'p-8' }
};

// --- LOGIC: FETCHING DATA ---
const fetchInitialData = async () => {
  loading.value = true;
  try {
    // 1. Fetch Records Mutasi dengan Relasi Pegawai
    const { data: mutasiData, error: mError } = await supabase
      .from('mutasi')
      .select('*, pegawai(id, nip, nama)')
      .order('created_at', { ascending: false });
    
    if (mError) throw mError;
    items.value = mutasiData || [];

    // 2. Fetch Master Pegawai untuk Dropdown
    const { data: pData } = await supabase
      .from('pegawai')
      .select('id, nip, nama')
      .order('nama');
    
    pegawaiOptions.value = pData?.map(p => ({ 
      label: `${p.nip || 'No NIP'} - ${p.nama}`, 
      value: p.id 
    })) || [];

    // 3. Fetch Master Units untuk Unit Tujuan (Ganti Input Manual ke Dropdown)
    const { data: uData } = await supabase
      .from('units')
      .select('id, name')
      .order('name');
    
    unitOptions.value = uData?.map(u => ({
        label: u.name,
        value: u.id
    })) || [];

  } catch (err) {
    toast.add({ severity: 'error', summary: 'System Error', detail: err.message });
  } finally {
    loading.value = false;
  }
};

// --- LOGIC: AUTO-SYNC UNIT ASAL ---
const handlePegawaiSync = async (pegawaiId) => {
  if (!pegawaiId) {
    form.value.dari_unit = '';
    return;
  }

  loadingOrigin.value = true;
  try {
    // Mencari unit terakhir pegawai dari tabel pegawai JOIN units
    const { data, error } = await supabase
      .from('pegawai')
      .select(`
        id,
        units (name)
      `)
      .eq('id', pegawaiId)
      .single();

    if (error) throw error;

    if (data && data.units) {
      form.value.dari_unit = data.units.name;
      toast.add({ severity: 'success', summary: 'Origin Linked', detail: `Unit saat ini: ${data.units.name}`, life: 2000 });
    } else {
      form.value.dari_unit = 'UNASSIGNED';
    }
  } catch (err) {
    console.error("Fetch Error:", err);
    form.value.dari_unit = 'NOT FOUND';
  } finally {
    loadingOrigin.value = false;
  }
};

// --- CRUD HANDLERS ---
const openCreateModal = () => {
  isEditing.value = false;
  selectedId.value = null;
  form.value = { 
    pegawai_id: null, 
    dari_unit: '', 
    ke_unit: '', 
    tanggal_mutasi: null, 
    surat_sk_file: '' 
  };
  errors.value = {};
  showDialog.value = true;
};

const openEditModal = (data) => {
  isEditing.value = true;
  selectedId.value = data.id;
  form.value = { 
    ...data, 
    tanggal_mutasi: data.tanggal_mutasi ? new Date(data.tanggal_mutasi) : null 
  };
  errors.value = {};
  showDialog.value = true;
};

const handleSave = async () => {
  // Clear & Validate
  errors.value = {};
  if (!form.value.pegawai_id) errors.value.pegawai_id = "Wajib memilih pegawai";
  if (!form.value.ke_unit) errors.value.ke_unit = "Wajib menentukan unit tujuan";
  if (!form.value.tanggal_mutasi) errors.value.tanggal_mutasi = "Tentukan tanggal efektif";

  if (Object.keys(errors.value).length > 0) return;

  submitting.value = true;
  try {
    const payload = {
      pegawai_id: form.value.pegawai_id,
      dari_unit: form.value.dari_unit,
      ke_unit: form.value.ke_unit,
      tanggal_mutasi: form.value.tanggal_mutasi.toISOString().split('T')[0],
      surat_sk_file: form.value.surat_sk_file,
      updated_at: new Date().toISOString()
    };

    if (isEditing.value) {
      const { error } = await supabase.from('mutasi').update(payload).eq('id', selectedId.value);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Mutasi diperbarui' });
    } else {
      const { error } = await supabase.from('mutasi').insert([payload]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Success', detail: 'Mutasi terdaftar' });
    }
    
    showDialog.value = false;
    await fetchInitialData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'DB Error', detail: err.message });
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (id) => {
    if(confirm('Data mutasi akan dihapus permanen. Lanjutkan?')) {
        const { error } = await supabase.from('mutasi').delete().eq('id', id);
        if(!error) {
            toast.add({ severity: 'info', summary: 'Deleted', detail: 'Data dihapus' });
            fetchInitialData();
        }
    }
};

// --- COMPUTED ---
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  const q = searchQuery.value.toLowerCase();
  return items.value.filter(i => 
    i.pegawai?.nama?.toLowerCase().includes(q) || 
    i.pegawai?.nip?.includes(q)
  );
});

const stats = computed(() => ({
  'Total Record': items.value.length,
  'Database': 'PostgreSQL',
  'Last Sync': new Date().toLocaleTimeString()
}));

onMounted(fetchInitialData);
</script>