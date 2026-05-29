<template>
  <div class="profil-pegawai-container">
    <Toast />


    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <p class="loading-text">Memuat data profil Anda...</p>
    </div>

    <!-- Data ditemukan -->
    <div v-else-if="pegawaiData" class="profil-wrapper">
      <!-- Header Profil -->
      <section class="profil-header-section">
        <div class="profil-header-card">
          <div class="profil-photo-container">
            <div class="profil-photo-wrapper">
              <img
                v-if="photoPreview || photoUrl"
                :src="photoPreview || photoUrl"
                :alt="pegawaiData.nama"
                class="profil-photo"
              />
              <div v-else class="profil-photo-placeholder">
                <i class="pi pi-user"></i>
              </div>
            </div>
            <div v-if="editMode" class="photo-upload-btn">
              <FileUpload
                mode="basic"
                name="foto"
                accept="image/*"
                :maxFileSize="2000000"
                chooseLabel="Ganti Foto"
                @select="onFileSelect"
                :auto="false"
              />
              <small class="text-muted">Max 2MB, JPG/PNG</small>
            </div>
          </div>
          <div class="profil-header-info">
            <h1 class="profil-name">{{ pegawaiData.nama || pegawaiData.nama_lengkap || '-' }}</h1>
            <p class="profil-nip">NIP: {{ pegawaiData.nip || '-' }}</p>
            <p class="profil-position">{{ pegawaiData.jabatan || '-' }}</p>
            <p class="profil-unit">{{ pegawaiData.unit_kerja || '-' }}</p>
            <div class="profil-status-badge">
              <span class="status-dot"></span>
              <span>Aktif</span>
            </div>
          </div>
          <div class="profil-header-actions">
            <Button
              :label="editMode ? 'Batal' : 'Edit Profil'"
              :icon="editMode ? 'pi pi-times' : 'pi pi-pencil'"
              :severity="editMode ? 'secondary' : 'primary'"
              outlined
              @click="toggleEditMode"
              class="btn-edit"
            />
          </div>
        </div>
      </section>

      <Divider />

      <!-- Form Edit -->
      <section class="profil-form-section">
        <form @submit.prevent="updateProfil" class="profil-form">
          <!-- Informasi Personal -->
          <div class="form-section">
            <div class="section-header">
              <i class="pi pi-user-circle"></i>
              <h3>Informasi Personal</h3>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label"><i class="pi pi-id-card"></i> NIP</label>
                <InputText v-model="form.nip" disabled class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-user"></i> Nama Lengkap</label>
                <InputText v-model="form.nama" :disabled="!editMode" class="form-input" placeholder="Masukkan nama lengkap" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-user-plus"></i> Jenis Kelamin</label>
                <Select v-model="form.jenis_kelamin" :options="genderOptions" optionLabel="label" optionValue="value" :disabled="!editMode" placeholder="Pilih jenis kelamin" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-map-marker"></i> Tempat Lahir</label>
                <InputText v-model="form.tempat_lahir" :disabled="!editMode" class="form-input" placeholder="Masukkan tempat lahir" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-calendar"></i> Tanggal Lahir</label>
                <DatePicker v-model="form.tanggal_lahir" :disabled="!editMode" dateFormat="yy-mm-dd" placeholder="Pilih tanggal lahir" class="form-input" />
                <small v-if="age" class="form-help">Usia: {{ age }} tahun</small>
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-star"></i> Agama</label>
                <Select v-model="form.agama" :options="religionOptions" optionLabel="label" optionValue="value" :disabled="!editMode" placeholder="Pilih agama" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-heart"></i> Status Perkawinan</label>
                <Select v-model="form.status_perkawinan" :options="maritalStatusOptions" optionLabel="label" optionValue="value" :disabled="!editMode" placeholder="Pilih status perkawinan" class="form-input" />
              </div>
            </div>
          </div>

          <!-- Informasi Profesional (READ-ONLY) -->
          <div class="form-section">
            <div class="section-header">
              <i class="pi pi-briefcase"></i>
              <h3>Informasi Profesional</h3>
              <small class="text-muted">(Hanya dapat diubah oleh admin)</small>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label"><i class="pi pi-briefcase"></i> Jabatan</label>
                <InputText v-model="form.jabatan" disabled class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-building"></i> Unit Kerja</label>
                <InputText v-model="form.unit_kerja" disabled class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-star"></i> Pangkat/Golongan</label>
                <InputText v-model="form.golongan" disabled class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-graduation-cap"></i> Pendidikan Terakhir</label>
                <Select v-model="form.pendidikan" :options="educationOptions" optionLabel="label" optionValue="value" disabled class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-book"></i> Institusi Pendidikan</label>
                <InputText v-model="form.institusi" disabled class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-calendar-plus"></i> Tahun Lulus</label>
                <InputNumber v-model="form.tahun_lulus" disabled class="form-input" />
              </div>
            </div>
          </div>

          <!-- Informasi Kontak -->
          <div class="form-section">
            <div class="section-header">
              <i class="pi pi-phone"></i>
              <h3>Informasi Kontak</h3>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label"><i class="pi pi-envelope"></i> Email</label>
                <InputText v-model="form.email" disabled class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label"><i class="pi pi-phone"></i> Nomor Telepon</label>
                <InputText v-model="form.no_hp" :disabled="!editMode" class="form-input" placeholder="Masukkan nomor telepon" />
              </div>
              <div class="form-group full-width">
                <label class="form-label"><i class="pi pi-map-marker"></i> Alamat Lengkap</label>
                <Textarea v-model="form.alamat" :disabled="!editMode" rows="3" class="form-input" placeholder="Masukkan alamat lengkap" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <Button v-if="editMode" type="submit" label="Simpan Perubahan" icon="pi pi-save" :loading="saving" class="btn-save" />
            <Button v-if="editMode" type="button" label="Batal" icon="pi pi-times" severity="secondary" @click="resetForm" class="btn-cancel" />
            <div v-if="!editMode && hasChanges" class="unsaved-indicator">
              <i class="pi pi-exclamation-circle"></i>
              <span>Ada perubahan yang belum disimpan</span>
            </div>
          </div>
        </form>
      </section>
    </div>

    <!-- Data tidak ditemukan -->
    <div v-else class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <p>Data profil pegawai tidak ditemukan.</p>
      <p>Silakan hubungi administrator untuk menyelesaikan profil Anda.</p>
      <Button label="Kembali" icon="pi pi-arrow-left" @click="router.back()" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import FileUpload from 'primevue/fileupload';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const loading = ref(true);
