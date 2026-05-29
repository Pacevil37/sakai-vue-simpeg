<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="settings-header">
      <div class="settings-header-content">
        <div class="settings-header-icon">
          <i class="pi pi-cog"></i>
        </div>
        <div>
          <h1 class="settings-title">Konfigurasi Sistem</h1>
          <p class="settings-subtitle">Kelola pengaturan umum aplikasi</p>
        </div>
      </div>
      <div class="settings-header-actions">
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
        <Button label="Simpan Perubahan" icon="pi pi-save" @click="saveSettings" :loading="saving" />
      </div>
    </div>

    <div class="settings-grid">
      <!-- Pengaturan Umum -->
      <div class="settings-card">
        <div class="settings-card-header">
          <div class="settings-card-icon">
            <i class="pi pi-building"></i>
          </div>
          <h3>Pengaturan Umum</h3>
        </div>
        <div class="field">
          <label>Nama Aplikasi</label>
          <InputText v-model="settings.app_name" />
        </div>
        <div class="field">
          <label>Nama Organisasi</label>
          <InputText v-model="settings.organization" />
        </div>
        <div class="field">
          <label>Email Admin</label>
          <InputText v-model="settings.admin_email" type="email" />
        </div>
        <div class="field">
          <label>No. Telepon Admin</label>
          <InputText v-model="settings.admin_phone" />
        </div>
      </div>

      <!-- Pengaturan Keamanan -->
      <div class="settings-card">
        <div class="settings-card-header">
          <div class="settings-card-icon">
            <i class="pi pi-shield"></i>
          </div>
          <h3>Pengaturan Keamanan</h3>
        </div>
        <div class="field">
          <label>Timeout Sesi (menit)</label>
          <InputNumber v-model="settings.session_timeout" :min="5" :max="480" />
        </div>
        <div class="field">
          <label>Maksimal Percobaan Login</label>
          <InputNumber v-model="settings.max_login_attempts" :min="3" :max="10" />
        </div>
        <div class="field-checkbox">
          <Checkbox v-model="settings.require_password_change" binary />
          <label>Wajib Ganti Password Setiap 90 Hari</label>
        </div>
        <div class="field-checkbox">
          <Checkbox v-model="settings.enable_two_factor" binary />
          <label>Aktifkan Two-Factor Authentication</label>
        </div>
      </div>

      <!-- Pengaturan Notifikasi -->
      <div class="settings-card">
        <div class="settings-card-header">
          <div class="settings-card-icon">
            <i class="pi pi-envelope"></i>
          </div>
          <h3>Pengaturan Notifikasi</h3>
        </div>
        <div class="field-checkbox">
          <Checkbox v-model="settings.email_notifications" binary />
          <label>Aktifkan Notifikasi Email</label>
        </div>
        <div class="field-checkbox">
          <Checkbox v-model="settings.sms_notifications" binary />
          <label>Aktifkan Notifikasi SMS</label>
        </div>
        <div class="field">
          <label>SMTP Host</label>
          <InputText v-model="settings.smtp_host" />
        </div>
        <div class="field">
          <label>SMTP Port</label>
          <InputNumber v-model="settings.smtp_port" :min="1" :max="65535" />
        </div>
      </div>

      <!-- Pengaturan Backup -->
      <div class="settings-card">
        <div class="settings-card-header">
          <div class="settings-card-icon">
            <i class="pi pi-database"></i>
          </div>
          <h3>Pengaturan Backup</h3>
        </div>
        <div class="field-checkbox">
          <Checkbox v-model="settings.auto_backup" binary />
          <label>Aktifkan Backup Otomatis</label>
        </div>
        <div class="field">
          <label>Frekuensi Backup</label>
          <Select v-model="settings.backup_frequency" :options="backupOptions" optionLabel="label" optionValue="value" placeholder="Pilih frekuensi" />
        </div>
        <div class="field">
          <label>Retensi Backup (hari)</label>
          <InputNumber v-model="settings.backup_retention" :min="1" :max="365" />
        </div>
        <div class="field">
          <label>Lokasi Backup</label>
          <InputText v-model="settings.backup_location" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import Button from 'primevue/button';

const toast = useToast();

// State
const loading = ref(false);
const saving = ref(false);
const settings = ref({
  app_name: 'SIMPEG',
  organization: 'Kementerian Agama Kab. Biak Numfor',
  admin_email: 'admin@biako.kemenag.go.id',
  admin_phone: '',
  session_timeout: 30,
  max_login_attempts: 5,
  require_password_change: true,
  enable_two_factor: false,
  email_notifications: true,
  sms_notifications: false,
  smtp_host: 'smtp.gmail.com',
  smtp_port: 587,
  auto_backup: true,
  backup_frequency: 'daily',
  backup_retention: 30,
  backup_location: '/backup'
});

const backupOptions = ref([
  { label: 'Harian', value: 'daily' },
  { label: 'Mingguan', value: 'weekly' },
  { label: 'Bulanan', value: 'monthly' }
]);

// Load data
const loadData = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();
    if (error) throw error;
    if (data) settings.value = data;
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Save data
const saveSettings = async () => {
  saving.value = true;
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id: 1, ...settings.value }, { onConflict: 'id' });
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Pengaturan disimpan', life: 3000 });
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem;
}

.settings-header {
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

.settings-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.settings-header-icon {
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

.settings-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.settings-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.settings-header-actions {
  display: flex;
  gap: 0.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.settings-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}
.settings-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.settings-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}
.settings-card-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: rgba(139,92,246,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
  font-size: 1.2rem;
}
.settings-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  color: #475569;
}
.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.field-checkbox label {
  font-weight: 500;
  color: #334155;
}

@media (max-width: 640px) {
  .settings-page { padding: 1rem; }
  .settings-grid { grid-template-columns: 1fr; }
}
</style>