<template>
  <div class="reports-page">
    <!-- Header -->
    <div class="reports-header">
      <div class="reports-header-content">
        <div class="reports-header-icon">
          <i class="pi pi-chart-bar"></i>
        </div>
        <div>
          <h1 class="reports-title">Manajemen Laporan</h1>
          <p class="reports-subtitle">Generate dan kelola laporan data kepegawaian</p>
        </div>
      </div>
    </div>

    <!-- Tab Navigator -->
    <div class="reports-tabs">
      <Button :class="{ 'active-tab': activeTab === 'generate' }" label="Generate Laporan" icon="pi pi-download" @click="activeTab = 'generate'" />
      <Button :class="{ 'active-tab': activeTab === 'schedule' }" label="Jadwal Laporan" icon="pi pi-calendar" @click="activeTab = 'schedule'" />
    </div>

    <!-- Tab Generate Laporan -->
    <div v-if="activeTab === 'generate'" class="card">
      <div class="p-4">
        <div class="flex align-items-center gap-2 mb-4">
          <i class="pi pi-download text-2xl text-primary"></i>
          <h2 class="text-xl font-semibold m-0">Generate Laporan Langsung</h2>
        </div>

        <div class="grid">
          <div class="col-12 md:col-4">
            <div class="field">
              <label>Jenis Laporan <span class="text-red-500">*</span></label>
              <Select v-model="reportType" :options="reportTypes" optionLabel="label" optionValue="value" placeholder="Pilih jenis laporan" class="w-full" />
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="field">
              <label>Format <span class="text-red-500">*</span></label>
              <Select v-model="reportFormat" :options="formatOptions" optionLabel="label" optionValue="value" class="w-full" />
            </div>
          </div>
        </div>

        <!-- Filter Dinamis -->
        <div v-if="reportType === 'pegawai'" class="grid mt-2">
          <div class="col-12 md:col-4">
            <div class="field">
              <label>Unit Kerja</label>
              <Select v-model="filtersPegawai.unit_kerja_id" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Semua unit" clearable />
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="field">
              <label>Status</label>
              <Select v-model="filtersPegawai.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Semua status" clearable />
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="field">
              <label>Golongan</label>
              <Select v-model="filtersPegawai.golongan" :options="golonganOptions" placeholder="Semua golongan" clearable />
            </div>
          </div>
        </div>

        <div v-else-if="reportType === 'cuti'" class="grid mt-2">
          <div class="col-12 md:col-6">
            <div class="field">
              <label>Status Cuti</label>
              <Select v-model="filtersCuti.status" :options="cutiStatusOptions" optionLabel="label" optionValue="value" placeholder="Semua status" clearable />
            </div>
          </div>
        </div>

        <!-- Rentang Tanggal -->
        <div class="field mt-3">
          <label>Rentang Tanggal (opsional)</label>
          <DatePicker v-model="dateRange" selectionMode="range" placeholder="Pilih rentang tanggal" class="w-full" />
        </div>

        <div class="flex gap-2 mt-4">
          <Button label="Preview Data" icon="pi pi-eye" severity="secondary" outlined @click="previewReport" :disabled="!reportType" />
          <Button label="Generate & Download" icon="pi pi-download" @click="generateReport" :loading="generating" :disabled="!reportType" />
        </div>

        <!-- Preview Table -->
        <div v-if="previewData.length" class="mt-4">
          <h3>Preview Data (maksimal 20 baris)</h3>
          <DataTable :value="previewData" scrollable scrollHeight="400px" class="p-datatable-sm">
            <Column v-for="col in previewColumns" :key="col" :field="col" :header="formatColumnLabel(col)" />
          </DataTable>
        </div>
      </div>
    </div>

    <!-- Tab Jadwal Laporan -->
    <div v-if="activeTab === 'schedule'" class="card">
      <div class="p-4">
        <div class="flex justify-content-between align-items-center mb-4">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-calendar text-2xl text-primary"></i>
            <h2 class="text-xl font-semibold m-0">Jadwal Laporan</h2>
          </div>
          <Button label="Tambah Jadwal" icon="pi pi-plus" @click="openScheduleDialog" />
        </div>

        <DataTable :value="schedules" :loading="loadingSchedules" paginator :rows="10">
          <Column field="report_type" header="Jenis Laporan">
            <template #body="{ data }">
              {{ getReportLabel(data.report_type) }}
            </template>
          </Column>
          <Column field="format" header="Format" />
          <Column field="schedule_date" header="Jadwal Generate">
            <template #body="{ data }">
              {{ formatDateTime(data.schedule_date) }}
            </template>
          </Column>
          <Column field="filters" header="Filter" />
          <Column header="Aksi">
            <template #body="{ data }">
              <Button icon="pi pi-trash" severity="danger" rounded text @click="deleteSchedule(data.id)" />
            </template>
          </Column>
          <template #empty>Belum ada jadwal laporan</template>
        </DataTable>
      </div>
    </div>

    <!-- Dialog Jadwal -->
    <Dialog v-model:visible="scheduleDialogVisible" header="Tambah Jadwal Laporan" :style="{ width: '450px' }" modal>
      <div class="field">
        <label>Jenis Laporan <span class="text-red-500">*</span></label>
        <Select v-model="newSchedule.report_type" :options="reportTypes" optionLabel="label" optionValue="value" class="w-full" />
      </div>
      <div class="field">
        <label>Format <span class="text-red-500">*</span></label>
        <Select v-model="newSchedule.format" :options="formatOptions" optionLabel="label" optionValue="value" class="w-full" />
      </div>
      <div class="field">
        <label>Tanggal & Waktu Generate <span class="text-red-500">*</span></label>
        <Calendar v-model="newSchedule.schedule_date" showTime hourFormat="24" class="w-full" />
      </div>
      <div class="field">
        <label>Filter (JSON, opsional)</label>
        <Textarea v-model="newSchedule.filters" rows="2" placeholder='{"status": "aktif"}' />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="scheduleDialogVisible = false" />
        <Button label="Simpan" @click="saveSchedule" :loading="savingSchedule" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';

