<template>
  <div class="mutasi-page">
    <!-- Header -->
    <div class="mutasi-header">
      <div class="mutasi-header-content">
        <div class="mutasi-header-icon">
          <i class="pi pi-refresh"></i>
        </div>
        <div>
          <h1 class="mutasi-title">Manajemen Mutasi</h1>
          <p class="mutasi-subtitle">Kelola data mutasi pegawai</p>
        </div>
      </div>
      <div class="mutasi-header-actions">
        <InputGroup class="search-input">
          <InputGroupAddon>
            <i class="pi pi-search"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari NIP atau nama pegawai..." />
        </InputGroup>
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
        <Button label="Tambah Mutasi" icon="pi pi-plus" @click="openCreateModal" class="btn-primary" />
      </div>
    </div>

    <!-- Filter tambahan (tanggal mulai – selesai sederhana) -->
    <div class="mutasi-filters">
      <div class="filter-item">
        <label>Tanggal Mutasi (mulai)</label>
        <DatePicker v-model="filterTanggalMulai" dateFormat="yy-mm-dd" placeholder="Dari" />
      </div>
      <div class="filter-item">
        <label>Tanggal Mutasi (sampai)</label>
        <DatePicker v-model="filterTanggalSampai" dateFormat="yy-mm-dd" placeholder="Sampai" />
      </div>
      <div class="filter-item">
        <Button label="Terapkan Filter" icon="pi pi-filter" @click="applyFilters" />
        <Button label="Reset" icon="pi pi-times" severity="secondary" outlined @click="resetFilters" />
      </div>
    </div>

    <!-- Statistik sederhana -->
    <div class="stats-grid">
      <div class="stat-card bg-blue-50">
        <div class="stat-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Mutasi</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card bg-green-50">
        <div class="stat-icon">
          <i class="pi pi-building"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Unit Asal</span>
          <span class="stat-value">{{ stats.jumlahUnitAsal }}</span>
        </div>
      </div>
      <div class="stat-card bg-purple-50">
        <div class="stat-icon">
          <i class="pi pi-arrow-right"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Unit Tujuan</span>
          <span class="stat-value">{{ stats.jumlahUnitTujuan }}</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="mutasi-table-wrap">
      <DataTable
        :value="items"
        :loading="loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} mutasi"
        class="mutasi-datatable"
      >
        <Column field="pegawai.nip" header="NIP" sortable>
          <template #body="{ data }">
            <span class="font-mono">{{ data.pegawai?.nip || '-' }}</span>
          </template>
        </Column>
        <Column field="pegawai.nama" header="Nama Pegawai" sortable>
          <template #body="{ data }">
            <span class="font-semibold">{{ data.pegawai?.nama || '-' }}</span>
          </template>
        </Column>
        <Column field="dari_unit" header="Unit Asal" />
        <Column field="ke_unit" header="Unit Tujuan" />
        <Column field="tanggal_mutasi" header="Tanggal Mutasi" sortable>
          <template #body="{ data }">
            {{ formatDate(data.tanggal_mutasi) }}
          </template>
        </Column>
        <Column header="Aksi" :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-eye" severity="info" size="small" @click="viewDetail(data)" v-tooltip.top="'Lihat'" />
              <Button icon="pi pi-pencil" severity="warning" size="small" @click="openEditModal(data)" v-tooltip.top="'Edit'" />
              <Button icon="pi pi-trash" severity="danger" size="small" @click="confirmDelete(data)" v-tooltip.top="'Hapus'" />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="text-center py-4">Belum ada data mutasi. Klik "Tambah Mutasi".</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Form Tambah/Edit -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Edit Mutasi' : 'Tambah Mutasi'"
      :style="{ width: '500px' }"
      modal
    >
      <div class="field">
        <label>Pegawai <span class="text-red-500">*</span></label>
        <Select
          v-model="form.pegawai_id"
          :options="pegawaiOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih pegawai"
          :class="{ 'p-invalid': errors.pegawai_id }"
          filter
          showClear
        />
        <small v-if="errors.pegawai_id" class="p-error">{{ errors.pegawai_id }}</small>
      </div>
      <div class="field">
        <label>Unit Asal</label>
        <Select
          v-model="form.dari_unit"
          :options="unitOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih unit asal"
          clearable
        />
      </div>
      <div class="field">
        <label>Unit Tujuan <span class="text-red-500">*</span></label>
        <Select
          v-model="form.ke_unit"
          :options="unitOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih unit tujuan"
          :class="{ 'p-invalid': errors.ke_unit }"
          clearable
        />
        <small v-if="errors.ke_unit" class="p-error">{{ errors.ke_unit }}</small>
      </div>
      <div class="field">
        <label>Tanggal Mutasi <span class="text-red-500">*</span></label>
        <DatePicker v-model="form.tanggal_mutasi" dateFormat="yy-mm-dd" placeholder="Pilih tanggal" :class="{ 'p-invalid': errors.tanggal_mutasi }" />
        <small v-if="errors.tanggal_mutasi" class="p-error">{{ errors.tanggal_mutasi }}</small>
      </div>
      <div class="field">
        <label>File SK (URL)</label>
        <InputText v-model="form.surat_sk_file" placeholder="URL file SK mutasi" />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="closeDialog" />
        <Button label="Simpan" @click="saveData" :loading="submitting" />
      </template>
    </Dialog>

    <!-- Dialog Detail -->
    <Dialog
      v-model:visible="showDetailDialog"
      header="Detail Mutasi"
      :style="{ width: '450px' }"
      modal
    >
      <div class="detail-item">
        <span class="detail-label">NIP:</span>
        <span class="detail-value">{{ detailData?.pegawai?.nip || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Nama Pegawai:</span>
        <span class="detail-value">{{ detailData?.pegawai?.nama || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Unit Asal:</span>
        <span class="detail-value">{{ detailData?.dari_unit || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Unit Tujuan:</span>
        <span class="detail-value">{{ detailData?.ke_unit || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tanggal Mutasi:</span>
        <span class="detail-value">{{ formatDate(detailData?.tanggal_mutasi) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">File SK:</span>
        <span class="detail-value">
          <a v-if="detailData?.surat_sk_file" :href="detailData.surat_sk_file" target="_blank">Lihat file</a>
          <span v-else>-</span>
        </span>
      </div>
      <template #footer>
        <Button label="Tutup" @click="showDetailDialog = false" />
      </template>
    </Dialog>

    <!-- Konfirmasi Hapus -->
    <Dialog
      v-model:visible="deleteDialog"
      header="Konfirmasi Hapus"
      :style="{ width: '400px' }"
      modal
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-3xl text-warning"></i>
        <span>Yakin ingin menghapus mutasi <strong>{{ selectedItem?.pegawai?.nama }}</strong>?</span>
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="deleteDialog = false" />
        <Button label="Hapus" severity="danger" @click="deleteData" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// State
const items = ref([]);
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const showDialog = ref(false);
const showDetailDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const selectedItem = ref(null);
const detailData = ref(null);
const form = ref({
  pegawai_id: null,
  dari_unit: '',
  ke_unit: '',
  tanggal_mutasi: null,
  surat_sk_file: ''
});
const errors = ref({});

// Filter
const searchQuery = ref('');
const filterTanggalMulai = ref(null);
const filterTanggalSampai = ref(null);
const pegawaiOptions = ref([]);
const unitOptions = ref([]);

// Statistik
const stats = computed(() => {
  const total = items.value.length;
  const unitAsalSet = new Set(items.value.map(i => i.dari_unit).filter(Boolean));
  const unitTujuanSet = new Set(items.value.map(i => i.ke_unit).filter(Boolean));
  return {
    total,
    jumlahUnitAsal: unitAsalSet.size,
    jumlahUnitTujuan: unitTujuanSet.size
  };
});

// Helper
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

// Fetch options
const loadPegawaiOptions = async () => {
  const { data, error } = await supabase
    .from('pegawai')
    .select('id, nama, nip')
    .order('nama');
  if (!error) {
    pegawaiOptions.value = data.map(p => ({
      label: `${p.nip} - ${p.nama}`,
      value: p.id
    }));
  }
};

const loadUnitOptions = async () => {
  const { data, error } = await supabase
    .from('units')
    .select('id, name')
    .order('name');
  if (!error) {
    unitOptions.value = data.map(u => ({ label: u.name, value: u.name }));
  }
};

// Load data
const loadData = async () => {
  loading.value = true;
  try {
    let query = supabase
      .from('mutasi')
      .select('*, pegawai(id, nip, nama)')
      .order('tanggal_mutasi', { ascending: false });

    // Filter tanggal
    if (filterTanggalMulai.value) {
      query = query.gte('tanggal_mutasi', filterTanggalMulai.value);
    }
    if (filterTanggalSampai.value) {
      query = query.lte('tanggal_mutasi', filterTanggalSampai.value);
    }

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];
    // Filter pencarian (nip, nama)
    if (searchQuery.value) {
      const term = searchQuery.value.toLowerCase();
      filtered = filtered.filter(item =>
        item.pegawai?.nip?.toLowerCase().includes(term) ||
        item.pegawai?.nama?.toLowerCase().includes(term)
      );
    }
    items.value = filtered;
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => loadData();
const resetFilters = () => {
  searchQuery.value = '';
  filterTanggalMulai.value = null;
  filterTanggalSampai.value = null;
  loadData();
};

// CRUD
const openCreateModal = () => {
  isEditing.value = false;
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

const openEditModal = (row) => {
  isEditing.value = true;
  selectedItem.value = row;
  form.value = {
    pegawai_id: row.pegawai_id,
    dari_unit: row.dari_unit || '',
    ke_unit: row.ke_unit || '',
    tanggal_mutasi: row.tanggal_mutasi ? new Date(row.tanggal_mutasi) : null,
    surat_sk_file: row.surat_sk_file || ''
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
  selectedItem.value = null;
};

const validate = () => {
  errors.value = {};
  if (!form.value.pegawai_id) errors.value.pegawai_id = 'Pegawai harus dipilih';
  if (!form.value.ke_unit) errors.value.ke_unit = 'Unit tujuan harus diisi';
  if (!form.value.tanggal_mutasi) errors.value.tanggal_mutasi = 'Tanggal mutasi harus diisi';
  return Object.keys(errors.value).length === 0;
};

const saveData = async () => {
  if (!validate()) return;
  submitting.value = true;
  try {
    const payload = {
      pegawai_id: form.value.pegawai_id,
      dari_unit: form.value.dari_unit || null,
      ke_unit: form.value.ke_unit,
      tanggal_mutasi: form.value.tanggal_mutasi ? form.value.tanggal_mutasi.toISOString().split('T')[0] : null,
      surat_sk_file: form.value.surat_sk_file || null,
      updated_at: new Date().toISOString()
    };
    if (isEditing.value && selectedItem.value) {
      const { error } = await supabase
        .from('mutasi')
        .update(payload)
        .eq('id', selectedItem.value.id);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Mutasi diperbarui', life: 3000 });
    } else {
      const { error } = await supabase
        .from('mutasi')
        .insert([{ ...payload, created_at: new Date().toISOString() }]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Mutasi ditambahkan', life: 3000 });
    }
    closeDialog();
    await loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (row) => {
  selectedItem.value = row;
  deleteDialog.value = true;
};

const deleteData = async () => {
  if (!selectedItem.value) return;
  deleting.value = true;
  try {
    const { error } = await supabase
      .from('mutasi')
      .delete()
      .eq('id', selectedItem.value.id);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Mutasi dihapus', life: 3000 });
    deleteDialog.value = false;
    await loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    deleting.value = false;
    selectedItem.value = null;
  }
};

onMounted(async () => {
  await Promise.all([loadPegawaiOptions(), loadUnitOptions()]);
  await loadData();
});
</script>

<style scoped>
.mutasi-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem 0;
}

.mutasi-header {
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

.mutasi-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mutasi-header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.mutasi-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.mutasi-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.mutasi-header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  min-width: 250px;
}

.btn-primary {
  font-weight: 600;
}

.mutasi-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background: white;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-item label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: rgba(59,130,246,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  display: block;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.mutasi-table-wrap {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 1rem;
}

.mutasi-datatable {
  width: 100%;
}

.mutasi-datatable :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.75rem 1rem;
}

.mutasi-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}

.mutasi-datatable :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: #334155;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  display: block;
  margin-top: 0.25rem;
}

.detail-item {
  display: flex;
  margin-bottom: 0.75rem;
}

.detail-label {
  width: 120px;
  font-weight: 600;
  color: #475569;
}

.detail-value {
  flex: 1;
  color: #0f172a;
}

@media (max-width: 640px) {
  .mutasi-page {
    padding: 1rem;
  }
  .mutasi-header {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    width: 100%;
  }
  .mutasi-filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>