const saving = ref(false);
const editMode = ref(false);
const pegawaiData = ref(null);
const originalPegawai = ref(null);
const form = ref({});
const selectedFile = ref(null);
const photoPreview = ref(null);

// Options dropdown
const genderOptions = [
  { label: 'Laki-laki', value: 'Laki-laki' },
  { label: 'Perempuan', value: 'Perempuan' }
];
const religionOptions = [
  { label: 'Islam', value: 'Islam' },
  { label: 'Kristen', value: 'Kristen' },
  { label: 'Katolik', value: 'Katolik' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Buddha', value: 'Buddha' },
  { label: 'Konghucu', value: 'Konghucu' }
];
const maritalStatusOptions = [
  { label: 'Belum Kawin', value: 'Belum Kawin' },
  { label: 'Kawin', value: 'Kawin' },
  { label: 'Cerai Hidup', value: 'Cerai Hidup' },
  { label: 'Cerai Mati', value: 'Cerai Mati' }
];
const educationOptions = [
  { label: 'SD', value: 'SD' },
  { label: 'SMP', value: 'SMP' },
  { label: 'SMA/SMK', value: 'SMA/SMK' },
  { label: 'Diploma', value: 'Diploma' },
  { label: 'S1', value: 'S1' },
  { label: 'S2', value: 'S2' },
  { label: 'S3', value: 'S3' }
];

const photoUrl = computed(() => pegawaiData.value?.foto_url || '');
const age = computed(() => {
  if (!form.value.tanggal_lahir) return null;
  const birthDate = new Date(form.value.tanggal_lahir);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
});
const hasChanges = computed(() => {
  if (!originalPegawai.value) return false;
  const editableFields = ['nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 'agama', 'status_perkawinan', 'no_hp', 'alamat'];
  const current = {};
  const original = {};
  editableFields.forEach(f => {
    current[f] = form.value[f];
    original[f] = originalPegawai.value[f];
  });
  return JSON.stringify(current) !== JSON.stringify(original);
});

const masaKerja = computed(() => {
  if (!pegawaiData.value?.created_at) return 0;
  const start = new Date(pegawaiData.value.created_at);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const monthDiff = now.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) years--;
  return years;
});

function onFileSelect(event) {
  const file = event.files[0];
  if (file) {
    selectedFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      photoPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

async function uploadPhoto(file) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('foto-pegawai')
    .upload(fileName, file, { cacheControl: '3600', upsert: false });
  if (error) {
    console.error('Upload error:', error);
    throw error;
  }
  const { data: { publicUrl } } = supabase.storage.from('foto-pegawai').getPublicUrl(fileName);
  return publicUrl;
}

async function loadPegawai() {
  loading.value = true;
  try {
    const userEmail = authStore.user?.email;
    if (!userEmail) throw new Error('User tidak ditemukan');
    const { data, error } = await supabase
      .from('pegawai')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      pegawaiData.value = data;
      originalPegawai.value = JSON.parse(JSON.stringify(data));
      form.value = JSON.parse(JSON.stringify(data));
    } else {
      console.warn('Data pegawai tidak ditemukan untuk email:', userEmail);
    }
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function updateProfil() {
  if (!pegawaiData.value) return;
  saving.value = true;
  try {
    let foto_url = form.value.foto_url;
    if (selectedFile.value) {
      foto_url = await uploadPhoto(selectedFile.value);
    }
    const updateData = {
      nama: form.value.nama,
      jenis_kelamin: form.value.jenis_kelamin,
      tempat_lahir: form.value.tempat_lahir,
      tanggal_lahir: form.value.tanggal_lahir,
      agama: form.value.agama,
      status_perkawinan: form.value.status_perkawinan,
      no_hp: form.value.no_hp,
      alamat: form.value.alamat,
      foto_url: foto_url
    };
    const { error } = await supabase
      .from('pegawai')
      .update(updateData)
      .eq('id', pegawaiData.value.id);
    if (error) throw error;
    Object.assign(pegawaiData.value, updateData);
    originalPegawai.value = JSON.parse(JSON.stringify(pegawaiData.value));
    form.value = JSON.parse(JSON.stringify(pegawaiData.value));
    editMode.value = false;
    selectedFile.value = null;
    photoPreview.value = null;
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Profil berhasil diperbarui', life: 3000 });
  } catch (err) {
    console.error('Gagal update profil:', err);
    toast.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
  } finally {
    saving.value = false;
  }
}

function toggleEditMode() {
  if (editMode.value) {
    resetForm();
  }
  editMode.value = !editMode.value;
}

function resetForm() {
  if (originalPegawai.value) {
    form.value = JSON.parse(JSON.stringify(originalPegawai.value));
    photoPreview.value = null;
    selectedFile.value = null;
  }
  editMode.value = false;
}

onMounted(() => {
  loadPegawai();
});
</script>

<style scoped>
/* ========== Hero Banner ========== */
.profile-hero {
  background: linear-gradient(135deg, #0d5c2e 0%, #1a7a3e 45%, #0d3d20 100%);
  border-radius: 1.25rem;
  margin-bottom: 2rem;
  padding: 1.5rem 2rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.hero-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.hero-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.hero-icon {
  width: 3.5rem;
  height: 3.5rem;
  background: rgba(255,255,255,0.2);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}
.hero-text h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}
.hero-text p {
  margin: 0.2rem 0 0;
  opacity: 0.9;
  font-size: 0.85rem;
}
.hero-stats {
  display: flex;
  gap: 1.5rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,255,255,0.15);
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  min-width: 80px;
}
.stat-item i {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
}
.stat-item span {
  font-weight: 700;
  font-size: 1.1rem;
}
.stat-item small {
  font-size: 0.7rem;
  opacity: 0.8;
}

/* ========== Container ========== */
.profil-pegawai-container {
  background: linear-gradient(135deg, var(--surface-ground) 0%, rgba(13, 92, 46, 0.02) 100%);
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profil-wrapper {
  max-width: 1000px;
  width: 100%;
}
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
.loading-spinner {
  font-size: 3rem;
  color: var(--primary);
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  padding: 2rem;
}
.error-container i {
  font-size: 3rem;
  color: #ef4444;
}
.profil-header-section {
  margin-bottom: 2rem;
}
.profil-header-card {
  background: linear-gradient(135deg, var(--surface-card) 0%, rgba(13, 92, 46, 0.03) 100%);
  border-radius: 1.5rem;
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid var(--surface-border);
}
.profil-photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.profil-photo-wrapper {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--primary);
  background: var(--surface-100);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.profil-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profil-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(13,92,46,0.1) 0%, rgba(13,92,46,0.05) 100%);
  font-size: 3rem;
  color: rgba(13,92,46,0.2);
}
.photo-upload-btn {
  text-align: center;
  margin-top: 0.25rem;
}
.text-muted {
  font-size: 0.7rem;
  color: #6c757d;
  display: block;
}
.profil-header-info {
  flex: 1;
}
.profil-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}
.profil-nip, .profil-position, .profil-unit {
  margin: 0.2rem 0;
  font-size: 0.95rem;
  color: var(--text-color-secondary);
}
.profil-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.4rem 1rem;
  background: rgba(34,197,94,0.1);
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #22c55e;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,100%{ opacity:1; }
  50%{ opacity:0.6; }
}
.profil-header-actions {
  align-self: start;
}
.profil-form-section {
  background: var(--surface-card);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid var(--surface-border);
}
.profil-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--primary);
}
.section-header i {
  font-size: 1.4rem;
  color: var(--primary);
}
.section-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.full-width {
  grid-column: 1 / -1;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.form-input {
  width: 100%;
}
.form-help {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
}
.form-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid var(--surface-border);
  flex-wrap: wrap;
}
.btn-save, .btn-cancel {
  font-weight: 600;
  padding: 0.6rem 1.5rem;
  border-radius: 0.75rem;
}
.unsaved-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(251,191,36,0.1);
  border-radius: 0.75rem;
  color: #f59e0b;
  font-size: 0.85rem;
  margin-left: auto;
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-hero { padding: 1rem 1.5rem; }
  .hero-inner { flex-direction: column; align-items: flex-start; }
  .hero-stats { width: 100%; justify-content: center; }
  .profil-header-card { flex-direction: column; text-align: center; }
  .profil-header-info { text-align: center; }
  .profil-header-actions { align-self: center; }
  .profil-photo-wrapper { width: 120px; height: 120px; margin: 0 auto; }
}
@media (max-width: 768px) {
  .profil-pegawai-container { padding: 1rem; }
  .profil-header-card, .profil-form-section { padding: 1.25rem; }
  .form-grid { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; align-items: stretch; }
  .unsaved-indicator { margin-left: 0; justify-content: center; }
}
</style>