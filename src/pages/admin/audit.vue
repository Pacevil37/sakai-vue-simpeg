<template>
  <div class="audit-page">
    <!-- Header -->
    <div class="audit-header">
      <div class="audit-header-content">
        <div class="audit-header-icon">
          <i class="pi pi-history"></i>
        </div>
        <div>
          <h1 class="audit-title">Audit Log</h1>
          <p class="audit-subtitle">Pantau aktivitas sistem dan perubahan data</p>
        </div>
      </div>
      <div class="audit-header-actions">
        <InputGroup class="search-input">
          <InputGroupAddon>
            <i class="pi pi-search"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari aksi, tabel, atau user..." />
        </InputGroup>
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
      </div>
    </div>

    <!-- Filter tambahan -->
    <div class="audit-filters">
      <div class="filter-item">
        <label>Aksi</label>
        <Select
          v-model="filterAction"
          :options="actionOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Semua aksi"
          clearable
        />
      </div>
      <div class="filter-item">
        <label>Tabel</label>
        <Select
          v-model="filterTable"
          :options="tableOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Semua tabel"
          clearable
        />
      </div>
      <div class="filter-item">
        <label>Rentang Tanggal</label>
        <DatePicker v-model="dateRange" selectionMode="range" placeholder="Pilih rentang" class="w-full" />
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
          <i class="pi pi-chart-line"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Log</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card bg-green-50">
        <div class="stat-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">User Aktif</span>
          <span class="stat-value">{{ stats.uniqueUsers }}</span>
        </div>
      </div>
      <div class="stat-card bg-orange-50">
        <div class="stat-icon">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Aksi Hari Ini</span>
          <span class="stat-value">{{ stats.todayActions }}</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="audit-table-wrap">
      <DataTable
        :value="items"
        :loading="loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} log"
        class="audit-datatable"
      >
        <Column field="created_at" header="Waktu" sortable>
          <template #body="{ data }">
            {{ formatDateTime(data.created_at) }}
          </template>
        </Column>
        <Column field="user_email" header="User" sortable>
          <template #body="{ data }">
            <span class="font-semibold">{{ data.user_email || 'System' }}</span>
          </template>
        </Column>
        <Column field="aksi" header="Aksi" sortable />
        <Column field="table_name" header="Tabel" />
        <Column field="record_id" header="Record ID" />
        <Column field="ip_address" header="IP Address" />
        <Column header="Aksi" :exportable="false" style="min-width: 5rem">
          <template #body="{ data }">
            <Button icon="pi pi-eye" severity="info" size="small" @click="viewDetail(data)" v-tooltip.top="'Detail'" />
          </template>
        </Column>
        <template #empty>
          <div class="text-center py-4">Belum ada data audit log.</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Detail -->
    <Dialog
      v-model:visible="showDetailDialog"
      header="Detail Audit Log"
      :style="{ width: '500px' }"
      modal
    >
      <div class="detail-item">
        <span class="detail-label">Waktu:</span>
        <span class="detail-value">{{ formatDateTime(detailData?.created_at) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">User:</span>
        <span class="detail-value">{{ detailData?.user_email || 'System' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Aksi:</span>
        <span class="detail-value">{{ detailData?.aksi }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tabel:</span>
        <span class="detail-value">{{ detailData?.table_name }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Record ID:</span>
        <span class="detail-value">{{ detailData?.record_id || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">IP Address:</span>
        <span class="detail-value">{{ detailData?.ip_address || '-' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Detail Lama:</span>
        <pre class="detail-pre">{{ formatJson(detailData?.old_values) }}</pre>
      </div>
      <div class="detail-item">
        <span class="detail-label">Detail Baru:</span>
        <pre class="detail-pre">{{ formatJson(detailData?.new_values) }}</pre>
      </div>
      <template #footer>
        <Button label="Tutup" @click="showDetailDialog = false" />
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
const showDetailDialog = ref(false);
const detailData = ref(null);

// Filter
const searchQuery = ref('');
const filterAction = ref(null);
const filterTable = ref(null);
const dateRange = ref(null);

// Options (untuk filter dropdown)
const actionOptions = ref([
  { label: 'INSERT', value: 'INSERT' },
  { label: 'UPDATE', value: 'UPDATE' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'LOGIN', value: 'LOGIN' },
  { label: 'LOGOUT', value: 'LOGOUT' }
]);
const tableOptions = ref([
  { label: 'pegawai', value: 'pegawai' },
  { label: 'cuti', value: 'cuti' },
  { label: 'mutasi', value: 'mutasi' },
  { label: 'user_roles', value: 'user_roles' }
]);

// Statistik
const stats = computed(() => {
  const total = items.value.length;
  const uniqueUsers = new Set(items.value.map(i => i.user_email).filter(Boolean)).size;
  const today = new Date().toISOString().split('T')[0];
  const todayActions = items.value.filter(i => i.created_at?.startsWith(today)).length;
  return { total, uniqueUsers, todayActions };
});

// Helper
const formatDateTime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID');
};

const formatJson = (json) => {
  if (!json) return '-';
  try {
    return JSON.stringify(json, null, 2);
  } catch {
    return json;
  }
};

// Load data
const loadData = async () => {
  loading.value = true;
  try {
    let query = supabase
      .from('log_aktivitas')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchQuery.value) {
      const term = `%${searchQuery.value}%`;
      query = query.or(`aksi.ilike.${term},table_name.ilike.${term},user_email.ilike.${term}`);
    }
    if (filterAction.value) {
      query = query.eq('aksi', filterAction.value);
    }
    if (filterTable.value) {
      query = query.eq('table_name', filterTable.value);
    }
    if (dateRange.value && dateRange.value.length === 2) {
      const [start, end] = dateRange.value;
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;
    items.value = data || [];
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
  filterAction.value = null;
  filterTable.value = null;
  dateRange.value = null;
  loadData();
};

// Detail
const viewDetail = (row) => {
  detailData.value = row;
  showDetailDialog.value = true;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.audit-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem;
}

.audit-header {
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

.audit-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.audit-header-icon {
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

.audit-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.audit-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.audit-header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  min-width: 250px;
}

.audit-filters {
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

.audit-table-wrap {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 1rem;
}

.audit-datatable {
  width: 100%;
}
.audit-datatable :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.75rem 1rem;
}
.audit-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}
.audit-datatable :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
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
.detail-pre {
  background: #f1f5f9;
  padding: 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  overflow-x: auto;
  margin: 0;
  flex: 1;
}

@media (max-width: 640px) {
  .audit-page { padding: 1rem; }
  .audit-header { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .audit-filters { flex-direction: column; align-items: stretch; }
}
</style>