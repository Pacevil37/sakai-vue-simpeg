<<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';
import PegawaiStatsWidget from '@/components/dashboard/PegawaiStatsWidget.vue';
import PegawaiRoleWidget from '@/components/dashboard/PegawaiRoleWidget.vue';
import PegawaiChartWidget from '@/components/dashboard/PegawaiChartWidget.vue';
import RecentActivitiesWidget from '@/components/dashboard/RecentActivitiesWidget.vue';
import PendingActionsWidget from '@/components/dashboard/PendingActionsWidget.vue';
import Button from 'primevue/button';

const authStore = useAuthStore();
const router = useRouter();
const pegawaiData = ref(null);

// === Computed untuk UI ===
const userName = computed(() => authStore.user?.name || authStore.user?.email?.split('@')[0] || 'User');
const userRole = computed(() => {
    const role = authStore.userRole;
    if (role === 'super_admin') return 'SUPER ADMIN';
    if (role === 'admin_kepegawaian') return 'ADMIN';
    if (role === 'pegawai') return 'PEGAWAI';
    return 'USER';
});

const welcomeMessage = computed(() => {
    if (authStore.isSuperAdmin) return 'Panel Kendali Super Admin';
    if (authStore.isAdmin || authStore.isOperator) return 'Panel Operasional Kepegawaian';
    if (authStore.isPegawai) return 'Beranda Pegawai';
    return 'Dashboard SIMPEG';
});

const welcomeSubMessage = computed(() => {
    if (authStore.isSuperAdmin) return 'Kelola seluruh aspek sistem dan data pegawai secara komprehensif.';
    if (authStore.isAdmin || authStore.isOperator) return 'Pantau dan kelola data operasional pegawai harian.';
    if (authStore.isPegawai) return 'Lihat profil dan riwayat kepegawaian Anda.';
    return 'Selamat datang kembali di Sistem Informasi Manajemen Pegawai.';
});

// === Ambil data pegawai untuk role pegawai ===
async function fetchPegawaiData() {
    if (!authStore.isPegawai) return;
    try {
        const userEmail = authStore.user?.email;
        if (!userEmail) {
            console.warn('User email not found');
            pegawaiData.value = null;
            return;
        }
        // Cari berdasarkan email (lebih aman karena email unik)
        const { data, error } = await supabase
            .from('pegawai')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle();
        if (error) throw error;
        pegawaiData.value = data;
    } catch (err) {
        console.error('Error fetching pegawai data:', err);
        pegawaiData.value = null;
    }
}

function goToProfil() {
    router.push('/pegawai/profil');
}

const pegawaiPhotoUrl = computed(() => pegawaiData.value?.foto_url || '');

onMounted(() => {
    fetchPegawaiData();
});
</script>

