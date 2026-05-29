<template>
  <div class="kinerja-page">
    <!-- Header -->
    <div class="kinerja-header">
      <div class="kinerja-header-content">
        <div class="kinerja-header-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <div>
          <h1 class="kinerja-title">Penilaian Kinerja</h1>
          <p class="kinerja-subtitle">Kelola penilaian kinerja pegawai</p>
        </div>
      </div>
      <div class="kinerja-header-actions">
        <InputGroup class="search-input">
          <InputGroupAddon>
            <i class="pi pi-search"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari NIP atau nama pegawai..." />
        </InputGroup>
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
        <Button label="Tambah Penilaian" icon="pi pi-plus" @click="openCreateModal" class="btn-primary" />
      </div>
    </div>

    <!-- Filter tambahan (tahun & range nilai) -->
    <div class="kinerja-filters">
      <div class="filter-item">
        <label>Tahun</label>
        <InputNumber v-model="filterTahun" placeholder="Tahun" :min="2000" :max="2100" />
      </div>
      <div class="filter-item">
        <label>Range Nilai</label>
        <Select
          v-model="filterRangeNilai"
          :options="rangeNilaiOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Semua range"
          clearable
        />
      </div>
      <div class="filter-item">
        <Button label="Terapkan Filter" icon="pi pi-filter" @click="applyFilters" />
        <Button label="Reset" icon="pi pi-times" severity="secondary" outlined @click="resetFilters" />
      </div>
    </div>

    <!-- Statistik -->
    <div class="stats-grid">
      <div class="stat-card bg-blue-50">
        <div class="stat-icon">
          <i class="pi pi-chart-bar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Penilaian</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card bg-green-50">
        <div class="stat-icon">
          <i class="pi pi-star"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Sangat Baik (≥90)</span>
          <span class="stat-value">{{ stats.sangatBaik }}</span>
        </div>
      </div>
      <div class="stat-card bg-yellow-50">
        <div class="stat-icon">
          <i class="pi pi-thumbs-up"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Baik (80-89)</span>
          <span class="stat-value">{{ stats.baik }}</span>
        </div>
      </div>
      <div class="stat-card bg-orange-50">
        <div class="stat-icon">
          <i class="pi pi-minus-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Cukup (70-79)</span>
          <span class="stat-value">{{ stats.cukup }}</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="kinerja-table-wrap">
      <DataTable
        :value="items"
        :loading="loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} penilaian"
        class="kinerja-datatable"
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
        <Column field="tahun" header="Tahun" sortable />
        <Column field="periode" header="Periode" />
        <Column field="nilai" header="Nilai" sortable>
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <span class="font-bold">{{ data.nilai }}</span>
              <Tag :value="getKategoriNilai(data.nilai)" :severity="getSeverityNilai(data.nilai)" />
            </div>
          </template>
        </Column>
        <Column field="penilai" header="Penilai" />
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
          <div class="text-center py-4">Belum ada data penilaian kinerja. Klik "Tambah Penilaian".</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Form Tambah/Edit -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Edit Penilaian Kinerja' : 'Tambah Penilaian Kinerja'"
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
        <label>Tahun <span class="text-red-500">*</span></label>
        <InputNumber v-model="form.tahun" :min="2000" :max="2100" :class="{ 'p-invalid': errors.tahun }" />
        <small v-if="errors.tahun" class="p-error">{{ errors.tahun }}</small>
      </div>
      <div class="field">
        <label>Periode</label>
        <InputText v-model="form.periode" placeholder="Contoh: Semester I, Jan-Jun" />
      </div>
      <div class="field">
        <label>Nilai <span class="text-red-500">*</span></label>
        <InputNumber v-model="form.nilai" :min="0" :max="100" :class="{ 'p-invalid': errors.nilai }" />
        <small v-if="errors.nilai" class="p-error">{{ errors.nilai }}</small>
      </div>
      <div class="field">
        <label>Penilai</label>
        <InputText v-model="form.penilai" placeholder="Nama penilai" />
      </div>
      <div class="field">
        <label>Komentar</label>
        <Textarea v-model="form.komentar" rows="3" placeholder="Komentar atau catatan" />
      </div>
      <div class="field">
        <label>Rekomendasi</label>
        <Textarea v-model="form.rekomendasi" rows="2" placeholder="Rekomendasi tindak lanjut" />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="closeDialog" />
        <Button label="Simpan" @click="saveData" :loading="submitting" />
      </template>
    </Dialog>

    <!-- Dialog Detail -->
    <Dialog
      v-model:visible="showDetailDialog"
      header="Detail Penilaian Kinerja"
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
        <span class="detail-label">Tahun:</span>
        <span class="detail-value">{{ detailData?.tahun || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Periode:</span>
        <span class="detail-value">{{ detailData?.periode || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Nilai:</span>
        <span class="detail-value">{{ detailData?.nilai }} ({{ getKategoriNilai(detailData?.nilai) }})</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Penilai:</span>
        <span class="detail-value">{{ detailData?.penilai || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Komentar:</span>
        <span class="detail-value">{{ detailData?.komentar || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Rekomendasi:</span>
        <span class="detail-value">{{ detailData?.rekomendasi || '-' }}</span>
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
        <span>Yakin ingin menghapus penilaian <strong>{{ selectedItem?.pegawai?.nama }}</strong>?</span>
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
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import Tag from 'primevue/tag';

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
  tahun: null,
  periode: '',
  nilai: null,
  penilai: '',
  komentar: '',
  rekomendasi: ''
});
const errors = ref({});

// Filter
const searchQuery = ref('');
const filterTahun = ref(null);
const filterRangeNilai = ref(null);
const pegawaiOptions = ref([]);
const rangeNilaiOptions = ref([
  { label: '90-100 (Sangat Baik)', value: '90-100' },
  { label: '80-89 (Baik)', value: '80-89' },
  { label: '70-79 (Cukup)', value: '70-79' },
  { label: '60-69 (Kurang)', value: '60-69' },
  { label: '< 60 (Buruk)', value: '0-59' }
]);

// Statistik
const stats = computed(() => {
  const total = items.value.length;
  const sangatBaik = items.value.filter(i => i.nilai >= 90).length;
  const baik = items.value.filter(i => i.nilai >= 80 && i.nilai < 90).length;
  const cukup = items.value.filter(i => i.nilai >= 70 && i.nilai < 80).length;
  return { total, sangatBaik, baik, cukup };
});

// Helper
const getKategoriNilai = (nilai) => {
  if (nilai >= 90) return 'Sangat Baik';
  if (nilai >= 80) return 'Baik';
  if (nilai >= 70) return 'Cukup';
  if (nilai >= 60) return 'Kurang';
  return 'Buruk';
};

const getSeverityNilai = (nilai) => {
  if (nilai >= 90) return 'success';
  if (nilai >= 80) return 'info';
  if (nilai >= 70) return 'warning';
  return 'danger';
};

// Fetch pegawai options
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

// Load data
const loadData = async () => {
  loading.value = true;
  try {
    let query = supabase
      .from('penilaian_kinerja')
      .select('*, pegawai(id, nip, nama)')
      .order('tahun', { ascending: false });

    if (filterTahun.value) {
      query = query.eq('tahun', filterTahun.value);
    }
    if (filterRangeNilai.value) {
      const [min, max] = filterRangeNilai.value.split('-').map(Number);
      if (max) {
        query = query.gte('nilai', min).lte('nilai', max);
      } else if (filterRangeNilai.value === '0-59') {
        query = query.lte('nilai', 59);
      }
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
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => loadData();
const resetFilters = () => {
  searchQuery.value = '';
  filterTahun.value = null;
  filterRangeNilai.value = null;
  loadData();
};

// CRUD
const openCreateModal = () => {
  isEditing.value = false;
  form.value = {
    pegawai_id: null,
    tahun: null,
    periode: '',
    nilai: null,
    penilai: '',
    komentar: '',
    rekomendasi: ''
  };
  errors.value = {};
  showDialog.value = true;
};

const openEditModal = (row) => {
  isEditing.value = true;
  selectedItem.value = row;
  form.value = {
    pegawai_id: row.pegawai_id,
    tahun: row.tahun,
    periode: row.periode || '',
    nilai: row.nilai,
    penilai: row.penilai || '',
    komentar: row.komentar || '',
    rekomendasi: row.rekomendasi || ''
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
  if (!form.value.tahun) errors.value.tahun = 'Tahun harus diisi';
  if (form.value.nilai === null || form.value.nilai === undefined) errors.value.nilai = 'Nilai harus diisi';
  if (form.value.nilai < 0 || form.value.nilai > 100) errors.value.nilai = 'Nilai harus antara 0-100';
  return Object.keys(errors.value).length === 0;
};

const saveData = async () => {
  if (!validate()) return;
  submitting.value = true;
  try {
    const payload = {
      pegawai_id: form.value.pegawai_id,
      tahun: form.value.tahun,
      periode: form.value.periode || null,
      nilai: form.value.nilai,
      penilai: form.value.penilai || null,
      komentar: form.value.komentar || null,
      rekomendasi: form.value.rekomendasi || null,
      updated_at: new Date().toISOString()
    };
    if (isEditing.value && selectedItem.value) {
      const { error } = await supabase
        .from('penilaian_kinerja')
        .update(payload)
        .eq('id', selectedItem.value.id);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Penilaian diperbarui', life: 3000 });
    } else {
      const { error } = await supabase
        .from('penilaian_kinerja')
        .insert([{ ...payload, created_at: new Date().toISOString() }]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Penilaian ditambahkan', life: 3000 });
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
      .from('penilaian_kinerja')
      .delete()
      .eq('id', selectedItem.value.id);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Penilaian dihapus', life: 3000 });
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
  await loadPegawaiOptions();
  await loadData();
});
</script>

<style scoped>
.kinerja-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem 0;
}

.kinerja-header {
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

.kinerja-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kinerja-header-icon {
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

.kinerja-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.kinerja-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.kinerja-header-actions {
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

.kinerja-filters {
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
  background: rgba(139,92,246,0.1);
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

.kinerja-table-wrap {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 1rem;
}

.kinerja-datatable {
  width: 100%;
}

.kinerja-datatable :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.75rem 1rem;
}

.kinerja-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}

.kinerja-datatable :deep(.p-datatable-tbody > tr:hover) {
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
  width: 110px;
  font-weight: 600;
  color: #475569;
}

.detail-value {
  flex: 1;
  color: #0f172a;
}

@media (max-width: 640px) {
  .kinerja-page {
    padding: 1rem;
  }
  .kinerja-header {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    width: 100%;
  }
  .kinerja-filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>