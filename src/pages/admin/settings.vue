<template>
  <div class="w-full mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
    
    <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xl shadow-zinc-500/20">
            <i class="pi pi-cog text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> System Core Preferences
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0 uppercase">Konfigurasi Sistem</h1>
            <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
              Kendalikan parameter global, protokol keamanan, dan integrasi layanan cloud aplikasi Anda.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <Button icon="pi pi-sync" class="p-4 bg-zinc-100 text-zinc-600 border-0 rounded-xl hover:bg-zinc-200 transition-all" @click="loadData" :loading="loading" />
          <Button label="Simpan Perubahan" icon="pi pi-save" class="text-[11px] font-black bg-zinc-950 text-white px-8 py-4 rounded-xl border-0 shadow-lg uppercase tracking-widest" @click="saveSettings" :loading="saving" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col gap-6">
        <div class="flex items-center gap-4 mb-2">
          <div class="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 flex items-center justify-center">
            <i class="pi pi-building text-sm"></i>
          </div>
          <h3 class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Pengaturan Instansi</h3>
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Aplikasi</label>
            <InputText v-model="settings.app_name" class="w-full text-xs p-4 border-zinc-200 rounded-xl bg-zinc-50/50" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nama Organisasi</label>
            <InputText v-model="settings.organization" class="w-full text-xs p-4 border-zinc-200 rounded-xl bg-zinc-50/50" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email Admin</label>
              <InputText v-model="settings.admin_email" class="w-full text-xs p-4 border-zinc-200 rounded-xl" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Phone Support</label>
              <InputText v-model="settings.admin_phone" class="w-full text-xs p-4 border-zinc-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col gap-6">
        <div class="flex items-center gap-4 mb-2">
          <div class="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <i class="pi pi-shield text-sm"></i>
          </div>
          <h3 class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Keamanan & Akses</h3>
        </div>

        <div class="flex flex-col gap-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Session Timeout (Min)</label>
              <InputNumber v-model="settings.session_timeout" showButtons buttonLayout="horizontal" class="text-xs" inputClass="p-4 text-center border-zinc-200" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Max Login Attempts</label>
              <InputNumber v-model="settings.max_login_attempts" class="text-xs" inputClass="p-4 border-zinc-200 rounded-xl" />
            </div>
          </div>

          <div class="space-y-4 pt-2">
            <div class="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-zinc-800 dark:text-zinc-200">Wajib Ganti Password</span>
                <span class="text-[10px] text-zinc-400 font-medium italic">Paksa pengguna ganti password setiap 90 hari</span>
              </div>
              <Checkbox v-model="settings.require_password_change" :binary="true" />
            </div>
            <div class="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-zinc-800 dark:text-zinc-200">Two-Factor Authentication</span>
                <span class="text-[10px] text-zinc-400 font-medium italic">Gunakan kode OTP untuk login administrator</span>
              </div>
              <Checkbox v-model="settings.enable_two_factor" :binary="true" />
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col gap-6">
        <div class="flex items-center gap-4 mb-2">
          <div class="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center">
            <i class="pi pi-envelope text-sm"></i>
          </div>
          <h3 class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Mail Server (SMTP)</h3>
        </div>

        <div class="flex flex-col gap-5">
          <div class="flex gap-4 mb-2">
            <div class="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full">
              <Checkbox v-model="settings.email_notifications" :binary="true" />
              <span class="text-[10px] font-black uppercase text-zinc-600">Email Aktif</span>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full">
              <Checkbox v-model="settings.sms_notifications" :binary="true" />
              <span class="text-[10px] font-black uppercase text-zinc-600">SMS Aktif</span>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SMTP Host</label>
            <InputText v-model="settings.smtp_host" placeholder="smtp.provider.com" class="w-full text-xs p-4 border-zinc-200 rounded-xl" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SMTP Port</label>
            <InputNumber v-model="settings.smtp_port" class="w-full" inputClass="p-4 text-xs border-zinc-200 rounded-xl" />
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col gap-6 text-zinc-900">
        <div class="flex items-center gap-4 mb-2">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <i class="pi pi-database text-sm"></i>
          </div>
          <h3 class="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Backup & Storage</h3>
        </div>

        <div class="flex flex-col gap-6">
          <div class="flex items-center gap-3">
             <Checkbox v-model="settings.auto_backup" :binary="true" />
             <span class="text-xs font-bold text-zinc-700">Aktifkan Backup Database Otomatis</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Frekuensi</label>
              <Select v-model="settings.backup_frequency" :options="backupOptions" optionLabel="label" optionValue="value" class="text-xs h-12 flex items-center px-2 border-zinc-200" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Retensi (Hari)</label>
              <InputNumber v-model="settings.backup_retention" inputClass="p-4 text-xs border-zinc-200 rounded-xl" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-[10px] font-black text-zinc-400 uppercase tracking-widest">S3 Bucket / Local Path</label>
            <div class="flex gap-2">
              <InputText v-model="settings.backup_location" class="flex-1 text-xs p-4 border-zinc-200 rounded-xl bg-zinc-50" />
              <Button icon="pi pi-folder-open" severity="secondary" outlined class="rounded-xl px-4" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center p-8 opacity-50">
      <div class="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
        <span>Simpeg Engine v4.2.0</span>
        <span class="w-1 h-1 bg-zinc-300 rounded-full"></span>
        <span>Runtime Status: Stable</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';

// PrimeVue Components
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
  app_name: '',
  organization: '',
  admin_email: '',
  admin_phone: '',
  session_timeout: 30,
  max_login_attempts: 5,
  require_password_change: false,
  enable_two_factor: false,
  email_notifications: false,
  sms_notifications: false,
  smtp_host: '',
  smtp_port: null,
  auto_backup: false,
  backup_frequency: 'daily',
  backup_retention: 30,
  backup_location: ''
});

const backupOptions = [
  { label: 'Setiap Jam', value: 'hourly' },
  { label: 'Harian (00:00)', value: 'daily' },
  { label: 'Mingguan', value: 'weekly' },
  { label: 'Bulanan', value: 'monthly' }
];

// Logic: Load Data
const loadData = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"
    
    if (data) {
      settings.value = { ...settings.value, ...data };
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'System Error', detail: 'Gagal sinkronisasi data pengaturan', life: 3000 });
  } finally {
    loading.value = false;
  }
};

// Logic: Save Data
const saveSettings = async () => {
  saving.value = true;
  try {
    // Note: We use ID 1 as the single record for settings
    const { error } = await supabase
      .from('system_settings')
      .upsert({ id: 1, ...settings.value, updated_at: new Date() });

    if (error) throw error;
    
    toast.add({ 
      severity: 'success', 
      summary: 'Konfigurasi Terupdate', 
      detail: 'Parameter sistem berhasil diterapkan secara global', 
      life: 3000 
    });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Update Gagal', detail: err.message, life: 3000 });
  } finally {
    savingSchedule(); // Placeholder for any side effects
    saving.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Transisi halus saat hover pada card */
.grid > div {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05);
  border-color: var(--zinc-300);
}

/* Custom styling untuk input number buttons */
:deep(.p-inputnumber-button) {
  @apply bg-zinc-100 border-0 text-zinc-600;
}
</style>