<template>
    <div class="dashboard-page">
        <!-- Hero Section -->
        <section class="dashboard-hero">
            <div class="dashboard-hero-inner">
                <div class="dashboard-hero-content">
                    <div class="dashboard-hero-badge">
                        <i class="pi pi-shield"></i>
                    </div>
                    <div class="dashboard-hero-text">
                        <h1 class="dashboard-hero-title">{{ welcomeMessage }}</h1>
                        <p class="dashboard-hero-subtitle">{{ welcomeSubMessage }}</p>
                        <div class="dashboard-hero-meta">
                            <i class="pi pi-user"></i>
                            <span class="dashboard-hero-name">{{ userName }}</span>
                            <span class="dashboard-hero-divider">|</span>
                            <span class="dashboard-hero-role">{{ userRole }}</span>
                        </div>
                    </div>
                </div>
                <div class="dashboard-hero-visual">
                    <div class="dashboard-hero-icon-wrap">
                        <i class="pi pi-chart-line"></i>
                    </div>
                </div>
            </div>
        </section>

        <!-- Quick Actions (Admin & Super Admin) -->
        <section class="dashboard-section" v-if="authStore.isSuperAdmin || authStore.isAdmin || authStore.isOperator">
            <header class="dashboard-section-header">
                <div class="dashboard-section-icon dashboard-section-icon--primary">
                    <i class="pi pi-bolt"></i>
                </div>
                <h2 class="dashboard-section-title">Aksi Cepat</h2>
            </header>
            <div class="dashboard-quick-actions">
                <router-link to="/pegawai/create" class="quick-action-card quick-action-card--blue">
                    <div class="quick-action-icon"><i class="pi pi-user-plus"></i></div>
                    <div class="quick-action-body">
                        <span class="quick-action-label">Tambah Pegawai</span>
                        <span class="quick-action-desc">Input data pegawai baru</span>
                    </div>
                </router-link>
                <router-link to="/reports" class="quick-action-card quick-action-card--purple">
                    <div class="quick-action-icon"><i class="pi pi-file-export"></i></div>
                    <div class="quick-action-body">
                        <span class="quick-action-label">Cetak Laporan</span>
                        <span class="quick-action-desc">Ekspor ke Excel/PDF</span>
                    </div>
                </router-link>
                <router-link v-if="authStore.isSuperAdmin" to="/admin/users" class="quick-action-card quick-action-card--orange">
                    <div class="quick-action-icon"><i class="pi pi-users"></i></div>
                    <div class="quick-action-body">
                        <span class="quick-action-label">Kelola User</span>
                        <span class="quick-action-desc">Manajemen akses sistem</span>
                    </div>
                </router-link>
                <router-link v-if="authStore.isSuperAdmin" to="/admin/audit" class="quick-action-card quick-action-card--green">
                    <div class="quick-action-icon"><i class="pi pi-shield"></i></div>
                    <div class="quick-action-body">
                        <span class="quick-action-label">Audit Log</span>
                        <span class="quick-action-desc">Pantau aktivitas sistem</span>
                    </div>
                </router-link>
            </div>
        </section>

        <!-- Profil Pegawai (khusus role pegawai) -->
        <section class="dashboard-section" v-if="authStore.isPegawai">
            <header class="dashboard-section-header">
                <div class="dashboard-section-icon dashboard-section-icon--primary">
                    <i class="pi pi-id-card"></i>
                </div>
                <h2 class="dashboard-section-title">Profil Saya</h2>
            </header>
            <div v-if="pegawaiData" class="pegawai-profile-card">
                <div class="profile-header">
                    <div class="profile-photo-section">
                        <div class="profile-photo-wrapper">
                            <img v-if="pegawaiPhotoUrl" :src="pegawaiPhotoUrl" :alt="pegawaiData.nama || pegawaiData.nama_lengkap" class="profile-photo" @error="e => e.target.style.display='none'" />
                            <div v-else class="profile-photo-placeholder"><i class="pi pi-user"></i></div>
                        </div>
                    </div>
                    <div class="profile-header-content">
                        <h3 class="profile-name">{{ pegawaiData.nama || pegawaiData.nama_lengkap }}</h3>
                        <p class="profile-nip">NIP: {{ pegawaiData.nip }}</p>
                        <p class="profile-jabatan">{{ pegawaiData.jabatan }}</p>
                        <div class="profile-status-badge"><span class="status-indicator active"></span><span class="status-text">Aktif</span></div>
                    </div>
                </div>
                <div class="profile-divider"></div>
                <div class="profile-content">
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-icon"><i class="pi pi-id-card"></i></div>
                            <div class="profile-item-content"><span class="profile-label">NIP</span><span class="profile-value">{{ pegawaiData.nip }}</span></div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-icon"><i class="pi pi-briefcase"></i></div>
                            <div class="profile-item-content"><span class="profile-label">Jabatan</span><span class="profile-value">{{ pegawaiData.jabatan }}</span></div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-icon"><i class="pi pi-building"></i></div>
                            <div class="profile-item-content"><span class="profile-label">Unit Kerja</span><span class="profile-value">{{ pegawaiData.unit_kerja || pegawaiData.unit_kerja_id }}</span></div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-icon"><i class="pi pi-graduation-cap"></i></div>
                            <div class="profile-item-content"><span class="profile-label">Pendidikan</span><span class="profile-value">{{ pegawaiData.pendidikan }}</span></div>
                        </div>
                        <div class="profile-item" v-if="pegawaiData.golongan">
                            <div class="profile-item-icon"><i class="pi pi-star"></i></div>
                            <div class="profile-item-content"><span class="profile-label">Golongan</span><span class="profile-value">{{ pegawaiData.golongan }}</span></div>
                        </div>
                        <div class="profile-item" v-if="pegawaiData.jenis_kelamin">
                            <div class="profile-item-icon"><i class="pi pi-user-plus"></i></div>
                            <div class="profile-item-content"><span class="profile-label">Jenis Kelamin</span><span class="profile-value">{{ pegawaiData.jenis_kelamin }}</span></div>
                        </div>
                    </div>
                </div>
                <div class="profile-footer">
                    <Button label="Edit Profil" icon="pi pi-pencil" @click="goToProfil" />
                </div>
            </div>
            <div v-else class="card text-center py-4">
                <p>Data pegawai belum tersedia. Hubungi admin.</p>
            </div>
        </section>

        <!-- Menu Riwayat untuk pegawai -->
        <section class="dashboard-section" v-if="authStore.isPegawai">
            <header class="dashboard-section-header">
                <div class="dashboard-section-icon dashboard-section-icon--primary"><i class="pi pi-list"></i></div>
                <h2 class="dashboard-section-title">Menu Riwayat</h2>
            </header>
            <div class="dashboard-pegawai-menu">
                <router-link to="/pegawai/profil" class="menu-item"><i class="pi pi-user"></i><span>Profil Saya</span></router-link>
                <router-link to="/pegawai/riwayat-pendidikan" class="menu-item"><i class="pi pi-book"></i><span>Riwayat Pendidikan</span></router-link>
                <router-link to="/pegawai/riwayat-diklat" class="menu-item"><i class="pi pi-graduation-cap"></i><span>Riwayat Diklat</span></router-link>
                <router-link to="/pegawai/mutasi" class="menu-item"><i class="pi pi-refresh"></i><span>Mutasi</span></router-link>
                <router-link to="/pegawai/kinerja" class="menu-item"><i class="pi pi-star"></i><span>Penilaian Kinerja</span></router-link>
                <router-link to="/pegawai/kgb" class="menu-item"><i class="pi pi-money-bill"></i><span>KGB</span></router-link>
                <router-link to="/pegawai/pensiun" class="menu-item"><i class="pi pi-calendar"></i><span>Pensiun</span></router-link>
            </div>
        </section>

        <!-- Statistik (non-pegawai) -->
        <section class="dashboard-section" v-if="!authStore.isPegawai">
            <header class="dashboard-section-header">
                <div class="dashboard-section-icon dashboard-section-icon--primary"><i class="pi pi-chart-pie"></i></div>
                <h2 class="dashboard-section-title">Ringkasan Statistik</h2>
            </header>
            <PegawaiStatsWidget />
        </section>

        <!-- Chart & Aktivitas -->
        <div class="dashboard-grid-main" :class="{ 'dashboard-grid-main--single': !authStore.isSuperAdmin }" v-if="!authStore.isPegawai">
            <section class="dashboard-section dashboard-section--chart">
                <header class="dashboard-section-header">
                    <div class="dashboard-section-icon dashboard-section-icon--primary"><i class="pi pi-chart-bar"></i></div>
                    <h2 class="dashboard-section-title">Distribusi Pegawai</h2>
                </header>
                <PegawaiChartWidget />
            </section>
            <section v-if="authStore.isSuperAdmin" class="dashboard-section dashboard-section--activities">
                <header class="dashboard-section-header">
                    <div class="dashboard-section-icon dashboard-section-icon--primary"><i class="pi pi-history"></i></div>
                    <h2 class="dashboard-section-title">Aktivitas Terakhir</h2>
                </header>
                <RecentActivitiesWidget />
            </section>
        </div>

        <!-- Pending Actions -->
        <section class="dashboard-section" v-if="authStore.isSuperAdmin || authStore.isAdmin || authStore.isOperator">
            <header class="dashboard-section-header">
                <div class="dashboard-section-icon dashboard-section-icon--primary"><i class="pi pi-exclamation-circle"></i></div>
                <h2 class="dashboard-section-title">Tindakan Menunggu Persetujuan</h2>
            </header>
            <PendingActionsWidget />
        </section>

        <!-- Struktur Organisasi -->
        <section class="dashboard-section" v-if="authStore.isSuperAdmin || authStore.isAdmin || authStore.isOperator">
            <header class="dashboard-section-header">
                <div class="dashboard-section-icon dashboard-section-icon--primary"><i class="pi pi-sitemap"></i></div>
                <h2 class="dashboard-section-title">Struktur Organisasi</h2>
            </header>
            <PegawaiRoleWidget />
        </section>
    </div>
