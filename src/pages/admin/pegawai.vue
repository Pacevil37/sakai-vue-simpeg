<template>
  <div class="grid">
    <div class="col-12">
      <div class="card">
        <!-- Header -->
        <div class="flex flex-column lg:flex-row justify-content-between align-items-start lg:align-items-center gap-3 mb-4">
          <div>
            <h4 class="text-900 font-bold mb-1">Manajemen Pegawai</h4>
            <p class="text-600 text-sm mb-0">Kelola data pegawai, tambah, edit, dan hapus informasi pegawai</p>
          </div>
          <div class="flex gap-2">
            <Button
              label="Export Excel"
              icon="pi pi-file-excel"
              class="p-button-success p-button-outlined"
              @click="exportPegawai"
              v-if="authStore.canViewAllPegawai"
            />
            <Button
              label="Tambah Pegawai"
              icon="pi pi-plus"
              class="p-button-primary"
              @click="openCreateModal"
              v-if="authStore.canCreatePegawai"
            />
          </div>
        </div>

        <!-- Filters -->
        <div class="grid mb-4">
          <div class="col-12 md:col-3">
            <label class="block font-medium mb-2">Cari</label>
            <InputText
              v-model="filters.search"
              placeholder="Cari NIP, nama, jabatan..."
              class="w-full"
              @keyup.enter="loadPegawai"
            />
          </div>
          <div class="col-12 md:col-3">
            <label class="block font-medium mb-2">Unit Kerja</label>
            <InputText
              v-model="filters.unit_kerja"
              placeholder="Filter unit kerja"
              class="w-full"
              @keyup.enter="loadPegawai"
            />
          </div>
          <div class="col-12 md:col-3">
            <label class="block font-medium mb-2">Golongan</label>
            <InputText
              v-model="filters.golongan"
              placeholder="Filter golongan"
              class="w-full"
              @keyup.enter="loadPegawai"
            />
          </div>
          <div class="col-12 md:col-3">
            <label class="block font-medium mb-2">&nbsp;</label>
            <div class="flex gap-2">
              <Button label="Cari" icon="pi pi-search" @click="loadPegawai" />
              <Button label="Reset" icon="pi pi-times" class="p-button-secondary" @click="resetFilters" />
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid mb-4" v-if="stats">
          <div class="col-12 md:col-3">
            <div class="card bg-blue-50 border-1 border-blue-200">
              <div class="flex align-items-center">
                <div class="flex-1">
                  <div class="text-blue-600 font-medium">Total Pegawai</div>
                  <div class="text-2xl font-bold text-blue-900">{{ stats.total || 0 }}</div>
                </div>
                <i class="pi pi-users text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="card bg-green-50 border-1 border-green-200">
              <div class="flex align-items-center">
                <div class="flex-1">
                  <div class="text-green-600 font-medium">Aktif</div>
                  <div class="text-2xl font-bold text-green-900">{{ stats.aktif || 0 }}</div>
                </div>
                <i class="pi pi-check-circle text-2xl text-green-600"></i>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="card bg-orange-50 border-1 border-orange-200">
              <div class="flex align-items-center">
                <div class="flex-1">
                  <div class="text-orange-600 font-medium">PNS</div>
                  <div class="text-2xl font-bold text-orange-900">{{ stats.pns || 0 }}</div>
                </div>
                <i class="pi pi-briefcase text-2xl text-orange-600"></i>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-3">
            <div class="card bg-purple-50 border-1 border-purple-200">
              <div class="flex align-items-center">
                <div class="flex-1">
                  <div class="text-purple-600 font-medium">CPNS</div>
                  <div class="text-2xl font-bold text-purple-900">{{ stats.cpns || 0 }}</div>
                </div>
                <i class="pi pi-graduation-cap text-2xl text-purple-600"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <DataTable
          :value="pegawai"
          :loading="loading"
          :paginator="true"
          :rows="pagination.limit"
          :totalRecords="pagination.total"
          :first="pagination.first"
          @page="onPageChange"
          responsiveLayout="scroll"
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords} pegawai"
        >
          <Column field="nip" header="NIP" sortable style="width: 15%">
            <template #body="{ data }">
              <span class="font-mono text-sm">{{ data.nip }}</span>
            </template>
          </Column>
          <Column field="nama" header="Nama" sortable style="width: 20%">
            <template #body="{ data }">
              <div>
                <div class="font-medium">{{ data.nama }}</div>
                <small class="text-gray-500">{{ data.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : 'Perempuan' }}</small>
              </div>
            </template>
          </Column>
          <Column field="jabatan" header="Jabatan" style="width: 20%">
            <template #body="{ data }">
              <div>
                <div class="font-medium">{{ data.jabatan || '-' }}</div>
                <small class="text-gray-500">{{ data.unit_kerja || '-' }}</small>
              </div>
            </template>
          </Column>
          <Column field="golongan" header="Golongan" style="width: 10%">
            <template #body="{ data }">{{ data.golongan || '-' }}</template>
          </Column>
          <Column field="status" header="Status" style="width: 10%">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="data.status === 'aktif' ? 'success' : 'danger'" />
            </template>
          </Column>
          <Column header="Aksi" style="width: 20%">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button icon="pi pi-eye" rounded text @click="viewDetail(data.id)" tooltip="Detail" />
                <Button icon="pi pi-pencil" rounded text @click="editPegawai(data)" tooltip="Edit" />
                <Button icon="pi pi-trash" rounded text severity="danger" @click="confirmDelete(data)" tooltip="Hapus" />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- Delete Dialog -->
        <Dialog v-model:visible="deleteDialogVisible" header="Konfirmasi Hapus" modal :style="{ width: '400px' }">
          <div class="text-center">
            <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
            <p>Yakin ingin menghapus pegawai <strong>{{ selectedPegawai?.nama }}</strong>?</p>
            <p class="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
          <template #footer>
            <Button label="Batal" icon="pi pi-times" text @click="deleteDialogVisible = false" />
            <Button label="Hapus" icon="pi pi-trash" severity="danger" :loading="deleting" @click="deletePegawai" />
          </template>
        </Dialog>
      </div>
    </div>
  </div>

  <!-- Modal Form (Create/Edit) -->
  <PegawaiFormModal
    :visible="formModalVisible"
    :pegawai="selectedPegawai"
    :isEditing="isEditing"
    @hide="closeFormModal"
    @saved="onPegawaiSaved"
  />
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import PegawaiFormModal from '@/components/PegawaiFormModal.vue';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

