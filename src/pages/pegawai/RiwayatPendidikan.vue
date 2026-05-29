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
          <p class="riwayat-subtitle">Kelola riwayat pendidikan Anda</p>
        </div>
      </div>
    </div>

    <!-- Form Tambah/Edit -->
    <div class="card form-card">
      <div class="form-header">
        <i class="pi pi-plus-circle"></i>
        <h3>{{ isEditing ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan' }}</h3>
      </div>
      <form @submit.prevent="isEditing ? updateRiwayat() : tambahRiwayat()">
        <div class="form-grid">
          <div class="field">
            <label>Jenjang <span class="text-red-500">*</span></label>
            <Select v-model="form.jenjang" :options="jenjangOptions" placeholder="Pilih jenjang" :class="{ 'p-invalid': errors.jenjang }" />
            <small v-if="errors.jenjang" class="p-error">{{ errors.jenjang }}</small>
          </div>
          <div class="field">
            <label>Institusi <span class="text-red-500">*</span></label>
            <InputText v-model="form.institusi" :class="{ 'p-invalid': errors.institusi }" />
            <small v-if="errors.institusi" class="p-error">{{ errors.institusi }}</small>
          </div>
          <div class="field">
            <label>Tahun Lulus <span class="text-red-500">*</span></label>
            <InputNumber v-model="form.tahun_lulus" :min="1950" :max="2100" :class="{ 'p-invalid': errors.tahun_lulus }" />
            <small v-if="errors.tahun_lulus" class="p-error">{{ errors.tahun_lulus }}</small>
          </div>
          <div class="field">
            <label>File Ijazah</label>
            <FileUpload mode="basic" accept=".pdf,.jpg,.png" :maxFileSize="5000000" @select="onFileSelect" chooseLabel="Pilih File" />
            <small class="text-secondary">Max 5MB (PDF, JPG, PNG)</small>
            <div v-if="selectedFile" class="selected-file">
              <i class="pi pi-file"></i> {{ selectedFile.name }}
            </div>
            <div v-if="form.file_url && !isEditing" class="existing-file">
              <i class="pi pi-paperclip"></i>
              <a :href="form.file_url" target="_blank">Lihat file yang sudah diunggah</a>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <Button type="submit" :label="isEditing ? 'Update' : 'Simpan'" icon="pi pi-save" :loading="loading" />
          <Button v-if="isEditing" label="Batal" icon="pi pi-times" severity="secondary" @click="resetForm" />
        </div>
      </form>
    </div>

    <!-- Daftar Riwayat Pendidikan -->
    <div class="card table-card">
      <div class="table-header">
        <i class="pi pi-list"></i>
        <h3>Riwayat Pendidikan</h3>
        <Button icon="pi pi-refresh" severity="secondary" rounded text @click="loadData" :loading="loading" />
      </div>
      <DataTable :value="items" :loading="loading" paginator :rows="10" class="riwayat-table">
        <Column field="jenjang" header="Jenjang" />
        <Column field="institusi" header="Institusi" />
        <Column field="tahun_lulus" header="Tahun Lulus" />
        <Column header="Dokumen">
          <template #body="{ data }">
            <a v-if="data.ijazah_file" :href="data.ijazah_file" target="_blank" class="text-primary">Lihat Ijazah</a>
            <span v-else class="text-secondary">-</span>
          </template>
        </Column>
        <Column header="Aksi" :exportable="false">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" severity="warning" size="small" @click="openEdit(data)" class="mr-2" />
            <Button icon="pi pi-trash" severity="danger" size="small" @click="confirmDelete(data)" />
          </template>
        </Column>
        <template #empty>
          <div class="text-center py-4 text-secondary">Belum ada data riwayat pendidikan. Tambahkan melalui form di atas.</div>
        </template>
      </DataTable>
    </div>

    <!-- Delete Confirmation -->
    <Dialog v-model:visible="deleteDialog" header="Konfirmasi Hapus" :style="{ width: '400px' }" modal>
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-3xl text-warning"></i>
        <span>Yakin ingin menghapus riwayat pendidikan <strong>{{ selectedItem?.jenjang }}</strong> di <strong>{{ selectedItem?.institusi }}</strong>?</span>
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="deleteDialog = false" />
        <Button label="Hapus" severity="danger" @click="deleteData" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';

const toast = useToast();
const authStore = useAuthStore();

// State
const items = ref([]);
const loading = ref(false);
const deleting = ref(false);
const isEditing = ref(false);
const editingId = ref(null);
const selectedItem = ref(null);
const deleteDialog = ref(false);
const form = ref({
  jenjang: '',
  institusi: '',
  tahun_lulus: null,
  file_url: ''
});
const errors = ref({});
const selectedFile = ref(null);
let pegawaiId = null;

// Options
const jenjangOptions = ['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'];

// Helper: dapatkan pegawai_id dari email user yang login
const getPegawaiId = async () => {
  const userEmail = authStore.user?.email;
  if (!userEmail) return null;
  const { data, error } = await supabase
    .from('pegawai')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle();
  if (error || !data) {
    console.error('Gagal mendapat pegawai_id:', error);
    return null;
  }
  return data.id;
};

// Upload file ke Supabase Storage
const uploadFile = async (file, pegawaiId) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pegawaiId}/${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('ijazah')
    .upload(fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage
    .from('ijazah')
    .getPublicUrl(fileName);
  return publicUrl;
};

// Load data
const loadData = async () => {
  loading.value = true;
  try {
    const pid = await getPegawaiId();
    if (!pid) throw new Error('Pegawai tidak ditemukan');
    pegawaiId = pid;
    const { data, error } = await supabase
      .from('riwayat_pendidikan')
      .select('*')
      .eq('pegawai_id', pegawaiId)
      .order('tahun_lulus', { ascending: false });
    if (error) throw error;
    items.value = data || [];
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Validasi form
const validate = () => {
  errors.value = {};
  if (!form.value.jenjang) errors.value.jenjang = 'Jenjang harus diisi';
  if (!form.value.institusi) errors.value.institusi = 'Institusi harus diisi';
  if (!form.value.tahun_lulus) errors.value.tahun_lulus = 'Tahun lulus harus diisi';
  else if (form.value.tahun_lulus < 1950 || form.value.tahun_lulus > 2100) errors.value.tahun_lulus = 'Tahun lulus harus antara 1950-2100';
  return Object.keys(errors.value).length === 0;
};

// Reset form
const resetForm = () => {
  form.value = { jenjang: '', institusi: '', tahun_lulus: null, file_url: '' };
  selectedFile.value = null;
  isEditing.value = false;
  editingId.value = null;
  errors.value = {};
};

// Tambah riwayat
const tambahRiwayat = async () => {
  if (!validate()) return;
  loading.value = true;
  try {
    let fileUrl = null;
    if (selectedFile.value) {
      fileUrl = await uploadFile(selectedFile.value, pegawaiId);
    }
    const { error } = await supabase
      .from('riwayat_pendidikan')
      .insert([{
        pegawai_id: pegawaiId,
        jenjang: form.value.jenjang,
        institusi: form.value.institusi,
        tahun_lulus: form.value.tahun_lulus,
        ijazah_file: fileUrl
      }]);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Riwayat pendidikan ditambahkan', life: 3000 });
    resetForm();
    await loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Open edit
const openEdit = (item) => {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = {
    jenjang: item.jenjang,
    institusi: item.institusi,
    tahun_lulus: item.tahun_lulus,
    file_url: item.ijazah_file
  };
  selectedFile.value = null;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Update riwayat
const updateRiwayat = async () => {
  if (!validate()) return;
  loading.value = true;
  try {
    let fileUrl = form.value.file_url;
    if (selectedFile.value) {
      fileUrl = await uploadFile(selectedFile.value, pegawaiId);
    }
    const { error } = await supabase
      .from('riwayat_pendidikan')
      .update({
        jenjang: form.value.jenjang,
        institusi: form.value.institusi,
        tahun_lulus: form.value.tahun_lulus,
        ijazah_file: fileUrl
      })
      .eq('id', editingId.value);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Riwayat pendidikan diperbarui', life: 3000 });
    resetForm();
    await loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Confirm delete
const confirmDelete = (item) => {
  selectedItem.value = item;
  deleteDialog.value = true;
};

// Delete riwayat
const deleteData = async () => {
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
  }
};

// File select handler
const onFileSelect = (event) => {
  selectedFile.value = event.files[0];
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* ============================================
   TEMA DARK & LIGHT - MENGGUNAKAN VARIABEL PRIMEVUE
   ============================================ */
.riwayat-pendidikan-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 1.5rem;
}

.riwayat-header {
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

.riwayat-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* ========== PERBAIKAN ICON HEADER ========== */
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
/* ========================================= */

.riwayat-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}

.riwayat-subtitle {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0;
}

.card {
  background: var(--surface-card);
  border-radius: 1rem;
  border: 1px solid var(--surface-border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
}

.form-card, .table-card {
  padding: 1.5rem;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 0.75rem;
}

.form-header i {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.form-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
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

.p-error {
  color: var(--red-500);
  font-size: 0.75rem;
}

.text-secondary {
  color: var(--text-color-secondary);
}

.selected-file, .existing-file {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.table-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 0.75rem;
}

.table-header i {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.table-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  color: var(--text-color);
}

.riwayat-table {
  width: 100%;
}

.text-primary {
  color: var(--primary-color);
  text-decoration: none;
}
.text-primary:hover {
  text-decoration: underline;
}

/* Responsif */
@media (max-width: 640px) {
  .riwayat-pendidikan-page {
    padding: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-actions {
    flex-direction: column;
  }
}
</style>