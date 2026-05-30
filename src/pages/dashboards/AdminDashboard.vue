<!-- File: src/pages/dashboards/AdminDashboard.vue -->
<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';

// Core Widgets
import PegawaiStatsWidget from '@/components/dashboard/PegawaiStatsWidget.vue';
import PegawaiChartWidget from '@/components/dashboard/PegawaiChartWidget.vue';
import RecentActivitiesWidget from '@/components/dashboard/RecentActivitiesWidget.vue';
import PendingActionsWidget from '@/components/dashboard/PendingActionsWidget.vue';
import PegawaiRoleWidget from '@/components/dashboard/PegawaiRoleWidget.vue';

// PrimeVue 4 Components
import Skeleton from 'primevue/skeleton';

const authStore = useAuthStore();
const isLoading = ref(true);
const counterStats = ref({
    totalPegawai: 0,
    pendingCuti: 0
});

const userName = computed(() => authStore.user?.name || 'Administrator');
const displayRole = computed(() => {
    return authStore.userRole === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN KEPEGAWAIAN';
});

async function fetchQuickMetrics() {
    try {
        isLoading.value = true;
        const { count: pegawaiCount, error: pError } = await supabase
            .from('pegawai')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'aktif');

        const { count: cutiCount, error: cError } = await supabase
            .from('cuti')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (!pError && !cError) {
            counterStats.value.totalPegawai = pegawaiCount || 0;
            counterStats.value.pendingCuti = cutiCount || 0;
        }
    } catch (err) {
        console.error('Metrics retrieval failure:', err);
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    fetchQuickMetrics();
});
</script>

