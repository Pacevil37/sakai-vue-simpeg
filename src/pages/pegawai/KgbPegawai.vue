<template>
  <div class="kgb-pegawai-page">
    <!-- Header -->
    <div class="kgb-header">
      <div class="kgb-header-content">
        <div class="kgb-header-icon">
          <i class="pi pi-money-bill"></i>
        </div>
        <div>
          <h1 class="kgb-title">Kenaikan Gaji Berkala (KGB)</h1>
          <p class="kgb-subtitle">Riwayat kenaikan gaji berkala Anda</p>
        </div>
      </div>
    </div>

    <!-- Form Tambah (hanya admin/operator) -->
    <div v-if="canManage" class="form-card">
      <div class="form-header">
        <i class="pi pi-plus-circle"></i>
        <h3>Tambah KGB</h3>
      </div>
      <form @submit.prevent="submitData" class="form-grid">
        <div class="field">
          <label>Nomor SK</label>
          <InputText v-model="form.nomor_sk" />
        </div>
        <div class="field">
          <label>Tanggal SK</label>
          <DatePicker v-model="form.tanggal_sk" dateFormat="yy-mm-dd" />
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
          <DatePicker v-model="form.tmt_kgb" dateFormat="yy-mm-dd" />
        </div>
        <div class="form-actions">
          <Button type="submit" label="Simpan" icon="pi pi-save" :loading="loading" />
        </div>
      </form>
    </div>

    <!-- Daftar KGB -->
    <div class="table-card">
      <div class="table-header">
        <i class="pi pi-list"></i>
        <h3>Riwayat KGB</h3>
        <Button icon="pi pi-refresh" severity="secondary" rounded text @click="loadData" :loading="loadingTable" class="ml-auto" />
      </div>
      <DataTable :value="items" :loading="loadingTable" paginator :rows="10" class="kgb-table">
        <Column field="nomor_sk" header="Nomor SK" />
        <Column field="tanggal_sk" header="Tanggal SK">
          <template #body="{ data }">{{ formatDate(data.tanggal_sk) }}</template>
        </Column>
        <Column field="gaji_lama" header="Gaji Lama">
          <template #body="{ data }">{{ formatRupiah(data.gaji_lama) }}</template>
        </Column>
        <Column field="gaji_baru" header="Gaji Baru">
          <template #body="{ data }">{{ formatRupiah(data.gaji_baru) }}</template>
        </Column>
        <Column field="tmt_kgb" header="TMT KGB">
          <template #body="{ data }">{{ formatDate(data.tmt_kgb) }}</template>
        </Column>
        <Column v-if="canManage" header="Aksi">
          <template #body="{ data }">
            <Button icon="pi pi-trash" severity="danger" rounded text @click="confirmDelete(data)" />
          </template>
        </Column>
        <template #empty>
          <div class="text-center py-4 text-secondary">Belum ada data KGB.</div>
        </template>
      </DataTable>
    </div>

    <!-- Konfirmasi Hapus -->
    <Dialog v-model:visible="deleteDialog" header="Konfirmasi Hapus" modal :style="{ width: '400px' }">
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-3xl text-warning"></i>
        <span>Yakin ingin menghapus KGB ini?</span>
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
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';

const toast = useToast();
const authStore = useAuthStore();

const canManage = computed(() => authStore.isAdmin || authStore.isOperator);

// State
const items = ref([]);
const loadingTable = ref(false);
const loading = ref(false);
const deleting = ref(false);
const deleteDialog = ref(false);
const selectedItem = ref(null);
const form = ref({
  nomor_sk: '',
  tanggal_sk: null,
  gaji_lama: null,
  gaji_baru: null,
  tmt_kgb: null
});

// Helper: get pegawai_id from email
let pegawaiId = null;

const getPegawaiId = async () => {
  const email = authStore.user?.email;
  if (!email) return null;
  const { data, error } = await supabase
    .from('pegawai')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (error || !data) return null;
  return data.id;
};

// Load data
const loadData = async () => {
  loadingTable.value = true;
  try {
    const id = await getPegawaiId();
    if (!id) {
      items.value = [];
      return;
    }
    const { data, error } = await supabase
      .from('kgb')
      .select('*')
      .eq('pegawai_id', id)
      .order('tmt_kgb', { ascending: false });
    if (error) throw error;
    items.value = data || [];
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loadingTable.value = false;
  }
};

const submitData = async () => {
  if (!form.value.tmt_kgb) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'TMT KGB wajib diisi', life: 3000 });
    return;
  }
  loading.value = true;
  try {
    const pegawai_id = await getPegawaiId();
    if (!pegawai_id) throw new Error('Data pegawai tidak ditemukan');
    const payload = {
      pegawai_id,
      nomor_sk: form.value.nomor_sk || null,
      tanggal_sk: form.value.tanggal_sk ? form.value.tanggal_sk.toISOString().split('T')[0] : null,
      gaji_lama: form.value.gaji_lama,
      gaji_baru: form.value.gaji_baru,
      tmt_kgb: form.value.tmt_kgb ? form.value.tmt_kgb.toISOString().split('T')[0] : null
    };
    const { error } = await supabase.from('kgb').insert([payload]);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'KGB ditambahkan', life: 3000 });
    resetForm();
    await loadData();
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  form.value = { nomor_sk: '', tanggal_sk: null, gaji_lama: null, gaji_baru: null, tmt_kgb: null };
};

const confirmDelete = (item) => {
  selectedItem.value = item;
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

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

const formatRupiah = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.kgb-pegawai-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.kgb-header {
  background: var(--surface-card);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--surface-border);
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
  color: var(--text-color);
  margin: 0;
}

.kgb-subtitle {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0;
}

.form-card, .table-card {
  background: var(--surface-card);
  border-radius: 1rem;
  border: 1px solid var(--surface-border);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.form-header, .table-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: var(--surface-hover);
  border-bottom: 1px solid var(--surface-border);
}

.form-header h3, .table-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.form-header i, .table-header i {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field label {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-color-secondary);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.kgb-table {
  padding: 0 1rem 1rem;
}

.text-secondary {
  color: var(--text-color-secondary);
}

.ml-auto {
  margin-left: auto;
}

@media (max-width: 640px) {
  .kgb-pegawai-page {
    padding: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>