</template>


<style scoped>
.dashboard-page {
    padding: 0 1rem 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

/* Hero */
.dashboard-hero {
    margin-bottom: 2rem;
    border-radius: 1.25rem;
    overflow: hidden;
    background: linear-gradient(135deg, #0d5c2e 0%, #1a7a3e 45%, #0d3d20 100%);
    box-shadow: 0 4px 24px rgba(65, 94, 77, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08);
    position: relative;
}

.dashboard-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 20V40H20'/%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
}

.dashboard-hero-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 2rem 2.5rem;
    position: relative;
    z-index: 1;
}

.dashboard-hero-content {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    flex: 1;
}

.dashboard-hero-badge {
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.dashboard-hero-badge i {
    font-size: 1.75rem;
    color: #fff;
}

.dashboard-hero-text {
    min-width: 0;
}

.dashboard-hero-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 0.35rem 0;
    line-height: 1.3;
    letter-spacing: -0.02em;
}

.dashboard-hero-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.88);
    margin: 0 0 1.25rem 0;
    line-height: 1.5;
    max-width: 32rem;
}

.dashboard-hero-meta {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 9999px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
}

.dashboard-hero-meta i {
    font-size: 1rem;
    opacity: 0.9;
}

.dashboard-hero-divider {
    opacity: 0.5;
    font-weight: 400;
}