<template>
    <div class="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8 transition-all duration-300">
        
        <!-- ==================== ADAPTIVE HERO BANNER (CONSISTENT WITH EMPLOYEE) ==================== -->
        <header class="relative overflow-hidden rounded-2xl border transition-all duration-300
            bg-surface-0 border-surface-200 shadow-sm text-surface-900 
            dark:bg-gradient-to-br dark:from-emerald-950 dark:to-surface-950 dark:border-emerald-900/30 dark:shadow-emerald-950/20 dark:text-white
            p-6 md:p-8 lg:p-10">
            
            <!-- Glow Effect -->
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <!-- Badge Status -->
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 border transition-all duration-300
                        bg-emerald-50 border-emerald-200 text-emerald-700
                        dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300">
                        <i class="pi pi-shield text-[10px]"></i>
                        <span>CONTRÔLE: {{ displayRole }} PANEL</span>
                    </div>
                    <!-- Title -->
                    <h1 class="text-2xl md:text-3xl font-black tracking-tight leading-tight m-0 text-surface-900 dark:text-white">
                        Selamat Datang Kembali, <span class="text-emerald-600 dark:text-emerald-400">{{ userName }}</span>
                    </h1>
                    <p class="text-sm md:text-base font-medium text-surface-500 dark:text-white/70 m-0 mt-1">
                        Sistem Informasi Manajemen Kepegawaian (SIMPEG) Eksekutif.
                    </p>
                </div>

                <!-- Quick Counter Indicators (Consistent with Dashboard Architecture) -->
                <div v-if="!isLoading" class="flex items-center border rounded-xl p-4 gap-6 w-full sm:w-auto justify-around sm:justify-start shadow-sm transition-all duration-300
                    bg-surface-50 border-surface-200 dark:bg-black/20 dark:border-white/5">
                    <div>
                        <span class="block text-2xl font-black tracking-tight text-surface-900 dark:text-white">{{ counterStats.totalPegawai }}</span>
                        <span class="text-[10px] font-extrabold uppercase tracking-widest text-surface-400">Aparatur Aktif</span>
                    </div>
                    <div class="w-px h-8 bg-surface-200 dark:bg-white/10"></div>
                    <div>
                        <span class="block text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">{{ counterStats.pendingCuti }}</span>
                        <span class="text-[10px] font-extrabold uppercase tracking-widest text-surface-400">Pending Cuti</span>
                    </div>
                </div>
                <div v-else class="w-full sm:w-48 h-16 rounded-xl bg-surface-100 dark:bg-white/5 animate-pulse"></div>
            </div>
        </header>

        <!-- ==================== PREMIUM MINIMALIST ACTION HUB ==================== -->
        <section class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
                <div class="w-1.5 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-full"></div>
                <h2 class="text-base font-bold tracking-tight text-surface-900 dark:text-surface-0">Aksi Akses Cepat</h2>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Tambah Pegawai -->
                <router-link to="/pegawai/create" class="group flex items-center p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md">
                    <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg transition-all group-hover:scale-110 shadow-sm">
                        <i class="pi pi-user-plus"></i>
                    </div>
                    <span class="ml-4 text-xs font-extrabold tracking-wider text-surface-700 dark:text-surface-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">TAMBAH PEGAWAI</span>
                </router-link>

                <!-- Cetak Laporan -->
                <router-link to="/reports" class="group flex items-center p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md">
                    <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg transition-all group-hover:scale-110 shadow-sm">
                        <i class="pi pi-file-export"></i>
                    </div>
                    <span class="ml-4 text-xs font-extrabold tracking-wider text-surface-700 dark:text-surface-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">CETAK LAPORAN</span>
                </router-link>

                <!-- Kelola User (Super Admin Only) -->
                <router-link v-if="authStore.isSuperAdmin" to="/admin/users" class="group flex items-center p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md">
                    <div class="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-lg transition-all group-hover:scale-110 shadow-sm">
                        <i class="pi pi-users"></i>
                    </div>
                    <span class="ml-4 text-xs font-extrabold tracking-wider text-surface-700 dark:text-surface-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">MANAJEMEN USER</span>
                </router-link>

                <!-- Log Audit (Super Admin Only) -->
                <router-link v-if="authStore.isSuperAdmin" to="/admin/audit" class="group flex items-center p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md">
                    <div class="w-12 h-12 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center text-lg transition-all group-hover:scale-110 shadow-sm">
                        <i class="pi pi-lock"></i>
                    </div>
                    <span class="ml-4 text-xs font-extrabold tracking-wider text-surface-700 dark:text-surface-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">LOG AUDIT SISTEM</span>
                </router-link>
            </div>
        </section>

        <!-- ==================== CORE CONTEXT GRID ARCHITECTURE ==================== -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            <!-- LEFT & CENTER MAIN WORKSPACE (2 Columns wide) -->
            <div class="lg:col-span-2 flex flex-col gap-6">
                <!-- Statistics Subcomponents Row -->
                <div class="w-full">
                    <PegawaiStatsWidget />
                </div>

                <!-- Chart Demografi Widget Panel -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm transition-all">
                    <div class="flex items-center gap-3 border-b border-surface-100 dark:border-surface-800 pb-4 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><i class="pi pi-chart-bar"></i></div>
                        <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 m-0">Grafik Distribusi Demografi Pegawai</h3>
                    </div>
                    <div class="w-full">
                        <PegawaiChartWidget />
                    </div>
                </div>

                <!-- Actionable Datatable (Verifikasi Dokumen) -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm transition-all">
                    <div class="flex items-center gap-3 border-b border-surface-100 dark:border-surface-800 pb-4 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><i class="pi pi-exclamation-circle"></i></div>
                        <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 m-0">Perlu Verifikasi & Validasi Dokumen</h3>
                    </div>
                    <div class="w-full">
                        <PendingActionsWidget />
                    </div>
                </div>
            </div>

            <!-- RIGHT SIDEBAR REGIONS (1 Column wide) -->
            <div class="flex flex-col gap-6 w-full">
                <!-- Structural Roles Analysis -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
                    <div class="flex items-center gap-3 border-b border-surface-100 dark:border-surface-800 pb-4 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-primary-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><i class="pi pi-sitemap"></i></div>
                        <h3 class="text-sm font-bold text-surface-900 dark:text-surface-0 m-0">Distribusi Struktur Jabatan</h3>
                    </div>
                    <PegawaiRoleWidget />
                </div>

                <!-- Server Security Audit Activities -->
                <div v-if="authStore.isSuperAdmin" class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
                    <div class="flex items-center gap-3 border-b border-surface-100 dark:border-surface-800 pb-4 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center"><i class="pi pi-history"></i></div>
                        <h3 class="text-sm font-bold text-surface-900 dark:text-surface-0 m-0">Aktivitas Server Terakhir</h3>
                    </div>
                    <RecentActivitiesWidget />
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.router-link-active {
    pointer-events: none;
}
</style>