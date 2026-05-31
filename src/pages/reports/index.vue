<template>
  <div class="w-full mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
    
    <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xl shadow-zinc-500/20">
            <i class="pi pi-chart-bar text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span> Analytics & Reporting
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0 uppercase">Manajemen Laporan</h1>
            <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
              Ekstraksi data kepegawaian ke dalam format Excel/CSV dengan filter parameter dinamis.
            </p>
          </div>
        </div>
      </div>

      <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

      <div class="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 w-fit rounded-xl">
        <button 
          v-for="tab in ['generate', 'schedule']" 
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all',
            activeTab === tab ? 'bg-white dark:bg-zinc-700 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'
          ]"
        >
          {{ tab === 'generate' ? 'Generate Laporan' : 'Jadwal Laporan' }}
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'generate'" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-4 flex flex-col gap-6">
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col gap-6">
          <h3 class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <i class="pi pi-sliders-h text-indigo-500"></i> Parameter Laporan
          </h3>
          
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-zinc-400 uppercase">Jenis Laporan</label>
            <Select v-model="reportType" :options="reportTypes" optionLabel="label" optionValue="value" placeholder="Pilih Jenis" class="w-full text-xs h-12 flex items-center px-2 border-zinc-200 rounded-xl" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-zinc-400 uppercase">Format Output</label>
            <Select v-model="reportFormat" :options="formatOptions" optionLabel="label" optionValue="value" class="w-full text-xs h-12 flex items-center px-2 border-zinc-200 rounded-xl" />
          </div>

          <div class="h-[1px] bg-zinc-100 w-full my-2"></div>

          <div v-if="reportType" class="flex flex-col gap-4 animate-fade-in">
            <div v-if="reportType === 'pegawai'" class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black text-zinc-400 uppercase">Unit Kerja</label>
                <Select v-model="filtersPegawai.unit_kerja_id" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Semua Unit" class="text-xs h-11" showClear />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-[10px] font-black text-zinc-400 uppercase">Status Pegawai</label>
                <Select v-model="filtersPegawai.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Semua Status" class="text-xs h-11" showClear />
              </div>
            </div>

            <div v-if="reportType === 'cuti'" class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-zinc-400 uppercase">Status Cuti</label>
              <Select v-model="filtersCuti.status" :options="cutiStatusOptions" optionLabel="label" optionValue="value" class="text-xs h-11" showClear />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-zinc-400 uppercase">Rentang Waktu</label>
              <DatePicker v-model="dateRange" selectionMode="range" placeholder="Pilih Periode" class="w-full" inputClass="h-11 text-xs border-zinc-200 rounded-xl" />
            </div>
          </div>

          <div class="flex flex-col gap-3 mt-4">
            <Button label="PREVIEW DATA" icon="pi pi-eye" class="text-[10px] font-black w-full py-4 bg-zinc-100 text-zinc-900 border-0 rounded-xl uppercase tracking-widest" @click="previewReport" :disabled="!reportType" />
            <Button label="GENERATE & DOWNLOAD" icon="pi pi-download" class="text-[10px] font-black w-full py-4 bg-zinc-950 text-white border-0 rounded-xl uppercase tracking-widest shadow-lg shadow-zinc-500/20" @click="generateReport" :loading="generating" :disabled="!reportType" />
          </div>
        </div>
      </div>

      <div class="lg:col-span-8">
        <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden h-full">
           <div class="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Data Preview (20 Baris Teratas)</h3>
              <Tag v-if="previewData.length" :value="`${previewData.length} baris ditemukan`" class="bg-zinc-950 text-white text-[9px]" />
           </div>
           
           <DataTable :value="previewData" :pt="tablePT" scrollable scrollHeight="600px">
              <Column v-for="col in previewColumns" :key="col" :field="col" :header="formatColumnLabel(col)" class="whitespace-nowrap" />
              <template #empty>
                <div class="flex flex-col items-center justify-center py-40 gap-4">
                  <i class="pi pi-filter-slash text-4xl text-zinc-100"></i>
                  <span class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Silahkan pilih filter dan klik preview</span>
                </div>
              </template>
           </DataTable>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'schedule'" class="animate-fade-in">
       <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
          <div class="p-8 border-b border-zinc-100 flex justify-between items-center">
            <h3 class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Daftar Penjadwalan Laporan</h3>
            <Button label="Tambah Jadwal" icon="pi pi-plus" class="text-[10px] font-black bg-zinc-950 text-white px-6 py-3 rounded-xl border-0" @click="openScheduleDialog" />
          </div>

          <DataTable :value="schedules" :loading="loadingSchedules" :pt="tablePT">
            <Column header="Laporan">
              <template #body="{ data }">
                <span class="font-black text-zinc-800 text-xs uppercase">{{ getReportLabel(data.report_type) }}</span>
              </template>
            </Column>
            <Column field="format" header="Format" class="uppercase font-bold" />
            <Column header="Jadwal Eksekusi">
              <template #body="{ data }">
                <div class="flex items-center gap-2 text-zinc-500">
                   <i class="pi pi-clock text-[10px]"></i>
                   <span class="text-xs">{{ formatDateTime(data.schedule_date) }}</span>
                </div>
              </template>
            </Column>
            <Column header="Action" class="w-[100px]">
              <template #body="{ data }">
                <Button icon="pi pi-trash" text rounded class="text-zinc-300 hover:text-red-600 transition-colors" @click="deleteSchedule(data.id)" />
              </template>
            </Column>
          </DataTable>
       </div>
    </div>

    <Dialog v-model:visible="scheduleDialogVisible" header="PENJADWALAN LAPORAN OTOMATIS" :pt="dialogPT" modal :style="{ width: '500px' }">
      <div class="flex flex-col gap-6 py-6">
        <div class="flex flex-col gap-2">
          <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Jenis Laporan</label>
          <Select v-model="newSchedule.report_type" :options="reportTypes" optionLabel="label" optionValue="value" class="w-full text-xs h-12" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Format</label>
            <Select v-model="newSchedule.format" :options="formatOptions" optionLabel="label" optionValue="value" class="w-full text-xs h-12" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Waktu Eksekusi</label>
            <Calendar v-model="newSchedule.schedule_date" showTime hourFormat="24" class="w-full" inputClass="h-12 text-xs border-zinc-200 rounded-xl" />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3 pt-4 border-t border-zinc-50">
          <Button label="Batal" text class="text-[10px] font-black uppercase text-zinc-400" @click="scheduleDialogVisible = false" />
          <Button label="SIMPAN JADWAL" class="text-[10px] font-black bg-zinc-950 text-white px-8 py-4 rounded-xl border-0 shadow-lg" @click="saveSchedule" :loading="savingSchedule" />
        </div>
      </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