// Reactive data
const pegawai = ref([]);
const loading = ref(false);
const deleting = ref(false);
const deleteDialogVisible = ref(false);
const selectedPegawai = ref(null);
const isEditing = ref(false);
const formModalVisible = ref(false);
const stats = ref(null);

// Filters & Pagination
const filters = reactive({
  search: '',
  unit_kerja: '',
  golongan: '',
});
const pagination = reactive({
  first: 0,
  page: 1,
  limit: 10,
  total: 0,
});

// Helper: get status label (not used here, but keeping)
const getStatusSeverity = (status) => (status === 'aktif' ? 'success' : 'danger');

// Fetch pegawai data
const fetchPegawai = async () => {
  loading.value = true;
  try {
    let query = supabase
      .from('pegawai')
      .select('*', { count: 'exact' })
      .order('nama', { ascending: true })
      .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1);

    // Apply filters
    if (filters.search) {
      query = query.or(`nip.ilike.%${filters.search}%,nama.ilike.%${filters.search}%,jabatan.ilike.%${filters.search}%`);
    }
    if (filters.unit_kerja) {
      query = query.ilike('unit_kerja', `%${filters.unit_kerja}%`);
    }
    if (filters.golongan) {
      query = query.ilike('golongan', `%${filters.golongan}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    pegawai.value = data || [];
    pagination.total = count || 0;
  } catch (err) {
    console.error('Error fetching pegawai:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data pegawai', life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Fetch statistics (total, aktif, pns, cpns)
const fetchStats = async () => {
  try {
    const { count: total } = await supabase.from('pegawai').select('*', { count: 'exact', head: true });
    const { count: aktif } = await supabase.from('pegawai').select('*', { count: 'exact', head: true }).eq('status', 'aktif');
    const { count: pns } = await supabase.from('pegawai').select('*', { count: 'exact', head: true }).eq('status_kepegawaian', 'PNS');
    const { count: cpns } = await supabase.from('pegawai').select('*', { count: 'exact', head: true }).eq('status_kepegawaian', 'CPNS');
    stats.value = { total, aktif, pns: pns || 0, cpns: cpns || 0 };
  } catch (err) {
    console.error('Error fetching stats:', err);
    stats.value = { total: 0, aktif: 0, pns: 0, cpns: 0 };
  }
};

// Load all data
const loadPegawai = () => {
  pagination.page = 1;
  pagination.first = 0;
  fetchPegawai();
  fetchStats();
};

const resetFilters = () => {
  filters.search = '';
  filters.unit_kerja = '';
  filters.golongan = '';
  loadPegawai();
};

const onPageChange = (event) => {
  pagination.first = event.first;
  pagination.page = event.page + 1;
  pagination.limit = event.rows;
  fetchPegawai();
};

// Actions
const openCreateModal = () => {
  selectedPegawai.value = null;
  isEditing.value = false;
  formModalVisible.value = true;
};

const editPegawai = (peg) => {
  selectedPegawai.value = { ...peg };
  isEditing.value = true;
  formModalVisible.value = true;
};

const viewDetail = (id) => {
  router.push(`/pegawai/${id}`);
};

const confirmDelete = (peg) => {
  selectedPegawai.value = peg;
  deleteDialogVisible.value = true;
};

const deletePegawai = async () => {
  if (!selectedPegawai.value) return;
  deleting.value = true;
  try {
    const { error } = await supabase.from('pegawai').delete().eq('id', selectedPegawai.value.id);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pegawai dihapus', life: 3000 });
    loadPegawai();
    fetchStats();
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    deleting.value = false;
    deleteDialogVisible.value = false;
    selectedPegawai.value = null;
  }
};

const closeFormModal = () => {
  formModalVisible.value = false;
  selectedPegawai.value = null;
};

const onPegawaiSaved = () => {
  closeFormModal();
  loadPegawai();
  fetchStats();
  toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data pegawai disimpan', life: 3000 });
};

// Dummy export (implement later)
const exportPegawai = () => {
  toast.add({ severity: 'info', summary: 'Export', detail: 'Fitur export sedang dikembangkan', life: 2000 });
};

onMounted(() => {
  loadPegawai();
});
</script>

<style scoped>
.font-mono {
  font-family: monospace;
}
</style>