const toast = useToast();

// Tab
const activeTab = ref('generate');

// Options
const reportTypes = ref([
  { label: 'Data Pegawai', value: 'pegawai' },
  { label: 'Data Cuti', value: 'cuti' },
  { label: 'Data Mutasi', value: 'mutasi' },
  { label: 'Data Penilaian Kinerja', value: 'kinerja' }
]);
const formatOptions = ref([
  { label: 'Excel (.xlsx)', value: 'excel' },
  { label: 'CSV', value: 'csv' }
]);
const statusOptions = ref([
  { label: 'Aktif', value: 'aktif' },
  { label: 'Pensiun', value: 'pensiun' },
  { label: 'Mutasi', value: 'mutasi' }
]);
const golonganOptions = ref(['I/a','I/b','I/c','I/d','II/a','II/b','II/c','II/d','III/a','III/b','III/c','III/d','IV/a','IV/b','IV/c','IV/d']);
const cutiStatusOptions = ref([
  { label: 'Pending', value: 'pending' },
  { label: 'Disetujui', value: 'disetujui' },
  { label: 'Ditolak', value: 'ditolak' }
]);
const unitOptions = ref([]);

// State generate
const reportType = ref('');
const reportFormat = ref('excel');
const filtersPegawai = ref({ unit_kerja_id: null, status: null, golongan: null });
const filtersCuti = ref({ status: null });
const dateRange = ref(null);
const generating = ref(false);
const previewData = ref([]);
const previewColumns = ref([]);

// State jadwal
const schedules = ref([]);
const loadingSchedules = ref(false);
const scheduleDialogVisible = ref(false);
const newSchedule = ref({ report_type: '', format: 'excel', schedule_date: null, filters: '' });
const savingSchedule = ref(false);

// Helper
const formatColumnLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
const formatDateTime = (date) => date ? new Date(date).toLocaleString('id-ID') : '-';
const getReportLabel = (val) => reportTypes.value.find(t => t.value === val)?.label || val;

