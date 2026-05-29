<template>
  <div class="pegawai-index-page">
    <div class="pegawai-index-header">
      <div class="pegawai-index-header-content">
        <div class="pegawai-index-header-icon">
          <i class="pi pi-users"></i>
        </div>
        <div>
          <h1 class="pegawai-index-title">Data Pegawai</h1>
          <p class="pegawai-index-subtitle">Kelola data pegawai dan informasi kepegawaian</p>
        </div>
      </div>
      <div class="pegawai-index-header-actions">
        <Button label="Tambah Pegawai" icon="pi pi-plus" @click="navigateToCreate" v-if="authStore.canCreatePegawai" class="pegawai-index-btn pegawai-index-btn--primary" />
        <Button label="Edit" icon="pi pi-pencil" severity="warning" @click="editPegawai(selectedPegawai)" :disabled="!selectedPegawai" v-if="authStore.canEditPegawai" class="pegawai-index-btn" />
        <Button label="Hapus" icon="pi pi-trash" severity="danger" @click="confirmDelete(selectedPegawai)" :disabled="!selectedPegawai" v-if="authStore.canDeletePegawai" class="pegawai-index-btn" />
      </div>
    </div>

    <!-- Filters -->
    <div class="pegawai-index-filters">
      <div class="pegawai-index-filter">
        <label for="search" class="pegawai-index-filter-label">Cari</label>
        <InputText id="search" v-model="filters.search" placeholder="Cari nama, NIP, atau email..." @input="onSearch" class="pegawai-index-filter-input" />
      </div>
      <div class="pegawai-index-filter">
        <label for="department" class="pegawai-index-filter-label">Unit Kerja</label>
        <Select id="department" v-model="filters.unit_kerja_id" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Semua Unit" @change="onFilterChange" class="pegawai-index-filter-input" />
      </div>
      <div class="pegawai-index-filter">
        <label for="status" class="pegawai-index-filter-label">Status</label>
        <Select id="status" v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Semua Status" @change="onFilterChange" class="pegawai-index-filter-input" />
      </div>
      <div class="pegawai-index-filter">
        <label for="position" class="pegawai-index-filter-label">Jabatan</label>
        <Select id="position" v-model="filters.jabatan" :options="jabatanOptions" optionLabel="label" optionValue="value" placeholder="Semua Jabatan" @change="onFilterChange" class="pegawai-index-filter-input" />
      </div>
    </div>

    <!-- Data Table -->
    <div class="pegawai-index-table-wrap">
      <DataTable
        :value="pegawaiData"
        :loading="loading"
        :paginator="true"
        :rows="pagination.limit"
        :totalRecords="pagination.total"
        :lazy="true"
        v-model:selection="selectedPegawai"
        selectionMode="single"
        dataKey="id"
        @page="onPageChange"
        @sort="onSort"
        :sortField="sortField"
        :sortOrder="sortOrder"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[10, 25, 50]"
        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} pegawai"
        class="pegawai-index-datatable"
      >
        <Column field="nip" header="NIP" :sortable="true">
          <template #body="{ data }">
            <span class="font-semibold">{{ data.nip }}</span>
          </template>
        </Column>

        <Column field="nama" header="Nama" :sortable="true">
          <template #body="{ data }">
            <div class="flex align-items-center">
              <template v-if="getPegawaiPhoto(data) && !photoLoadFailures[data.id]">
                <img :src="getPegawaiPhoto(data)" alt="Foto" class="pegawai-table-photo mr-2" @error="onPhotoError(data.id)" />
              </template>
              <Avatar v-else :label="(data.nama || '').charAt(0)" shape="circle" size="small" class="pegawai-table-avatar mr-2" />
              <div>
                <div class="font-semibold">{{ data.nama }}</div>
                <div class="text-sm text-gray-600">{{ data.email || '-' }}</div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="jabatan" header="Jabatan" :sortable="true">
          <template #body="{ data }">
            <Tag :value="data.jabatan || '-'" :severity="getPositionSeverity(data.jabatan)" />
          </template>
        </Column>

        <Column field="unit_kerja_id" header="Unit Kerja" :sortable="true">
          <template #body="{ data }">
            <span>{{ getUnitName(data.unit_kerja_id) || '-' }}</span>
          </template>
        </Column>

        <Column field="golongan" header="Pangkat/Golongan" :sortable="true">
          <template #body="{ data }">
            <span>{{ data.golongan || '-' }}</span>
          </template>
        </Column>

        <Column field="status" header="Status" :sortable="true">
          <template #body="{ data }">
            <Tag :value="data.status === 'aktif' ? 'Aktif' : 'Non-Aktif'" :severity="getStatusSeverity(data.status)" />
          </template>
        </Column>

        <Column field="created_at" header="Tanggal Masuk" :sortable="true">
          <template #body="{ data }">
            <span>{{ formatDate(data.created_at) }}</span>
          </template>
        </Column>

        <Column header="Aksi" :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-eye" severity="info" size="small" @click="viewPegawai(data)" v-tooltip.top="'Lihat Detail'" />
              <Button icon="pi pi-pencil" severity="warning" size="small" @click="editPegawai(data)" v-if="authStore.canEditPegawai" v-tooltip.top="'Edit'" />
              <Button icon="pi pi-trash" severity="danger" size="small" @click="confirmDelete(data)" v-if="authStore.canDeletePegawai" v-tooltip.top="'Hapus'" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Konfirmasi Hapus" :modal="true">
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="selectedPegawai">
          Apakah Anda yakin ingin menghapus pegawai <b>{{ selectedPegawai.nama }}</b>?
        </span>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" @click="deleteDialog = false" severity="secondary" />
        <Button label="Hapus" icon="pi pi-check" @click="deletePegawai" severity="danger" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Avatar from 'primevue/avatar';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// Data
