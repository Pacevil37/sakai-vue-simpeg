<template>
  <div class="mutasi-pegawai-page">
    <!-- Header -->
    <div class="mutasi-header">
      <div class="mutasi-header-content">
        <div class="mutasi-header-icon">
          <i class="pi pi-arrow-right-arrow-left"></i>
        </div>
        <div>
          <h1 class="mutasi-title">Riwayat Mutasi</h1>
          <p class="mutasi-subtitle">Riwayat perpindahan unit kerja Anda</p>
        </div>
      </div>
    </div>

    <!-- Form Tambah/Edit (hanya untuk admin/operator) -->
    <div v-if="canManage" class="form-card">
      <div class="form-header">
        <i class="pi pi-plus-circle"></i>
        <h3>{{ isEditing ? 'Edit Mutasi' : 'Tambah Mutasi' }}</h3>
      </div>
      <form @submit.prevent="submitData" class="form-grid">
        <div class="field">
          <label>Dari Unit</label>
          <Select v-model="form.dari_unit" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Pilih unit" clearable />
        </div>
        <div class="field">
          <label>Ke Unit <span class="text-red-500">*</span></label>
          <Select v-model="form.ke_unit" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Pilih unit" required />
        </div>
        <div class="field">
          <label>Tanggal Mutasi <span class="text-red-500">*</span></label>
          <DatePicker v-model="form.tanggal_mutasi" dateFormat="yy-mm-dd" placeholder="Pilih tanggal" required />
        </div>
        <div class="field">
          <label>File SK</label>
          <div class="flex gap-2 items-center">
            <FileUpload mode="basic" @select="onFileSelect" chooseLabel="Pilih File" accept=".pdf,.jpg,.png" />
            <span v-if="selectedFile" class="text-sm">{{ selectedFile.name }}</span>
            <span v-if="form.surat_sk_file && !selectedFile && !isEditing" class="text-sm text-green-600">File sudah diupload</span>
          </div>
          <small>Maksimal 2MB, format PDF/JPG/PNG</small>
        </div>
        <div class="form-actions">
          <Button type="submit" :label="isEditing ? 'Update' : 'Simpan'" icon="pi pi-save" :loading="loading" />
          <Button v-if="isEditing" label="Batal" icon="pi pi-times" severity="secondary" @click="resetForm" />
        </div>
      </form>
    </div>

    <!-- Daftar Mutasi -->
    <div class="table-card">
      <div class="table-header">
        <i class="pi pi-list"></i>
        <h3>Riwayat Mutasi</h3>
        <Button icon="pi pi-refresh" severity="secondary" rounded text @click="loadData" :loading="loadingTable" class="ml-auto" />
      </div>
      <DataTable :value="items" :loading="loadingTable" paginator :rows="10" class="mutasi-table">
        <Column field="dari_unit" header="Dari Unit" />
        <Column field="ke_unit" header="Ke Unit" />
        <Column field="tanggal_mutasi" header="Tanggal Mutasi">
          <template #body="{ data }">
            {{ formatDate(data.tanggal_mutasi) }}
          </template>
        </Column>
        <Column header="SK">
          <template #body="{ data }">
            <a v-if="data.surat_sk_file" :href="data.surat_sk_file" target="_blank" class="text-primary">Lihat</a>
            <span v-else class="text-secondary">-</span>
          </template>
        </Column>
        <Column v-if="canManage" header="Aksi">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" severity="warning" rounded text @click="editItem(data)" />
            <Button icon="pi pi-trash" severity="danger" rounded text @click="confirmDelete(data)" />
          </template>
        </Column>
        <template #empty>
          <div class="text-center py-4 text-secondary">Belum ada data riwayat mutasi.</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Konfirmasi Hapus -->
    <Dialog v-model:visible="deleteDialog" header="Konfirmasi Hapus" modal :style="{ width: '400px' }">
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-3xl text-warning"></i>
        <span>Yakin ingin menghapus mutasi ini?</span>
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
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
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
const isEditing = ref(false);
const editingId = ref(null);
const selectedItem = ref(null);
const deleteDialog = ref(false);
const selectedFile = ref(null);
const form = ref({
  dari_unit: '',
  ke_unit: '',
  tanggal_mutasi: null,
  surat_sk_file: ''
});
const unitOptions = ref([]);

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

