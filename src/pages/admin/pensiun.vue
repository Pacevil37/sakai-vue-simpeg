<template>
  <div class="pensiun-page">
    <!-- Header -->
    <div class="pensiun-header">
      <div class="pensiun-header-content">
        <div class="pensiun-header-icon">
          <i class="pi pi-calendar-times"></i>
        </div>
        <div>
          <h1 class="pensiun-title">Manajemen Pensiun</h1>
          <p class="pensiun-subtitle">Kelola data pensiun pegawai</p>
        </div>
      </div>
      <div class="pensiun-header-actions">
        <InputGroup class="search-input">
          <InputGroupAddon>
            <i class="pi pi-search"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari NIP atau nama pegawai..." />
        </InputGroup>
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
        <Button label="Tambah Pensiun" icon="pi pi-plus" @click="openCreateModal" class="btn-primary" />
      </div>
    </div>

    <!-- Filter (jenis pensiun saja, karena status tidak ada) -->
    <div class="pensiun-filters">
      <div class="filter-item">
        <label>Jenis Pensiun</label>
        <Select
          v-model="filterJenisPensiun"
          :options="jenisPensiunOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Semua jenis"
          clearable
        />
      </div>
      <div class="filter-item">
        <Button label="Terapkan Filter" icon="pi pi-filter" @click="applyFilters" />
        <Button label="Reset" icon="pi pi-times" severity="secondary" outlined @click="resetFilters" />
      </div>
    </div>

    <!-- Statistik sederhana (total dan berdasarkan jenis pensiun) -->
    <div class="stats-grid">
      <div class="stat-card bg-blue-50">
        <div class="stat-icon"><i class="pi pi-users"></i></div>
        <div class="stat-info">
          <span class="stat-label">Total Pensiun</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card bg-green-50">
        <div class="stat-icon"><i class="pi pi-star"></i></div>
        <div class="stat-info">
          <span class="stat-label">BUP</span>
          <span class="stat-value">{{ stats.bup }}</span>
        </div>
      </div>
      <div class="stat-card bg-purple-50">
        <div class="stat-icon"><i class="pi pi-user-minus"></i></div>
        <div class="stat-info">
          <span class="stat-label">Janda/Duda</span>
          <span class="stat-value">{{ stats.jandaDuda }}</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="pensiun-table-wrap">
      <DataTable
        :value="items"
        :loading="loading"
        paginator
        :rows="10"
        class="pensiun-datatable"
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
        <Column field="jenis_pensiun" header="Jenis Pensiun">
          <template #body="{ data }">
            <Tag :value="getJenisPensiunLabel(data.jenis_pensiun)" />
          </template>
        </Column>
        <Column field="tmt_pensiun" header="TMT Pensiun" sortable>
          <template #body="{ data }">
            {{ formatDate(data.tmt_pensiun) }}
          </template>
        </Column>
        <Column field="nomor_sk" header="Nomor SK" />
        <Column field="tanggal_sk" header="Tanggal SK">
          <template #body="{ data }">
            {{ formatDate(data.tanggal_sk) }}
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
          <div class="text-center py-4">Belum ada data pensiun. Klik "Tambah Pensiun".</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Form Tambah/Edit -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Edit Pensiun' : 'Tambah Pensiun'"
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
        <label>Jenis Pensiun <span class="text-red-500">*</span></label>
        <Select
          v-model="form.jenis_pensiun"
          :options="jenisPensiunOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih jenis pensiun"
          :class="{ 'p-invalid': errors.jenis_pensiun }"
        />
        <small v-if="errors.jenis_pensiun" class="p-error">{{ errors.jenis_pensiun }}</small>
      </div>
      <div class="field">
        <label>TMT Pensiun <span class="text-red-500">*</span></label>
        <DatePicker v-model="form.tmt_pensiun" dateFormat="yy-mm-dd" placeholder="Pilih tanggal" :class="{ 'p-invalid': errors.tmt_pensiun }" />
        <small v-if="errors.tmt_pensiun" class="p-error">{{ errors.tmt_pensiun }}</small>
      </div>
      <div class="field">
        <label>Nomor SK</label>
        <InputText v-model="form.nomor_sk" placeholder="Nomor SK pensiun" />
      </div>
      <div class="field">
        <label>Tanggal SK</label>
        <DatePicker v-model="form.tanggal_sk" dateFormat="yy-mm-dd" placeholder="Pilih tanggal SK" />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="closeDialog" />
        <Button label="Simpan" @click="saveData" :loading="submitting" />
      </template>
    </Dialog>

    <!-- Dialog Detail -->
    <Dialog
      v-model:visible="showDetailDialog"
      header="Detail Pensiun"
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
        <span class="detail-label">Jenis Pensiun:</span>
        <span class="detail-value">{{ getJenisPensiunLabel(detailData?.jenis_pensiun) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">TMT Pensiun:</span>
        <span class="detail-value">{{ formatDate(detailData?.tmt_pensiun) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Nomor SK:</span>
        <span class="detail-value">{{ detailData?.nomor_sk || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tanggal SK:</span>
        <span class="detail-value">{{ formatDate(detailData?.tanggal_sk) }}</span>
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
        <span>Yakin ingin menghapus pensiun <strong>{{ selectedItem?.pegawai?.nama }}</strong>?</span>
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
  jenis_pensiun: '',
  tmt_pensiun: null,
  nomor_sk: '',
  tanggal_sk: null
});
const errors = ref({});

const searchQuery = ref('');
const filterJenisPensiun = ref(null);
const pegawaiOptions = ref([]);

const jenisPensiunOptions = ref([
  { label: 'BUP (Batas Usia Pensiun)', value: 'bup' },
  { label: 'Janda/Duda', value: 'janda_duda' },
  { label: 'Atas Permintaan Sendiri', value: 'aps' },
  { label: 'Pemberhentian', value: 'pemberhentian' },
  { label: 'Meninggal Dunia', value: 'meninggal_dunia' }
]);

// Statistik
const stats = computed(() => {
  const total = items.value.length;
  const bup = items.value.filter(i => i.jenis_pensiun === 'bup').length;
  const jandaDuda = items.value.filter(i => i.jenis_pensiun === 'janda_duda').length;
  return { total, bup, jandaDuda };
});

// Helpers
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};
const getJenisPensiunLabel = (value) => {
  const found = jenisPensiunOptions.value.find(opt => opt.value === value);
  return found ? found.label : value;
};
const toYMD = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

// Fetch data
const loadPegawaiOptions = async () => {
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

const loadData = async () => {
  loading.value = true;
  try {
    let query = supabase
      .from('pensiun')
      .select('*, pegawai(id, nip, nama)')
      .order('tmt_pensiun', { ascending: false });
    if (filterJenisPensiun.value) query = query.eq('jenis_pensiun', filterJenisPensiun.value);
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
  filterJenisPensiun.value = null;
  loadData();
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
  if (!form.value.jenis_pensiun) errors.value.jenis_pensiun = 'Jenis pensiun harus dipilih';
  if (!form.value.tmt_pensiun) errors.value.tmt_pensiun = 'TMT pensiun harus diisi';
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
      tanggal_sk: toYMD(form.value.tanggal_sk),
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    console.log('Payload pensiun:', payload);
    if (isEditing.value && selectedItem.value) {
      const { error } = await supabase
        .from('pensiun')
        .update(payload)
        .eq('id', selectedItem.value.id);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pensiun diperbarui', life: 3000 });
    } else {
      const { error } = await supabase
        .from('pensiun')
        .insert([payload]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pensiun ditambahkan', life: 3000 });
    }
    closeDialog();
    await loadData();
  } catch (err) {
    console.error('Save error:', err);
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
      .from('pensiun')
      .delete()
      .eq('id', selectedItem.value.id);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pensiun dihapus', life: 3000 });
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
.pensiun-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.pensiun-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--surface-card);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid var(--surface-border);
}
.pensiun-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.pensiun-header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.pensiun-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}
.pensiun-subtitle {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0;
}
.pensiun-header-actions {
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

/* Filters */
.pensiun-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--surface-card);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--surface-border);
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
  color: var(--text-color-secondary);
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: var(--surface-card);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid var(--surface-border);
}
.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: rgba(236,72,153,0.1);
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
  color: var(--text-color-secondary);
  display: block;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
}

/* Table */
.pensiun-table-wrap {
  background: var(--surface-card);
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid var(--surface-border);
  overflow: hidden;
  padding: 1rem;
}
.pensiun-datatable {
  width: 100%;
}
.pensiun-datatable :deep(.p-datatable-thead > tr > th) {
  background: var(--surface-hover);
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.75rem 1rem;
}
.pensiun-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}
.pensiun-datatable :deep(.p-datatable-tbody > tr:hover) {
  background: var(--surface-hover);
}

/* Form */
.field {
  margin-bottom: 1.25rem;
}
.field label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: var(--text-color-secondary);
}
.p-error {
  color: var(--red-500);
  font-size: 0.75rem;
  display: block;
  margin-top: 0.25rem;
}

/* Detail */
.detail-item {
  display: flex;
  margin-bottom: 0.75rem;
}
.detail-label {
  width: 120px;
  font-weight: 600;
  color: var(--text-color-secondary);
}
.detail-value {
  flex: 1;
  color: var(--text-color);
}

/* Responsive */
@media (max-width: 640px) {
  .pensiun-page {
    padding: 1rem;
  }
  .pensiun-header {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    width: 100%;
  }
  .pensiun-filters {
    flex-direction: column;
    align-items: stretch;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>