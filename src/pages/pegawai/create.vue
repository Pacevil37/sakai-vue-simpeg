<template>
  <div class="create-pegawai-page">
    <!-- Header dengan ikon gradien -->
    <div class="create-header">
      <div class="create-header-content">
        <div class="create-header-icon">
          <i class="pi pi-user-plus"></i>
        </div>
        <div>
          <h1 class="create-title">Tambah Pegawai Baru</h1>
          <p class="create-subtitle">Lengkapi data pegawai sesuai form di bawah ini</p>
        </div>
      </div>
      <div class="create-header-actions">
        <Button label="Kembali" icon="pi pi-arrow-left" severity="secondary" outlined @click="goBack" />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-content-center py-5">
      <ProgressSpinner />
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit">
      <Card class="form-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-user"></i>
            <span>Informasi Pegawai</span>
          </div>
        </template>
        <template #content>
          <div class="form-grid">
            <!-- NIP -->
            <div class="field">
              <label>NIP <span class="text-red-500">*</span></label>
              <InputText v-model="form.nip" :class="{ 'p-invalid': errors.nip }" />
              <small v-if="errors.nip" class="p-error">{{ errors.nip }}</small>
            </div>

            <!-- Nama Lengkap -->
            <div class="field">
              <label>Nama Lengkap <span class="text-red-500">*</span></label>
              <InputText v-model="form.nama" :class="{ 'p-invalid': errors.nama }" />
              <small v-if="errors.nama" class="p-error">{{ errors.nama }}</small>
            </div>

            <!-- Email -->
            <div class="field">
              <label>Email <span class="text-red-500">*</span></label>
              <InputText v-model="form.email" type="email" :class="{ 'p-invalid': errors.email }" />
              <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            </div>

            <!-- No. Telepon -->
            <div class="field">
              <label>No. Telepon</label>
              <InputText v-model="form.no_hp" />
            </div>

            <!-- Tempat Lahir -->
            <div class="field">
              <label>Tempat Lahir</label>
              <InputText v-model="form.tempat_lahir" />
            </div>

            <!-- Tanggal Lahir -->
            <div class="field">
              <label>Tanggal Lahir</label>
              <DatePicker v-model="form.tanggal_lahir" dateFormat="yy-mm-dd" placeholder="Pilih tanggal" />
            </div>

            <!-- Jenis Kelamin -->
            <div class="field">
              <label>Jenis Kelamin</label>
              <Select v-model="form.jenis_kelamin" :options="genderOptions" optionLabel="label" optionValue="value" placeholder="Pilih jenis kelamin" class="w-full" />
            </div>

            <!-- Alamat (full width) -->
            <div class="field full-width">
              <label>Alamat</label>
              <Textarea v-model="form.alamat" rows="2" />
            </div>

            <!-- Jabatan -->
            <div class="field">
              <label>Jabatan <span class="text-red-500">*</span></label>
              <InputText v-model="form.jabatan" :class="{ 'p-invalid': errors.jabatan }" />
              <small v-if="errors.jabatan" class="p-error">{{ errors.jabatan }}</small>
            </div>

            <!-- Golongan -->
            <div class="field">
              <label>Golongan <span class="text-red-500">*</span></label>
              <Select v-model="form.golongan" :options="golonganOptions" placeholder="Pilih golongan" :class="{ 'p-invalid': errors.golongan }" class="w-full" />
              <small v-if="errors.golongan" class="p-error">{{ errors.golongan }}</small>
            </div>

            <!-- Unit Kerja -->
            <div class="field">
              <label>Unit Kerja</label>
              <Select v-model="form.unit_kerja_id" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Pilih unit kerja" class="w-full" />
            </div>

            <!-- Pendidikan -->
            <div class="field">
              <label>Pendidikan Terakhir</label>
              <Select v-model="form.pendidikan" :options="pendidikanOptions" placeholder="Pilih pendidikan" class="w-full" />
            </div>

            <!-- TMT Pangkat -->
            <div class="field">
              <label>TMT Pangkat</label>
              <DatePicker v-model="form.tmt_pangkat" dateFormat="yy-mm-dd" placeholder="Pilih tanggal" />
            </div>

            <!-- Status -->
            <div class="field">
              <label>Status <span class="text-red-500">*</span></label>
              <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Pilih status" :class="{ 'p-invalid': errors.status }" class="w-full" />
              <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
            </div>
          </div>
        </template>
      </Card>

      <!-- Tombol Aksi -->
      <div class="form-actions">
        <Button label="Batal" icon="pi pi-times" severity="secondary" @click="goBack" :disabled="submitting" />
        <Button label="Simpan" icon="pi pi-save" type="submit" :loading="submitting" class="btn-primary" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Card from 'primevue/card';