const pegawaiData = ref([]);
const loading = ref(false);
const deleting = ref(false);
const deleteDialog = ref(false);
const selectedPegawai = ref(null);

// Filters
const filters = ref({
  search: '',
  unit_kerja_id: null,
  status: null,
  jabatan: null
});

// Pagination
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0
});

// Sorting
const sortField = ref('nama');
const sortOrder = ref(1);

// Options for dropdowns
const unitOptions = ref([]);
const jabatanOptions = ref([]);
const statusOptions = ref([
  { label: 'Aktif', value: 'aktif' },
  { label: 'Non-Aktif', value: 'pensiun' },
  { label: 'Mutasi', value: 'mutasi' }
]);

// Photo failure tracking
const photoLoadFailures = ref({});

// Helper to get unit name from ID
const unitMap = ref({});

const getUnitName = (id) => {
  if (!id) return null;
  return unitMap.value[id] || null;
};

// Fetch unit options (from units table)
const fetchUnitOptions = async () => {
  const { data, error } = await supabase.from('units').select('id, name');
  if (error) {
    console.error('Error fetching units:', error);
    return;
  }
  unitOptions.value = data.map(u => ({ label: u.name, value: u.id }));
  // Build map for quick lookup
  unitMap.value = Object.fromEntries(data.map(u => [u.id, u.name]));
};

// Fetch distinct jabatan from pegawai
const fetchJabatanOptions = async () => {
  const { data, error } = await supabase
    .from('pegawai')
    .select('jabatan')
    .not('jabatan', 'is', null);
  if (error) {
    console.error('Error fetching jabatan options:', error);
    return;
  }
  const unique = [...new Set(data.map(p => p.jabatan).filter(Boolean))];
  jabatanOptions.value = unique.map(j => ({ label: j, value: j }));
};

