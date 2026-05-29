<template>
  <div class="pensiun-pegawai-page">
    <!-- Header -->
    <div class="pensiun-header">
      <div class="pensiun-header-content">
        <div class="pensiun-header-icon">
          <i class="pi pi-calendar-times"></i>
        </div>
        <div>
          <h1 class="pensiun-title">Data Pensiun Saya</h1>
          <p class="pensiun-subtitle">Informasi pensiun dan status kepegawaian</p>
        </div>
      </div>
      <div class="pensiun-header-actions">
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
      </div>
    </div>

    <!-- Statistik Sederhana -->
    <div v-if="stats.total > 0" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="pi pi-calendar-times"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Pensiun</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Status Aktif</span>
          <span class="stat-value">{{ stats.aktif }}</span>
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
        <Column field="jenis_pensiun" header="Jenis Pensiun">
          <template #body="{ data }">
            <Tag :value="getJenisPensiunLabel(data.jenis_pensiun)" severity="info" />
          </template>
        </Column>
        <Column field="tmt_pensiun" header="TMT Pensiun">
          <template #body="{ data }">
            {{ formatDate(data.tmt_pensiun) }}
          </template>
        </Column>
        <Column field="nomor_sk" header="Nomor SK" />
        <Column field="status" header="Status">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
          </template>
        </Column>
        <Column header="Aksi" :exportable="false" style="min-width: 5rem">
          <template #body="{ data }">
            <Button icon="pi pi-eye" severity="info" size="small" @click="viewDetail(data)" v-tooltip.top="'Detail'" />
          </template>
        </Column>
        <template #empty>
          <div class="text-center py-4 text-secondary">Belum ada data pensiun.</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Detail -->
    <Dialog
      v-model:visible="detailDialogVisible"
      header="Detail Pensiun"
      :style="{ width: '500px' }"
      modal
    >
      <div v-if="selectedItem" class="detail-content">
        <div class="detail-item">
          <span class="detail-label">Jenis Pensiun:</span>
          <span class="detail-value">{{ getJenisPensiunLabel(selectedItem.jenis_pensiun) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">TMT Pensiun:</span>
          <span class="detail-value">{{ formatDate(selectedItem.tmt_pensiun) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Nomor SK:</span>
          <span class="detail-value">{{ selectedItem.nomor_sk || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Tanggal SK:</span>
          <span class="detail-value">{{ formatDate(selectedItem.tanggal_sk) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Status:</span>
          <span class="detail-value">
            <Tag :value="selectedItem.status" :severity="getStatusSeverity(selectedItem.status)" />
          </span>
        </div>
        <div class="detail-item">
          <span class="detail-label">File SK:</span>
          <span class="detail-value">
            <a v-if="selectedItem.file_sk_url" :href="selectedItem.file_sk_url" target="_blank" class="text-primary">Lihat file</a>
            <span v-else>-</span>
          </span>
        </div>
      </div>
      <template #footer>
        <Button label="Tutup" @click="detailDialogVisible = false" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';

const toast = useToast();
const authStore = useAuthStore();

// State
const items = ref([]);
const loading = ref(false);
const detailDialogVisible = ref(false);
const selectedItem = ref(null);

// Statistik
const stats = computed(() => {
  const total = items.value.length;
  const aktif = items.value.filter(i => i.status === 'aktif').length;
  return { total, aktif };
});

// Helper
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

const getJenisPensiunLabel = (value) => {
  const map = {
    bup: 'BUP (Batas Usia Pensiun)',
    janda_duda: 'Janda/Duda',
    aps: 'Atas Permintaan Sendiri',
    pemberhentian: 'Pemberhentian',
    meninggal_dunia: 'Meninggal Dunia'
  };
  return map[value] || value;
};

const getStatusSeverity = (status) => {
  switch (status) {
    case 'aktif': return 'success';
    case 'selesai': return 'info';
    case 'dibatalkan': return 'danger';
    default: return 'secondary';
  }
};

// Load data
const loadData = async () => {
  loading.value = true;
  try {
    const userEmail = authStore.user?.email;
    if (!userEmail) {
      items.value = [];
      return;
    }
    // Ambil pegawai_id dari email
    const { data: pegawai, error: pegawaiError } = await supabase
      .from('pegawai')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();
    if (pegawaiError) throw pegawaiError;
    if (!pegawai) {
      items.value = [];
      return;
    }
    // Ambil data pensiun berdasarkan pegawai_id
    const { data, error } = await supabase
      .from('pensiun')
      .select('*')
      .eq('pegawai_id', pegawai.id)
      .order('tmt_pensiun', { ascending: false });
    if (error) throw error;
    items.value = data || [];
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

const viewDetail = (item) => {
  selectedItem.value = item;
  detailDialogVisible.value = true;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.pensiun-pegawai-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--surface-border);
}
.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: rgba(236, 72, 153, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #ec4899;
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

.pensiun-table-wrap {
  background: var(--surface-card);
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
  color: var(--text-color);
}
.pensiun-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
  color: var(--text-color);
}
.pensiun-datatable :deep(.p-datatable-tbody > tr:hover) {
  background: var(--surface-hover);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.detail-item {
  display: flex;
  margin-bottom: 0.5rem;
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
.text-primary {
  color: var(--primary-color);
  text-decoration: none;
}
.text-primary:hover {
  text-decoration: underline;
}
.text-secondary {
  color: var(--text-color-secondary);
}

@media (max-width: 640px) {
  .pensiun-pegawai-page {
    padding: 1rem;
  }
  .pensiun-header {
    flex-direction: column;
    align-items: stretch;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>