const router = useRouter();
const toast = useToast();

// State
const loading = ref(false);
const submitting = ref(false);
const form = ref({
  nip: '',
  nama: '',
  email: '',
  no_hp: '',
  tempat_lahir: '',
  tanggal_lahir: null,
  alamat: '',
  jabatan: '',
  golongan: '',
  unit_kerja_id: null,
  pendidikan: '',
  tmt_pangkat: null,
  status: 'aktif',
  jenis_kelamin: ''
});
const errors = ref({});

// Options
const unitOptions = ref([]);
const golonganOptions = ref([
  'I/a', 'I/b', 'I/c', 'I/d',
  'II/a', 'II/b', 'II/c', 'II/d',
  'III/a', 'III/b', 'III/c', 'III/d',
  'IV/a', 'IV/b', 'IV/c', 'IV/d'
]);
const pendidikanOptions = ref(['SD', 'SMP', 'SMA', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3']);
const genderOptions = ref([
  { label: 'Laki-laki', value: 'Laki-laki' },
  { label: 'Perempuan', value: 'Perempuan' }
]);
const statusOptions = ref([
  { label: 'Aktif', value: 'aktif' },
  { label: 'Pensiun', value: 'pensiun' },
  { label: 'Mutasi', value: 'mutasi' }
]);

// Fetch unit kerja
const fetchUnits = async () => {
  const { data, error } = await supabase
    .from('units')
    .select('id, name')
    .order('name');
  if (!error && data) {
    unitOptions.value = data.map(u => ({ label: u.name, value: u.id }));
  }
};

// Validasi form
const validate = () => {
  errors.value = {};
  if (!form.value.nip) errors.value.nip = 'NIP harus diisi';
  if (!form.value.nama) errors.value.nama = 'Nama harus diisi';
  if (!form.value.email) errors.value.email = 'Email harus diisi';
  else if (!/\S+@\S+\.\S+/.test(form.value.email)) errors.value.email = 'Email tidak valid';
  if (!form.value.jabatan) errors.value.jabatan = 'Jabatan harus diisi';
  if (!form.value.golongan) errors.value.golongan = 'Golongan harus diisi';
  if (!form.value.status) errors.value.status = 'Status harus diisi';
  return Object.keys(errors.value).length === 0;
};

// Submit data
const handleSubmit = async () => {
  if (!validate()) return;
  submitting.value = true;
  try {
    const insertData = {
      nip: form.value.nip,
      nama: form.value.nama,
      email: form.value.email,
      no_hp: form.value.no_hp || null,
      tempat_lahir: form.value.tempat_lahir || null,
      tanggal_lahir: form.value.tanggal_lahir ? form.value.tanggal_lahir.toISOString().split('T')[0] : null,
      alamat: form.value.alamat || null,
      jabatan: form.value.jabatan,
      golongan: form.value.golongan,
      unit_kerja_id: form.value.unit_kerja_id || null,
      pendidikan: form.value.pendidikan || null,
      tmt_pangkat: form.value.tmt_pangkat ? form.value.tmt_pangkat.toISOString().split('T')[0] : null,
      status: form.value.status,
      jenis_kelamin: form.value.jenis_kelamin || null
    };
    const { error } = await supabase.from('pegawai').insert([insertData]);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pegawai berhasil ditambahkan', life: 3000 });
    router.push('/pegawai');
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    submitting.value = false;
  }
};

const goBack = () => router.push('/pegawai');

onMounted(() => {
  fetchUnits();
});
</script>

<style scoped>
.create-pegawai-page {
  min-height: 100vh;
  background: var(--surface-ground);
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--surface-card);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid var(--surface-border);
}
.create-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.create-header-icon {
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
.create-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
}
.create-subtitle {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0;
}
.create-header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Form Card */
.form-card {
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin-bottom: 1.5rem;
  overflow: hidden;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-color);
}
.card-title i {
  font-size: 1.2rem;
  color: var(--primary-color);
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.field.full-width {
  grid-column: 1 / -1;
}
.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color-secondary);
}
.text-red-500 {
  color: #ef4444;
}
.p-error {
  color: #ef4444;
  font-size: 0.7rem;
  margin-top: 0.2rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
.btn-primary {
  font-weight: 600;
}

/* Responsive */
@media (max-width: 640px) {
  .create-pegawai-page {
    padding: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .create-header {
    flex-direction: column;
    align-items: stretch;
  }
  .create-header-actions {
    justify-content: flex-start;
  }
}
</style>