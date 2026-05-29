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
          <p class="kinerja-subtitle">Riwayat penilaian kinerja Anda</p>
        </div>
      </div>
    </div>

    <!-- Form Tambah/Edit (hanya untuk admin/operator) -->
    <div v-if="canManage" class="form-card">
      <div class="form-header">
        <i class="pi pi-plus-circle"></i>
        <h3>{{ isEditing ? 'Edit Penilaian Kinerja' : 'Tambah Penilaian Kinerja' }}</h3>
      </div>
      <form @submit.prevent="submitData" class="form-grid">
        <div class="field">
          <label>Tahun <span class="text-red-500">*</span></label>
          <InputNumber v-model="form.tahun" :min="2000" :max="2100" :useGrouping="false" required />
        </div>
        <div class="field">
          <label>Nilai (0-100) <span class="text-red-500">*</span></label>
          <InputNumber v-model="form.nilai" :min="0" :max="100" :minFractionDigits="2" :maxFractionDigits="2" required />
        </div>
        <div class="field">
          <label>File Dokumen</label>
          <div class="flex gap-2 items-center">
            <FileUpload mode="basic" @select="onFileSelect" chooseLabel="Pilih File" accept=".pdf,.jpg,.png" />
            <span v-if="selectedFile" class="text-sm">{{ selectedFile.name }}</span>
            <span v-if="form.dokumen_file && !selectedFile && !isEditing" class="text-sm text-green-600">File sudah diupload</span>
          </div>
          <small>Maksimal 2MB, format PDF/JPG/PNG</small>
        </div>
        <div class="form-actions">
          <Button type="submit" :label="isEditing ? 'Update' : 'Simpan'" icon="pi pi-save" :loading="loading" />
          <Button v-if="isEditing" label="Batal" icon="pi pi-times" severity="secondary" @click="resetForm" />
        </div>
      </form>
    </div>

    <!-- Daftar Penilaian Kinerja -->
    <div class="table-card">
      <div class="table-header">
        <i class="pi pi-list"></i>
        <h3>Riwayat Penilaian Kinerja</h3>
        <Button icon="pi pi-refresh" severity="secondary" rounded text @click="loadData" :loading="loadingTable" class="ml-auto" />
      </div>
      <div class="kinerja-list">
        <div v-for="item in items" :key="item.id" class="kinerja-item">
          <div class="kinerja-info">
            <div class="kinerja-year">{{ item.tahun }}</div>
            <div class="kinerja-nilai">
              <span class="nilai-value">{{ item.nilai }}</span>
              <span class="nilai-label">Nilai</span>
            </div>
          </div>
          <div class="kinerja-doc">
            <a v-if="item.dokumen_file" :href="item.dokumen_file" target="_blank" class="text-primary">Lihat Dokumen</a>
            <span v-else class="text-secondary">-</span>
          </div>
          <div v-if="canManage" class="kinerja-actions">
            <Button icon="pi pi-pencil" severity="warning" rounded text @click="editItem(item)" />
            <Button icon="pi pi-trash" severity="danger" rounded text @click="confirmDelete(item)" />
          </div>
        </div>
        <div v-if="!loadingTable && items.length === 0" class="empty-state">
          <i class="pi pi-chart-line"></i>
          <p>Belum ada data penilaian kinerja.</p>
        </div>
      </div>
    </div>

    <!-- Dialog Konfirmasi Hapus -->
    <Dialog v-model:visible="deleteDialog" header="Konfirmasi Hapus" modal :style="{ width: '400px' }">
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-3xl text-warning"></i>
        <span>Yakin ingin menghapus penilaian tahun {{ selectedItem?.tahun }}?</span>
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
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
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
  tahun: null,
  nilai: null,
  dokumen_file: ''
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

const loadData = async () => {
  loadingTable.value = true;
  try {
    const id = await getPegawaiId();
    if (!id) {
      items.value = [];
      return;
    }
    const { data, error } = await supabase
      .from('penilaian_kinerja')
      .select('*')
      .eq('pegawai_id', id)
      .order('tahun', { ascending: false });
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
  const filePath = `kinerja/${fileName}`;
  const { error } = await supabase.storage.from('dokumen').upload(filePath, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('dokumen').getPublicUrl(filePath);
  return publicUrl;
};

const validateForm = () => {
  if (!form.value.tahun) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Tahun wajib diisi', life: 3000 });
    return false;
  }
  if (!form.value.nilai && form.value.nilai !== 0) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Nilai wajib diisi', life: 3000 });
    return false;
  }
  if (form.value.nilai < 0 || form.value.nilai > 100) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Nilai harus antara 0-100', life: 3000 });
    return false;
  }
  return true;
};

const submitData = async () => {
  if (!validateForm()) return;
  loading.value = true;
  try {
    const pegawai_id = await getPegawaiId();
    if (!pegawai_id) throw new Error('Data pegawai tidak ditemukan');
    let dokumen_url = form.value.dokumen_file;
    if (selectedFile.value) {
      dokumen_url = await uploadFile(selectedFile.value);
    }
    const payload = {
      pegawai_id,
      tahun: form.value.tahun,
      nilai: form.value.nilai,
      dokumen_file: dokumen_url || null
    };
    if (isEditing.value && editingId.value) {
      const { error } = await supabase
        .from('penilaian_kinerja')
        .update(payload)
        .eq('id', editingId.value);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Penilaian kinerja diperbarui', life: 3000 });
    } else {
      const { error } = await supabase
        .from('penilaian_kinerja')
        .insert([payload]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Penilaian kinerja ditambahkan', life: 3000 });
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
    tahun: item.tahun,
    nilai: item.nilai,
    dokumen_file: item.dokumen_file || ''
  };
  selectedFile.value = null;
  window.scrollTo(0, 0);
};

const resetForm = () => {
  form.value = { tahun: null, nilai: null, dokumen_file: '' };
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
      .from('penilaian_kinerja')
      .delete()
      .eq('id', selectedItem.value.id);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Penilaian kinerja dihapus', life: 3000 });
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
  await loadData();
});
</script>

<style scoped>
.kinerja-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.kinerja-header {
  background: var(--surface-card);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--surface-border);
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
  color: var(--text-color);
  margin: 0;
}

.kinerja-subtitle {
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

.kinerja-list {
  padding: 1rem;
}

.kinerja-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
  flex-wrap: wrap;
  gap: 1rem;
}

.kinerja-item:last-child {
  border-bottom: none;
}

.kinerja-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.kinerja-year {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-color);
}

.kinerja-nilai {
  text-align: center;
}

.nilai-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.nilai-label {
  display: block;
  font-size: 0.7rem;
  color: var(--text-color-secondary);
}

.kinerja-doc a {
  text-decoration: none;
}
.kinerja-doc a:hover {
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}
.empty-state i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.text-red-500 { color: var(--red-500); }
.text-primary { color: var(--primary-color); }
.text-secondary { color: var(--text-color-secondary); }

.ml-auto {
  margin-left: auto;
}

@media (max-width: 640px) {
  .kinerja-page { padding: 1rem; }
  .kinerja-item { flex-direction: column; align-items: flex-start; }
  .kinerja-info { flex-wrap: wrap; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>