// Load unit options from units table
const loadUnitOptions = async () => {
  const { data, error } = await supabase
    .from('units')
    .select('name')
    .order('name');
  if (!error) {
    unitOptions.value = data.map(u => ({ label: u.name, value: u.name }));
  }
};

// Load mutasi data for current pegawai
const loadData = async () => {
  loadingTable.value = true;
  try {
    const id = await getPegawaiId();
    if (!id) {
      items.value = [];
      return;
    }
    const { data, error } = await supabase
      .from('mutasi')
      .select('*')
      .eq('pegawai_id', id)
      .order('tanggal_mutasi', { ascending: false });
    if (error) throw error;
    items.value = data || [];
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loadingTable.value = false;
  }
};

const onFileSelect = (event) => {
  selectedFile.value = event.files[0];
};

const uploadFile = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `mutasi/${fileName}`;
  const { error } = await supabase.storage.from('dokumen').upload(filePath, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('dokumen').getPublicUrl(filePath);
  return publicUrl;
};

const submitData = async () => {
  if (!form.value.ke_unit) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Unit tujuan wajib diisi', life: 3000 });
    return;
  }
  if (!form.value.tanggal_mutasi) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Tanggal mutasi wajib diisi', life: 3000 });
    return;
  }
  loading.value = true;
  try {
    const pegawai_id = await getPegawaiId();
    if (!pegawai_id) throw new Error('Data pegawai tidak ditemukan');
    let sk_url = form.value.surat_sk_file;
    if (selectedFile.value) {
      sk_url = await uploadFile(selectedFile.value);
    }
    const payload = {
      pegawai_id,
      dari_unit: form.value.dari_unit || null,
      ke_unit: form.value.ke_unit,
      tanggal_mutasi: form.value.tanggal_mutasi ? form.value.tanggal_mutasi.toISOString().split('T')[0] : null,
      surat_sk_file: sk_url || null
    };
    if (isEditing.value && editingId.value) {
      const { error } = await supabase
        .from('mutasi')
        .update(payload)
        .eq('id', editingId.value);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Mutasi diperbarui', life: 3000 });
    } else {
      const { error } = await supabase
        .from('mutasi')
        .insert([payload]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Mutasi ditambahkan', life: 3000 });
    }
    resetForm();
    await loadData();
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

const editItem = (item) => {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = {
    dari_unit: item.dari_unit || '',
    ke_unit: item.ke_unit,
    tanggal_mutasi: item.tanggal_mutasi ? new Date(item.tanggal_mutasi) : null,
    surat_sk_file: item.surat_sk_file || ''
  };
  selectedFile.value = null;
  window.scrollTo(0, 0);
};

const resetForm = () => {
  form.value = { dari_unit: '', ke_unit: '', tanggal_mutasi: null, surat_sk_file: '' };
  selectedFile.value = null;
  isEditing.value = false;
  editingId.value = null;
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

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

onMounted(async () => {
  await loadUnitOptions();
  await loadData();
});
</script>

<style scoped>
.mutasi-pegawai-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.mutasi-header {
  background: var(--surface-card);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--surface-border);
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
  color: var(--text-color);
  margin: 0;
}

.mutasi-subtitle {
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

.mutasi-table {
  padding: 0 1rem 1rem;
}

.text-red-500 { color: var(--red-500); }
.text-primary { color: var(--primary-color); text-decoration: none; }
.text-primary:hover { text-decoration: underline; }
.text-secondary { color: var(--text-color-secondary); }

.ml-auto {
  margin-left: auto;
}

@media (max-width: 640px) {
  .mutasi-pegawai-page {
    padding: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>