<template>
  <div class="edit-pegawai">
    <!-- Header -->
    <div class="edit-header">
      <div>
        <h1>Edit Pegawai</h1>
        <p class="text-secondary">Perbarui informasi data pegawai</p>
      </div>
      <Button label="Kembali" icon="pi pi-arrow-left" severity="secondary" outlined @click="goBack" />
    </div>

    <div v-if="loading" class="flex justify-content-center py-5">
      <ProgressSpinner />
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <!-- Card 1: Informasi Pribadi -->
      <Card class="form-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-user"></i>
            <span>Informasi Pribadi</span>
          </div>
        </template>
        <template #content>
          <div class="form-grid">
            <div class="field">
              <label>NIP <span class="required">*</span></label>
              <InputText v-model="form.nip" :class="{ 'p-invalid': errors.nip }" />
              <small v-if="errors.nip" class="p-error">{{ errors.nip }}</small>
            </div>
            <div class="field">
              <label>Nama Lengkap <span class="required">*</span></label>
              <InputText v-model="form.nama" :class="{ 'p-invalid': errors.nama }" />
              <small v-if="errors.nama" class="p-error">{{ errors.nama }}</small>
            </div>
            <div class="field">
              <label>Email <span class="required">*</span></label>
              <InputText v-model="form.email" type="email" :class="{ 'p-invalid': errors.email }" />
              <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
            </div>
            <div class="field">
              <label>No. Telepon</label>
              <InputText v-model="form.no_hp" />
            </div>
            <div class="field">
              <label>Tempat Lahir</label>
              <InputText v-model="form.tempat_lahir" />
            </div>
            <div class="field">
              <label>Tanggal Lahir</label>
              <DatePicker v-model="form.tanggal_lahir" dateFormat="yy-mm-dd" placeholder="Pilih tanggal" />
            </div>
            <div class="field full-width">
              <label>Alamat</label>
              <Textarea v-model="form.alamat" rows="2" />
            </div>
          </div>
        </template>
      </Card>

      <!-- Card 2: Informasi Pekerjaan -->
      <Card class="form-card mt-3">
        <template #title>
          <div class="card-title">
            <i class="pi pi-briefcase"></i>
            <span>Informasi Pekerjaan</span>
          </div>
        </template>
        <template #content>
          <div class="form-grid">
            <div class="field">
              <label>Jabatan <span class="required">*</span></label>
              <InputText v-model="form.jabatan" :class="{ 'p-invalid': errors.jabatan }" />
              <small v-if="errors.jabatan" class="p-error">{{ errors.jabatan }}</small>
            </div>
            <div class="field">
              <label>Golongan <span class="required">*</span></label>
              <Select v-model="form.golongan" :options="golonganOptions" placeholder="Pilih golongan" :class="{ 'p-invalid': errors.golongan }" />
              <small v-if="errors.golongan" class="p-error">{{ errors.golongan }}</small>
            </div>
            <div class="field">
              <label>Unit Kerja</label>
              <Select v-model="form.unit_kerja_id" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Pilih unit kerja" />
            </div>
            <div class="field">
              <label>TMT Pangkat</label>
              <DatePicker v-model="form.tmt_pangkat" dateFormat="yy-mm-dd" placeholder="Pilih tanggal" />
            </div>
            <div class="field">
              <label>Status <span class="required">*</span></label>
              <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Pilih status" :class="{ 'p-invalid': errors.status }" />
              <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
            </div>
          </div>
        </template>
      </Card>

      <!-- Card 3: Informasi Pendidikan -->
      <Card class="form-card mt-3">
        <template #title>
          <div class="card-title">
            <i class="pi pi-graduation-cap"></i>
            <span>Informasi Pendidikan</span>
          </div>
        </template>
        <template #content>
          <div class="form-grid">
            <div class="field">
              <label>Pendidikan Terakhir</label>
              <Select v-model="form.pendidikan" :options="pendidikanOptions" placeholder="Pilih pendidikan" />
            </div>
          </div>
        </template>
      </Card>

      <!-- Tombol Aksi -->
      <div class="form-actions">
        <Button label="Batal" icon="pi pi-times" severity="secondary" @click="goBack" :disabled="submitting" />
        <Button label="Simpan Perubahan" icon="pi pi-save" type="submit" :loading="submitting" />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
