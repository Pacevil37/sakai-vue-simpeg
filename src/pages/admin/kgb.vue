<template>
  <div class="kgb-page">
    <!-- Header -->
    <div class="kgb-header">
      <div class="kgb-header-content">
        <div class="kgb-header-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <div>
          <h1 class="kgb-title">Manajemen KGB</h1>
          <p class="kgb-subtitle">Kelola data Kenaikan Gaji Berkala pegawai</p>
        </div>
      </div>
      <div class="kgb-header-actions">
        <InputGroup class="search-input">
          <InputGroupAddon>
            <i class="pi pi-search"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari NIP, nama, atau nomor SK..." />
        </InputGroup>
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
        <Button label="Tambah KGB" icon="pi pi-plus" @click="openCreateModal" class="btn-primary" />
      </div>
    </div>

    <!-- Statistik sederhana -->
    <div class="stats-grid">
      <div class="stat-card bg-blue-50">
        <div class="stat-icon">
          <i class="pi pi-dollar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total KGB</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card bg-green-50">
        <div class="stat-icon">
          <i class="pi pi-arrow-up"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Rata-rata Kenaikan</span>
          <span class="stat-value">{{ stats.rataKenaikan }}</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="kgb-table-wrap">
      <DataTable
        :value="items"
        :loading="loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} KGB"
        class="kgb-datatable"
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
        <Column field="nomor_sk" header="Nomor SK" />
        <Column field="gaji_lama" header="Gaji Lama">
          <template #body="{ data }">
            {{ formatRupiah(data.gaji_lama) }}
          </template>
        </Column>
        <Column field="gaji_baru" header="Gaji Baru">
          <template #body="{ data }">
            {{ formatRupiah(data.gaji_baru) }}
          </template>
        </Column>
        <Column field="tmt_kgb" header="TMT KGB" sortable>
          <template #body="{ data }">
            {{ formatDate(data.tmt_kgb) }}
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
          <div class="text-center py-4">Belum ada data KGB. Klik "Tambah KGB".</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Form Tambah/Edit -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Edit KGB' : 'Tambah KGB'"
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
        <label>Nomor SK</label>
        <InputText v-model="form.nomor_sk" />
      </div>
      <div class="field">
        <label>Tanggal SK</label>
        <DatePicker v-model="form.tanggal_sk" dateFormat="yy-mm-dd" placeholder="Pilih tanggal" />
      </div>
      <div class="field">
        <label>Gaji Lama</label>
        <InputNumber v-model="form.gaji_lama" mode="currency" currency="IDR" locale="id-ID" />
      </div>
      <div class="field">
        <label>Gaji Baru</label>
        <InputNumber v-model="form.gaji_baru" mode="currency" currency="IDR" locale="id-ID" />
      </div>
      <div class="field">
        <label>TMT KGB</label>
        <DatePicker v-model="form.tmt_kgb" dateFormat="yy-mm-dd" placeholder="Pilih TMT" />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="closeDialog" />
        <Button label="Simpan" @click="saveData" :loading="submitting" />
      </template>
    </Dialog>

    <!-- Dialog Detail -->
    <Dialog
      v-model:visible="showDetailDialog"
      header="Detail KGB"
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
        <span class="detail-label">Nomor SK:</span>
        <span class="detail-value">{{ detailData?.nomor_sk || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tanggal SK:</span>
        <span class="detail-value">{{ formatDate(detailData?.tanggal_sk) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Gaji Lama:</span>
        <span class="detail-value">{{ formatRupiah(detailData?.gaji_lama) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Gaji Baru:</span>
        <span class="detail-value">{{ formatRupiah(detailData?.gaji_baru) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">TMT KGB:</span>
        <span class="detail-value">{{ formatDate(detailData?.tmt_kgb) }}</span>
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
        <span>Yakin ingin menghapus KGB <strong>{{ selectedItem?.pegawai?.nama }}</strong>?</span>
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
  nomor_sk: '',
  tanggal_sk: null,
  gaji_lama: null,
  gaji_baru: null,
  tmt_kgb: null
});
const errors = ref({});

// Filter
const searchQuery = ref('');
const pegawaiOptions = ref([]);

// Statistik
const stats = computed(() => {
  const total = items.value.length;
  const persenKenaikanList = items.value
    .map(i => {
      if (i.gaji_lama && i.gaji_baru && i.gaji_lama > 0) {
        return ((i.gaji_baru - i.gaji_lama) / i.gaji_lama) * 100;
      }
      return null;
    })
    .filter(v => v !== null);
  const rataKenaikan = persenKenaikanList.length
    ? persenKenaikanList.reduce((a, b) => a + b, 0) / persenKenaikanList.length
    : 0;
  return {
    total,
    rataKenaikan: rataKenaikan.toFixed(1) + '%'
  };
});

// Helper
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

const formatRupiah = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
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
      .from('kgb')
      .select('*, pegawai(id, nip, nama)')
      .order('tmt_kgb', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    let filtered = data || [];
    if (searchQuery.value) {
      const term = searchQuery.value.toLowerCase();
      filtered = filtered.filter(item =>
        item.pegawai?.nip?.toLowerCase().includes(term) ||
        item.pegawai?.nama?.toLowerCase().includes(term) ||
        item.nomor_sk?.toLowerCase().includes(term)
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

// CRUD
const openCreateModal = () => {
  isEditing.value = false;
  form.value = {
    pegawai_id: null,
    nomor_sk: '',
    tanggal_sk: null,
    gaji_lama: null,
    gaji_baru: null,
    tmt_kgb: null
  };
  errors.value = {};
  showDialog.value = true;
};

const openEditModal = (row) => {
  isEditing.value = true;
  selectedItem.value = row;
  form.value = {
    pegawai_id: row.pegawai_id,
    nomor_sk: row.nomor_sk || '',
    tanggal_sk: row.tanggal_sk ? new Date(row.tanggal_sk) : null,
    gaji_lama: row.gaji_lama,
    gaji_baru: row.gaji_baru,
    tmt_kgb: row.tmt_kgb ? new Date(row.tmt_kgb) : null
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
  if (!form.value.gaji_lama && form.value.gaji_lama !== 0) errors.value.gaji_lama = 'Gaji lama harus diisi';
  if (!form.value.gaji_baru && form.value.gaji_baru !== 0) errors.value.gaji_baru = 'Gaji baru harus diisi';
  if (!form.value.tmt_kgb) errors.value.tmt_kgb = 'TMT KGB harus diisi';
  return Object.keys(errors.value).length === 0;
};

const saveData = async () => {
  if (!validate()) return;
  submitting.value = true;
  try {
    const payload = {
      pegawai_id: form.value.pegawai_id,
      nomor_sk: form.value.nomor_sk || null,
      tanggal_sk: form.value.tanggal_sk ? form.value.tanggal_sk.toISOString().split('T')[0] : null,
      gaji_lama: form.value.gaji_lama,
      gaji_baru: form.value.gaji_baru,
      tmt_kgb: form.value.tmt_kgb ? form.value.tmt_kgb.toISOString().split('T')[0] : null,
      updated_at: new Date().toISOString()
    };
    if (isEditing.value && selectedItem.value) {
      const { error } = await supabase
        .from('kgb')
        .update(payload)
        .eq('id', selectedItem.value.id);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'KGB diperbarui', life: 3000 });
    } else {
      const { error } = await supabase
        .from('kgb')
        .insert([{ ...payload, created_at: new Date().toISOString() }]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'KGB ditambahkan', life: 3000 });
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
      .from('kgb')
      .delete()
      .eq('id', selectedItem.value.id);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'KGB dihapus', life: 3000 });
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
.kgb-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem 0;
}

.kgb-header {
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

.kgb-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kgb-header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.kgb-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.kgb-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.kgb-header-actions {
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
  background: rgba(245,158,11,0.1);
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

.kgb-table-wrap {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 1rem;
}

.kgb-datatable {
  width: 100%;
}

.kgb-datatable :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.75rem 1rem;
}

.kgb-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}

.kgb-datatable :deep(.p-datatable-tbody > tr:hover) {
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
  .kgb-page {
    padding: 1rem;
  }
  .kgb-header {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    width: 100%;
  }
}
</style>