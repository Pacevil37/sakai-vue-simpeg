<template>
  <div class="pegawai-dashboard-page">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="dashboard-header-content">
        <div class="dashboard-header-icon">
          <i class="pi pi-id-card"></i>
        </div>
        <div>
          <h1 class="dashboard-title">Dashboard Pegawai</h1>
          <p class="dashboard-subtitle">Selamat datang, {{ pegawai?.nama || 'Pegawai' }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <i class="pi pi-spin pi-spinner"></i>
      </div>
      <p class="loading-text">Memuat data profil...</p>
    </div>

    <!-- Profil Pegawai -->
    <div v-else-if="pegawai" class="dashboard-grid">
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-photo">
            <i class="pi pi-user"></i>
          </div>
          <div class="profile-info">
            <h2>{{ pegawai.nama || pegawai.nama_lengkap || '-' }}</h2>
            <p class="nip">NIP: {{ pegawai.nip || '-' }}</p>
            <p class="position">{{ pegawai.jabatan || '-' }}</p>
            <p class="unit">{{ pegawai.unit_kerja || '-' }}</p>
            <p class="education">Pendidikan: {{ pegawai.pendidikan || pegawai.pendidikan_terakhir || '-' }}</p>
          </div>
        </div>
        <div class="profile-actions">
          <Button label="Edit Profil" icon="pi pi-pencil" @click="goToProfil" />
        </div>
      </div>

      <!-- Menu Riwayat -->
      <div class="menu-card">
        <div class="menu-header">
          <i class="pi pi-list"></i>
          <h3>Riwayat Saya</h3>
        </div>
        <div class="menu-list">
          <router-link to="/pegawai/riwayat-pendidikan" class="menu-item">
            <i class="pi pi-book"></i>
            <span>Riwayat Pendidikan</span>
            <i class="pi pi-chevron-right"></i>
          </router-link>
          <router-link to="/pegawai/riwayat-diklat" class="menu-item">
            <i class="pi pi-graduation-cap"></i>
            <span>Riwayat Diklat</span>
            <i class="pi pi-chevron-right"></i>
          </router-link>
          <router-link to="/pegawai/mutasi" class="menu-item">
            <i class="pi pi-arrow-right-arrow-left"></i>
            <span>Mutasi</span>
            <i class="pi pi-chevron-right"></i>
          </router-link>
          <router-link to="/pegawai/kinerja" class="menu-item">
            <i class="pi pi-chart-line"></i>
            <span>Penilaian Kinerja</span>
            <i class="pi pi-chevron-right"></i>
          </router-link>
          <router-link to="/pegawai/kgb" class="menu-item">
            <i class="pi pi-money-bill"></i>
            <span>Kenaikan Gaji Berkala (KGB)</span>
            <i class="pi pi-chevron-right"></i>
          </router-link>
          <router-link to="/pegawai/pensiun" class="menu-item">
            <i class="pi pi-calendar-times"></i>
            <span>Pensiun</span>
            <i class="pi pi-chevron-right"></i>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <p>Data profil tidak ditemukan.</p>
      <p>Silakan hubungi administrator.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import Button from 'primevue/button';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const loading = ref(true);
const pegawai = ref(null);

const loadPegawai = async () => {
  loading.value = true;
  try {
    const userEmail = authStore.user?.email;
    if (!userEmail) {
      throw new Error('User tidak ditemukan');
    }
    const { data, error } = await supabase
      .from('pegawai')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Data pegawai belum tersedia. Silakan hubungi admin.',
        life: 4000
      });
    }
    pegawai.value = data;
  } catch (err) {
    console.error(err);
    toast.add({
      severity: 'error',
      summary: 'Gagal',
      detail: err.message || 'Tidak dapat memuat data profil',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const goToProfil = () => {
  router.push('/pegawai/profil');
};

onMounted(() => {
  loadPegawai();
});
</script>

<style scoped>
.pegawai-dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-header {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

.dashboard-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-header-icon {
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

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.dashboard-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  font-size: 2.5rem;
  color: var(--primary);
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 1rem;
  color: #64748b;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  transition: box-shadow 0.2s;
}
.profile-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.profile-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}
.profile-info h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}
.profile-info .nip {
  font-size: 0.85rem;
  color: #475569;
  margin: 0;
}
.profile-info .position,
.profile-info .unit,
.profile-info .education {
  font-size: 0.85rem;
  color: #475569;
  margin: 0.25rem 0 0;
}
.profile-actions {
  display: flex;
  justify-content: flex-end;
}

.menu-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.menu-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.menu-header i {
  font-size: 1.2rem;
  color: #3b82f6;
}
.menu-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}
.menu-list {
  display: flex;
  flex-direction: column;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  color: #334155;
  text-decoration: none;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f5f9;
}
.menu-item:last-child {
  border-bottom: none;
}
.menu-item i:first-child {
  width: 1.5rem;
  font-size: 1rem;
  color: #64748b;
}
.menu-item span {
  flex: 1;
}
.menu-item i:last-child {
  font-size: 0.8rem;
  color: #94a3b8;
}
.menu-item:hover {
  background: #f8fafc;
}
.menu-item:hover span {
  color: #3b82f6;
}

.error-container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}
.error-container i {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}
.error-container p {
  margin: 0.5rem 0;
  color: #475569;
}

@media (max-width: 640px) {
  .pegawai-dashboard-page {
    padding: 1rem;
  }
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  .profile-actions {
    justify-content: center;
  }
}
</style>