// UI Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';

const toast = useToast();

// Zinc Styles
const tablePT = {
  root: { class: 'border-0 bg-white' },
  thead: { class: 'bg-zinc-50/50' },
  headerCell: { class: 'p-4 text-[9px] font-black text-zinc-400 uppercase tracking-[0.1em]' },
  rowCell: { class: 'p-4 text-xs font-medium border-zinc-50' }
};

const dialogPT = {
  root: { class: 'border-0 bg-white rounded-[2rem] shadow-2xl overflow-hidden' },
  header: { class: 'p-8 pb-0 text-[11px] font-black uppercase tracking-widest text-zinc-900' },
  content: { class: 'px-8' },
  footer: { class: 'p-8 bg-zinc-50/50' }
};

// State
const activeTab = ref('generate');
const reportType = ref('');
const reportFormat = ref('excel');
const filtersPegawai = ref({ unit_kerja_id: null, status: null });
const filtersCuti = ref({ status: null });
const dateRange = ref(null);
const previewData = ref([]);
const previewColumns = ref([]);
const generating = ref(false);

const schedules = ref([]);
const loadingSchedules = ref(false);
const scheduleDialogVisible = ref(false);
const newSchedule = ref({ report_type: '', format: 'excel', schedule_date: null });
const savingSchedule = ref(false);

const reportTypes = [
  { label: 'Data Master Pegawai', value: 'pegawai' },
  { label: 'Rekapitulasi Cuti', value: 'cuti' },
  { label: 'Riwayat Mutasi', value: 'mutasi' }
];

const formatOptions = [
  { label: 'Excel Worksheet (.xlsx)', value: 'excel' },
  { label: 'CSV (Comma Separated)', value: 'csv' }
];

const statusOptions = [
  { label: 'Aktif', value: 'aktif' },
  { label: 'Pensiun', value: 'pensiun' }
];