.dashboard-hero-role {
    background: #fff;
    color: #0d5c2e;
    padding: 0.2rem 0.6rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.02em;
}

.dashboard-hero-visual {
    display: none;
    align-items: center;
    justify-content: center;
}

@media (min-width: 992px) {
    .dashboard-hero-visual {
        display: flex;
    }
    .dashboard-hero-icon-wrap {
        width: 6rem;
        height: 6rem;
        border-radius: 1.5rem;
        background: rgba(255, 255, 255, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .dashboard-hero-icon-wrap i {
        font-size: 3rem;
        color: rgba(255, 255, 255, 0.7);
    }
}

/* Section headers */
.dashboard-section {
    margin-bottom: 2rem;
}

.dashboard-section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    padding: 0 0.15rem;
}

.dashboard-section-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.dashboard-section-icon--primary {
    background: rgba(13, 92, 46, 0.1);
    color: #0d5c2e;
}

.dashboard-section-icon i {
    font-size: 1.2rem;
}

.dashboard-section-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
    letter-spacing: -0.02em;
}

/* Quick actions */
.dashboard-quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
}

.quick-action-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.quick-action-card:hover {
    border-color: var(--primary-color);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.quick-action-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.quick-action-icon i {
    font-size: 1.4rem;
    color: #fff;
}

.quick-action-card--blue .quick-action-icon { background: linear-gradient(135deg, #2563eb, #3b82f6); }
.quick-action-card--purple .quick-action-icon { background: linear-gradient(135deg, #7c3aed, #8b5cf6); }
.quick-action-card--orange .quick-action-icon { background: linear-gradient(135deg, #ea580c, #f97316); }
.quick-action-card--green .quick-action-icon { background: linear-gradient(135deg, #0d5c2e, #1a7a3e); }

.quick-action-body {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
}

.quick-action-label {
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-color);
}

.quick-action-desc {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
}

/* Main grid */
.dashboard-grid-main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

@media (min-width: 992px) {
    .dashboard-grid-main {
        grid-template-columns: 1fr 380px;
    }
    .dashboard-grid-main--single {
        grid-template-columns: 1fr;
    }
}

.dashboard-section--chart,
.dashboard-section--activities {
    margin-bottom: 0;
}

/* Pegawai Dashboard Menu */
.dashboard-pegawai-menu {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
}

.menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    border-radius: 0.75rem;
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.3s ease;
    text-align: center;
}

.menu-item:hover {
    background: var(--primary-50);
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(13, 92, 46, 0.15);
}

.menu-item i {
    font-size: 1.5rem;
}

.menu-item span {
    font-size: 0.875rem;
    font-weight: 600;
}

/* Pegawai Profile Card - Modern Professional Design */
.pegawai-profile-card {
    background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-card) 100%);
    border-radius: 1.25rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid var(--surface-border);
    transition: all 0.3s ease;
}

.pegawai-profile-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08);
}

/* Profile Header */
.profile-header {
    padding: 2.5rem 2rem;
    background: linear-gradient(135deg, rgba(13, 92, 46, 0.05) 0%, rgba(13, 92, 46, 0.02) 100%);
    display: flex;
    align-items: center;
    gap: 2rem;
    border-bottom: 1px solid var(--surface-border);
}

.profile-photo-section {
    flex-shrink: 0;
}

.profile-photo-wrapper {
    width: 140px;
    height: 140px;
    border-radius: 1rem;
    overflow: hidden;
    border: 3px solid var(--primary);
    box-shadow: 0 4px 12px rgba(13, 92, 46, 0.2);
    background: var(--surface-100);
}

.profile-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.profile-photo-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(13, 92, 46, 0.1) 0%, rgba(13, 92, 46, 0.05) 100%);
    font-size: 3rem;
    color: rgba(13, 92, 46, 0.3);
}

.profile-header-content {
    flex: 1;
}

.profile-name {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0 0 0.5rem;
    letter-spacing: -0.01em;
}

.profile-nip {
    font-size: 0.95rem;
    color: var(--text-color-secondary);
    margin: 0.25rem 0;
    font-weight: 500;
}

.profile-jabatan {
    font-size: 1.1rem;
    color: var(--primary);
    font-weight: 600;
    margin: 0.5rem 0 0.75rem;
}

.profile-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(34, 197, 94, 0.1);
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #22c55e;
}