// Load units
const loadUnits = async () => {
  const { data, error } = await supabase.from('units').select('id, name');
  if (!error) unitOptions.value = data.map(u => ({ label: u.name, value: u.id }));
};

// Fetch data for preview/generate
const fetchReportData = async () => {
  if (!reportType.value) return [];
  let query;
  switch (reportType.value) {
    case 'pegawai':
      query = supabase.from('pegawai').select('*');
      if (filtersPegawai.value.unit_kerja_id) query = query.eq('unit_kerja_id', filtersPegawai.value.unit_kerja_id);
      if (filtersPegawai.value.status) query = query.eq('status', filtersPegawai.value.status);
      if (filtersPegawai.value.golongan) query = query.eq('golongan', filtersPegawai.value.golongan);
      break;
    case 'cuti':
      query = supabase.from('cuti').select('*, pegawai(nama, nip)');
      if (filtersCuti.value.status) query = query.eq('status', filtersCuti.value.status);
      break;
    case 'mutasi':
      query = supabase.from('mutasi').select('*, pegawai(nama, nip)');
      break;
    case 'kinerja':
      query = supabase.from('penilaian_kinerja').select('*, pegawai(nama, nip)');
      break;
    default: return [];
  }
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value;
    query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

const previewReport = async () => {
  try {
    const data = await fetchReportData();
    previewData.value = data.slice(0, 20);
    previewColumns.value = data.length ? Object.keys(data[0]) : [];
    if (!previewData.value.length) toast.add({ severity: 'info', summary: 'Info', detail: 'Tidak ada data untuk filter yang dipilih', life: 3000 });
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  }
};

const generateReport = async () => {
  generating.value = true;
  try {
    const data = await fetchReportData();
    if (!data.length) {
      toast.add({ severity: 'warn', summary: 'Tidak ada data', detail: 'Tidak ada data yang sesuai filter', life: 3000 });
      return;
    }
    if (reportFormat.value === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, reportType.value);
      XLSX.writeFile(wb, `${reportType.value}_report.xlsx`);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: `Laporan ${reportType.value} berhasil diunduh`, life: 3000 });
    } else if (reportFormat.value === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${reportType.value}_report.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.add({ severity: 'success', summary: 'Berhasil', detail: `Laporan CSV diunduh`, life: 3000 });
    }
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    generating.value = false;
  }
};

// Jadwal laporan: CRUD dengan tabel report_schedules
const loadSchedules = async () => {
  loadingSchedules.value = true;
  const { data, error } = await supabase.from('report_schedules').select('*').order('schedule_date', { ascending: true });
  if (!error) schedules.value = data || [];
  loadingSchedules.value = false;
};

const openScheduleDialog = () => {
  newSchedule.value = { report_type: '', format: 'excel', schedule_date: null, filters: '' };
  scheduleDialogVisible.value = true;
};

const saveSchedule = async () => {
  if (!newSchedule.value.report_type || !newSchedule.value.format || !newSchedule.value.schedule_date) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Lengkapi semua field wajib', life: 3000 });
    return;
  }
  savingSchedule.value = true;
  try {
    const { error } = await supabase.from('report_schedules').insert([{
      report_type: newSchedule.value.report_type,
      format: newSchedule.value.format,
      schedule_date: newSchedule.value.schedule_date.toISOString(),
      filters: newSchedule.value.filters || null
    }]);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Jadwal laporan ditambahkan', life: 3000 });
    scheduleDialogVisible.value = false;
    loadSchedules();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    savingSchedule.value = false;
  }
};

const deleteSchedule = async (id) => {
  const { error } = await supabase.from('report_schedules').delete().eq('id', id);
  if (error) toast.add({ severity: 'error', summary: 'Gagal', detail: error.message, life: 3000 });
  else {
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Jadwal dihapus', life: 3000 });
    loadSchedules();
  }
};

onMounted(() => {
  loadUnits();
  loadSchedules();
});
</script>

<style scoped>
.reports-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: white;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

.reports-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.reports-header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.reports-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.reports-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.reports-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.active-tab {
  background: var(--primary-color) !important;
  color: white !important;
}

.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}
.card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
</style>