const cutiStatusOptions = [
  { label: 'Disetujui', value: 'disetujui' },
  { label: 'Menunggu', value: 'pending' }
];

const unitOptions = ref([]);

// Logic: Fetch & Flatten Data
const fetchProcessedData = async (limit = null) => {
  let query;
  if (reportType.value === 'pegawai') {
    query = supabase.from('pegawai').select('nip, nama, status, unit:units(name)');
    if (filtersPegawai.value.unit_kerja_id) query = query.eq('unit_kerja_id', filtersPegawai.value.unit_kerja_id);
    if (filtersPegawai.value.status) query = query.eq('status', filtersPegawai.value.status);
  } else if (reportType.value === 'cuti') {
    query = supabase.from('cuti').select('created_at, status, jenis_cuti, pegawai:pegawai(nama, nip)');
    if (filtersCuti.value.status) query = query.eq('status', filtersCuti.value.status);
  }

  if (dateRange.value?.[0] && dateRange.value?.[1]) {
    query = query.gte('created_at', dateRange.value[0].toISOString()).lte('created_at', dateRange.value[1].toISOString());
  }

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;

  // LOGIC: FLATTENING (Menghilangkan nested object agar Excel rapi)
  return data.map(item => {
    const flatItem = { ...item };
    // Contoh: ubah unit.name menjadi kolom 'Unit Kerja'
    if (item.unit) { flatItem.unit_kerja = item.unit.name; delete flatItem.unit; }
    if (item.pegawai) { 
      flatItem.nama_pegawai = item.pegawai.nama; 
      flatItem.nip_pegawai = item.pegawai.nip; 
      delete flatItem.pegawai; 
    }
    return flatItem;
  });
};

const previewReport = async () => {
  try {
    const data = await fetchProcessedData(20);
    previewData.value = data;
    previewColumns.value = data.length ? Object.keys(data[0]) : [];
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Preview Gagal', detail: err.message });
  }
};

const generateReport = async () => {
  generating.value = true;
  try {
    const data = await fetchProcessedData();
    if (!data.length) return toast.add({ severity: 'warn', summary: 'Kosong', detail: 'Tidak ada data ditemukan' });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");

    if (reportFormat.value === 'excel') {
      XLSX.writeFile(wb, `Laporan_${reportType.value}_${Date.now()}.xlsx`);
    } else {
      XLSX.writeFile(wb, `Laporan_${reportType.value}_${Date.now()}.csv`, { bookType: 'csv' });
    }
    
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Laporan telah diunduh' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message });
  } finally {
    generating.value = false;
  }
};

// Schedule Logic
const loadSchedules = async () => {
  loadingSchedules.value = true;
  const { data } = await supabase.from('report_schedules').select('*').order('schedule_date', { ascending: true });
  schedules.value = data || [];
  loadingSchedules.value = false;
};

const saveSchedule = async () => {
  if (!newSchedule.value.report_type || !newSchedule.value.schedule_date) return;
  savingSchedule.value = true;
  try {
    const { error } = await supabase.from('report_schedules').insert([{
      report_type: newSchedule.value.report_type,
      format: newSchedule.value.format,
      schedule_date: newSchedule.value.schedule_date.toISOString(),
      filters: JSON.stringify(reportType.value === 'pegawai' ? filtersPegawai.value : filtersCuti.value)
    }]);
    if (error) throw error;
    scheduleDialogVisible.value = false;
    loadSchedules();
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Jadwal laporan disimpan' });
  } finally {
    savingSchedule.value = false;
  }
};

const deleteSchedule = async (id) => {
  await supabase.from('report_schedules').delete().eq('id', id);
  loadSchedules();
};

const loadUnits = async () => {
  const { data } = await supabase.from('units').select('id, name');
  if (data) unitOptions.value = data.map(u => ({ label: u.name, value: u.id }));
};

const formatColumnLabel = (key) => key.replace(/_/g, ' ').toUpperCase();
const formatDateTime = (date) => new Date(date).toLocaleString('id-ID');
const getReportLabel = (val) => reportTypes.find(t => t.value === val)?.label || val;
const openScheduleDialog = () => { scheduleDialogVisible.value = true; };

onMounted(() => {
  loadUnits();
  loadSchedules();
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>