const route = useRoute();
const toast = useToast();

const loading = ref(true);
const submitting = ref(false);
const pegawaiId = ref(route.params.id);

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
  status: 'aktif'
});

const unitOptions = ref([]);
const golonganOptions = ref(['I/a','I/b','I/c','I/d','II/a','II/b','II/c','II/d','III/a','III/b','III/c','III/d','IV/a','IV/b','IV/c','IV/d']);
const statusOptions = ref([
  { label: 'Aktif', value: 'aktif' },
  { label: 'Pensiun', value: 'pensiun' },
  { label: 'Mutasi', value: 'mutasi' }
]);
const pendidikanOptions = ref(['SD','SMP','SMA','D1','D2','D3','D4','S1','S2','S3']);

const errors = ref({});

const fetchUnits = async () => {
  const { data, error } = await supabase.from('units').select('id, name');
  if (!error) unitOptions.value = data.map(u => ({ label: u.name, value: u.id }));
};

const loadPegawai = async () => {
  try {
    const { data, error } = await supabase.from('pegawai').select('*').eq('id', pegawaiId.value).single();
    if (error) throw error;
    if (!data) throw new Error();
    form.value = {
      nip: data.nip || '',
      nama: data.nama || '',
      email: data.email || '',
      no_hp: data.no_hp || '',
      tempat_lahir: data.tempat_lahir || '',
      tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : null,
      alamat: data.alamat || '',
      jabatan: data.jabatan || '',
      golongan: data.golongan || '',
      unit_kerja_id: data.unit_kerja_id || null,
      pendidikan: data.pendidikan || '',
      tmt_pangkat: data.tmt_pangkat ? new Date(data.tmt_pangkat) : null,
      status: data.status || 'aktif'
    };
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 3000 });
    router.push('/pegawai');
  } finally {
    loading.value = false;
  }
};

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

const handleSubmit = async () => {
  if (!validate()) return;
  submitting.value = true;
  try {
    const updateData = {
      nip: form.value.nip,
      nama: form.value.nama,
      email: form.value.email,
      no_hp: form.value.no_hp,
      tempat_lahir: form.value.tempat_lahir,
      tanggal_lahir: form.value.tanggal_lahir ? form.value.tanggal_lahir.toISOString().split('T')[0] : null,
      alamat: form.value.alamat,
      jabatan: form.value.jabatan,
      golongan: form.value.golongan,
      unit_kerja_id: form.value.unit_kerja_id,
      pendidikan: form.value.pendidikan,
      tmt_pangkat: form.value.tmt_pangkat ? form.value.tmt_pangkat.toISOString().split('T')[0] : null,
      status: form.value.status
    };
    const { error } = await supabase.from('pegawai').update(updateData).eq('id', pegawaiId.value);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data pegawai berhasil diperbarui', life: 3000 });
    router.push('/pegawai');
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: error.message, life: 3000 });
  } finally {
    submitting.value = false;
  }
};

const goBack = () => router.push('/pegawai');

onMounted(async () => {
  await fetchUnits();
  await loadPegawai();
});
</script>

<style scoped>
.edit-pegawai {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--surface-border);
}

.edit-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.text-secondary {
  color: var(--text-color-secondary);
  margin: 0.25rem 0 0;
}

.form-card {
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  align-items: start;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field.full-width {
  grid-column: 1 / -1;
}

.field label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.required {
  color: #ef4444;
}

.p-error {
  color: #ef4444;
  font-size: 0.7rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

/* Responsive: pada layar kecil, grid menjadi 1 kolom */
@media (max-width: 640px) {
  .edit-pegawai {
    padding: 1rem;
  }
  .form-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .edit-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>