const loadPegawai = async () => {
  try {
    loading.value = true;
    let query = supabase
      .from('pegawai')
      .select('*', { count: 'exact' });

    // Filter by search (nip, nama, email)
    if (filters.value.search) {
      const searchTerm = `%${filters.value.search}%`;
      query = query.or(`nip.ilike.${searchTerm},nama.ilike.${searchTerm},email.ilike.${searchTerm}`);
    }
    // Filter unit_kerja_id
    if (filters.value.unit_kerja_id) {
      query = query.eq('unit_kerja_id', filters.value.unit_kerja_id);
    }
    // Filter status
    if (filters.value.status) {
      query = query.eq('status', filters.value.status);
    }
    // Filter jabatan
    if (filters.value.jabatan) {
      query = query.eq('jabatan', filters.value.jabatan);
    }

    // Sorting
    const orderField = sortField.value === 'nama' ? 'nama' : sortField.value;
    const orderDirection = sortOrder.value === 1 ? { ascending: true } : { ascending: false };
    query = query.order(orderField, orderDirection);

    // Pagination
    const from = (pagination.value.page - 1) * pagination.value.limit;
    const to = from + pagination.value.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    pegawaiData.value = data || [];
    pagination.value.total = count || 0;
  } catch (error) {
    console.error('Error loading pegawai:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pegawai',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event) => {
  pagination.value.page = event.page + 1;
  pagination.value.limit = event.rows;
  loadPegawai();
};

const onSort = (event) => {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
  loadPegawai();
};

const onSearch = () => {
  pagination.value.page = 1;
  loadPegawai();
};

const onFilterChange = () => {
  pagination.value.page = 1;
  loadPegawai();
};

const navigateToCreate = () => {
  router.push('/pegawai/create');
};

const viewPegawai = (pegawai) => {
  router.push(`/pegawai/${pegawai.id}`);
};

const editPegawai = (pegawai) => {
  router.push(`/pegawai/${pegawai.id}/edit`);
};

const confirmDelete = (pegawai) => {
  selectedPegawai.value = pegawai;
  deleteDialog.value = true;
};

const deletePegawai = async () => {
  try {
    deleting.value = true;
    const { error } = await supabase
      .from('pegawai')
      .delete()
      .eq('id', selectedPegawai.value.id);
    if (error) throw error;

    toast.add({
      severity: 'success',
      summary: 'Berhasil',
      detail: 'Pegawai berhasil dihapus',
      life: 3000
    });

    deleteDialog.value = false;
    selectedPegawai.value = null;
    loadPegawai();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal menghapus pegawai',
      life: 3000
    });
  } finally {
    deleting.value = false;
  }
};

const getStatusSeverity = (status) => {
  switch (status) {
    case 'aktif': return 'success';
    case 'pensiun': return 'danger';
    case 'mutasi': return 'warning';
    default: return 'info';
  }
};

const getPositionSeverity = (position) => {
  if (!position) return 'info';
  const pos = position.toLowerCase();
  if (pos.includes('kepala')) return 'success';
  if (pos.includes('manager')) return 'success';
  if (pos.includes('supervisor')) return 'info';
  if (pos.includes('staff')) return 'secondary';
  return 'info';
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

const getPegawaiPhoto = (data) => {
  if (!data) return '';
  // If foto_url exists and not empty
  if (data.foto_url) return data.foto_url;
  // Default fallback - bisa menggunakan placeholder
  return '';
};

const onPhotoError = (id) => {
  photoLoadFailures.value = { ...photoLoadFailures.value, [id]: true };
};

// Lifecycle
onMounted(async () => {
  await Promise.all([fetchUnitOptions(), fetchJabatanOptions()]);
  loadPegawai();
});
</script>

<style scoped>
/* (Salin semua style dari kode asli, tidak perlu diubah) */
.pegawai-index-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 1.5rem 0;
}

.pegawai-index-header {
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

.pegawai-index-header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.pegawai-index-header-icon {
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

.pegawai-index-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
}

.pegawai-index-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0.25rem 0 0 0;
}

.pegawai-index-header-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.pegawai-index-btn--primary {
    font-weight: 600;
}

.pegawai-index-filters {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
    .pegawai-index-filters { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
    .pegawai-index-filters { grid-template-columns: repeat(4, 1fr); }
}

.pegawai-index-filter-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
    margin-bottom: 0.375rem;
}

.pegawai-index-filter-input {
    width: 100%;
}

.pegawai-index-table-wrap {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    border: 1px solid #e2e8f0;
    overflow: hidden;
}

.pegawai-index-datatable :deep(.p-datatable-thead > tr > th) {
    background: #f8fafc;
    font-weight: 600;
    font-size: 0.8125rem;
    padding: 0.75rem 1rem;
}

.pegawai-index-datatable :deep(.p-datatable-tbody > tr > td) {
    padding: 0.75rem 1rem;
}

.pegawai-index-datatable :deep(.p-datatable-tbody > tr:hover) {
    background: #f8fafc;
}

.pegawai-index-datatable :deep(.p-datatable-tbody > tr.p-highlight) {
    background: #eff6ff;
}

.pegawai-table-photo {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
}

.pegawai-table-avatar {
    flex-shrink: 0;
}
</style>