.status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
}

.status-indicator.active {
    background: #22c55e;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
}

.status-text {
    display: inline;
}

/* Profile Divider */
.profile-divider {
    height: 1px;
    background: var(--surface-border);
}

/* Profile Content */
.profile-content {
    padding: 2rem;
}

.profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.profile-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--surface-50);
    border-radius: 0.875rem;
    border: 1px solid var(--surface-border);
    transition: all 0.3s ease;
}

.profile-item:hover {
    background: rgba(13, 92, 46, 0.03);
    border-color: var(--primary);
    transform: translateX(4px);
}

.profile-item-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(13, 92, 46, 0.1);
    border-radius: 0.75rem;
    color: var(--primary);
    font-size: 1.25rem;
    flex-shrink: 0;
}

.profile-item-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
}

.profile-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.profile-value {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    word-break: break-word;
}

/* Profile Footer */
.profile-footer {
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, rgba(13, 92, 46, 0.03) 0%, rgba(13, 92, 46, 0.01) 100%);
    border-top: 1px solid var(--surface-border);
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.profile-footer :deep(.p-button) {
    font-weight: 600;
    padding: 0.75rem 2rem;
    border-radius: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
        padding: 1.5rem 1rem;
    }

    .profile-photo-wrapper {
        width: 120px;
        height: 120px;
    }

    .profile-name {
        font-size: 1.5rem;
    }

    .profile-grid {
        grid-template-columns: 1fr;
    }

    .profile-item {
        flex-direction: column;
    }

    .profile-item-icon {
        width: 2.5rem;
        height: 2.5rem;
    }

    .profile-footer {
        flex-direction: column;
        justify-content: stretch;
    }

    .profile-footer :deep(.p-button) {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .pegawai-profile-card {
        border-radius: 1rem;
    }

    .profile-header {
        padding: 1.25rem;
    }

    .profile-content {
        padding: 1.25rem;
    }

    .profile-grid {
        gap: 1rem;
    }

    .profile-item {
        padding: 1rem;
    }

    .profile-name {
        font-size: 1.25rem;
    }
}
</style>
