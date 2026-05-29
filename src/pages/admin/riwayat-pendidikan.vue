<template>
  <div class="riwayat-pendidikan-page">
    <!-- Header -->
    <div class="riwayat-header">
      <div class="riwayat-header-content">
        <div class="riwayat-header-icon">
          <i class="pi pi-graduation-cap"></i>
        </div>
        <div>
          <h1 class="riwayat-title">Riwayat Pendidikan</h1>
          <p class="riwayat-subtitle">Kelola riwayat pendidikan pegawai</p>
        </div>
      </div>
      <div class="riwayat-header-actions">
        <InputGroup class="search-input">
          <InputGroupAddon>
            <i class="pi pi-search"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari NIP atau nama..." />
        </InputGroup>
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
        <Button label="Tambah Riwayat" icon="pi pi-plus" @click="openCreateModal" class="btn-primary" />
      </div>
    </div>

    <!-- Filter tambahan (jenjang & tahun) -->
    <div class="riwayat-filters">
      <div class="filter-item">
        <label>Jenjang</label>
        <Select v-model="filterJenjang" :options="jenjangOptions" optionLabel="label" optionValue="value" placeholder="Semua jenjang" clearable />
      </div>
      <div class="filter-item">
        <label>Tahun Lulus</label>
        <InputNumber v-model="filterTahun" placeholder="Tahun" :min="1900" :max="2100" />
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
          <i class="pi pi-book"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Riwayat</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card bg-green-50">
        <div class="stat-icon">
          <i class="pi pi-graduation-cap"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Sarjana (S1/S2/S3)</span>
          <span class="stat-value">{{ stats.sarjana }}</span>
        </div>
      </div>
      <div class="stat-card bg-orange-50">
        <div class="stat-icon">
          <i class="pi pi-certificate"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Diploma (D1-D4)</span>
          <span class="stat-value">{{ stats.diploma }}</span>
        </div>
      </div>
      <div class="stat-card bg-purple-50">
        <div class="stat-icon">
          <i class="pi pi-school"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">SMA/SMK/Sederajat</span>
          <span class="stat-value">{{ stats.sma }}</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="riwayat-table-wrap">
      <DataTable
        :value="items"
        :loading="loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} riwayat"
        class="riwayat-datatable"
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
        <Column field="jenjang" header="Jenjang" sortable />
        <Column field="institusi" header="Institusi" />
        <Column field="tahun_lulus" header="Tahun Lulus" sortable />
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
          <div class="text-center py-4">Belum ada data riwayat pendidikan. Klik "Tambah Riwayat".</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Form Tambah/Edit -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'"
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
        <label>Jenjang <span class="text-red-500">*</span></label>
        <Select
          v-model="form.jenjang"
          :options="jenjangOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih jenjang"
          :class="{ 'p-invalid': errors.jenjang }"
        />
        <small v-if="errors.jenjang" class="p-error">{{ errors.jenjang }}</small>
      </div>
      <div class="field">
        <label>Institusi</label>
        <InputText v-model="form.institusi" placeholder="Nama institusi/universitas" />
      </div>
      <div class="field">
        <label>Tahun Lulus</label>
        <InputNumber v-model="form.tahun_lulus" :min="1900" :max="2100" placeholder="Tahun lulus" />
      </div>
      <div class="field">
        <label>File Ijazah (opsional)</label>
        <InputText v-model="form.ijazah_file" placeholder="URL file ijazah" />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="closeDialog" />
        <Button label="Simpan" @click="saveData" :loading="submitting" />
      </template>
    </Dialog>

    <!-- Dialog Detail -->
    <Dialog
      v-model:visible="showDetailDialog"
      header="Detail Riwayat Pendidikan"
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
        <span class="detail-label">Jenjang:</span>
        <span class="detail-value">{{ detailData?.jenjang || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Institusi:</span>
        <span class="detail-value">{{ detailData?.institusi || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tahun Lulus:</span>
        <span class="detail-value">{{ detailData?.tahun_lulus || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">File Ijazah:</span>
        <span class="detail-value">
          <a v-if="detailData?.ijazah_file" :href="detailData.ijazah_file" target="_blank">Lihat file</a>
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
        <span>Yakin ingin menghapus riwayat pendidikan <strong>{{ selectedItem?.pegawai?.nama }}</strong>?</span>
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
  jenjang: null,
  institusi: '',
  tahun_lulus: null,
  ijazah_file: ''
});
const errors = ref({});

// Filter
const searchQuery = ref('');
const filterJenjang = ref(null);
const filterTahun = ref(null);
const pegawaiOptions = ref([]);

// Options
const jenjangOptions = [
  { label: 'SD', value: 'SD' },
  { label: 'SMP', value: 'SMP' },
  { label: 'SMA', value: 'SMA' },
  { label: 'SMK', value: 'SMK' },
  { label: 'D1', value: 'D1' },
  { label: 'D2', value: 'D2' },
  { label: 'D3', value: 'D3' },
  { label: 'D4', value: 'D4' },
  { label: 'S1', value: 'S1' },
  { label: 'S2', value: 'S2' },
  { label: 'S3', value: 'S3' }
];

// Statistik (computed)
const stats = computed(() => {
  const total = items.value.length;
  const sarjana = items.value.filter(i => ['S1', 'S2', 'S3'].includes(i.jenjang)).length;
  const diploma = items.value.filter(i => i.jenjang?.startsWith('D')).length;
  const sma = items.value.filter(i => ['SMA', 'SMK'].includes(i.jenjang)).length;
  return { total, sarjana, diploma, sma };
});

// Fetch data
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

const loadData = async () => {
  loading.value = true;
  try {
    let query = supabase
      .from('riwayat_pendidikan')
      .select('*, pegawai(id, nip, nama)')
      .order('created_at', { ascending: false });

    // Filter pencarian (NIP atau nama)
    if (searchQuery.value) {
      const searchTerm = `%${searchQuery.value}%`;
      // Karena filter cross-table complex, kita filter di frontend setelah ambil data (atau bisa dengan join, tapi sederhana)
      // Untuk efisiensi, kita ambil semua dulu lalu filter di frontend karena jumlah data tidak terlalu besar
    }
    // Filter jenjang
    if (filterJenjang.value) {
      query = query.eq('jenjang', filterJenjang.value);
    }
    // Filter tahun lulus
    if (filterTahun.value) {
      query = query.eq('tahun_lulus', filterTahun.value);
    }

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];
    // Filter pencarian (NIP atau nama) di frontend
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

const applyFilters = () => {
  loadData();
};

const resetFilters = () => {
  searchQuery.value = '';
  filterJenjang.value = null;
  filterTahun.value = null;
  loadData();
};

// CRUD
const openCreateModal = () => {
  isEditing.value = false;
  form.value = { pegawai_id: null, jenjang: null, institusi: '', tahun_lulus: null, ijazah_file: '' };
  errors.value = {};
  showDialog.value = true;
};

const openEditModal = (row) => {
  isEditing.value = true;
  selectedItem.value = row;
  form.value = {
    pegawai_id: row.pegawai_id,
    jenjang: row.jenjang,
    institusi: row.institusi || '',
    tahun_lulus: row.tahun_lulus,
    ijazah_file: row.ijazah_file || ''
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
  if (!form.value.jenjang) errors.value.jenjang = 'Jenjang harus dipilih';
  return Object.keys(errors.value).length === 0;
};

const saveData = async () => {
  if (!validate()) return;
  submitting.value = true;
  try {
    const payload = {
      pegawai_id: form.value.pegawai_id,
      jenjang: form.value.jenjang,
      institusi: form.value.institusi || null,
      tahun_lulus: form.value.tahun_lulus || null,
      ijazah_file: form.value.ijazah_file || null,
      updated_at: new Date().toISOString()
    };
    if (isEditing.value && selectedItem.value) {
      const { error } = await supabase
        .from('riwayat_pendidikan')
        .update(payload)
        .eq('id', selectedItem.value.id);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Riwayat pendidikan diperbarui', life: 3000 });
    } else {
      const { error } = await supabase
        .from('riwayat_pendidikan')
        .insert([{ ...payload, created_at: new Date().toISOString() }]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Riwayat pendidikan ditambahkan', life: 3000 });
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
      .from('riwayat_pendidikan')
      .delete()
      .eq('id', selectedItem.value.id);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Riwayat pendidikan dihapus', life: 3000 });
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
.riwayat-pendidikan-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem 0;
}

.riwayat-header {
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

.riwayat-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.riwayat-header-icon {
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

.riwayat-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.riwayat-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.riwayat-header-actions {
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

.riwayat-filters {
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.riwayat-table-wrap {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 1rem;
}

.riwayat-datatable {
  width: 100%;
}

.riwayat-datatable :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.75rem 1rem;
}

.riwayat-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}

.riwayat-datatable :deep(.p-datatable-tbody > tr:hover) {
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
  .riwayat-pendidikan-page {
    padding: 1rem;
  }
  .riwayat-header {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    width: 100%;
  }
  .riwayat-filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>