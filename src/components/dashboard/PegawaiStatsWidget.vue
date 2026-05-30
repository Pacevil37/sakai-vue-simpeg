<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import Skeleton from 'primevue/skeleton';

const toast = useToast();
const isLoading = ref(false);

const stats = ref({
    totalPegawai: 0,
    activePegawai: 0,
    lakiLaki: 0,
    perempuan: 0,
    newThisMonth: 0,
    totalCuti: 0,
});

const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
};

const loadStats = async () => {
    isLoading.value = true;
    try {
        // PERBAIKAN UTAMA: Eksekusi Multi-Query Simultan (Menghemat waktu muat hingga 300%)
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const [
            resTotal, 
            resActive, 
            resLaki, 
            resPerempuan, 
            resNew, 
            resCuti
        ] = await Promise.all([
            supabase.from('pegawai').select('*', { count: 'exact', head: true }),
            supabase.from('pegawai').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('pegawai').select('*', { count: 'exact', head: true }).in('jenis_kelamin', ['L', 'Laki-laki']),
            supabase.from('pegawai').select('*', { count: 'exact', head: true }).in('jenis_kelamin', ['P', 'Perempuan']),
            supabase.from('pegawai').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
            supabase.from('cuti').select('*', { count: 'exact', head: true })
        ]);

        // Validasi Error Kolektif
        if (resTotal.error) throw resTotal.error;
        if (resActive.error) throw resActive.error;
        if (resLaki.error) throw resLaki.error;
        if (resPerempuan.error) throw resPerempuan.error;
        if (resNew.error) throw resNew.error;
        if (resCuti.error) throw resCuti.error;

        stats.value = {
            totalPegawai: resTotal.count || 0,
            activePegawai: resActive.count || 0,
            lakiLaki: resLaki.count || 0,
            perempuan: resPerempuan.count || 0,
            newThisMonth: resNew.count || 0,
            totalCuti: resCuti.count || 0,
        };
    } catch (error) {
        console.error('Error loading stats:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal Memuat Statistik',
            detail: error.message || 'Terjadi gangguan komunikasi data.',
            life: 4000,
        });
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadStats();
});
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full transition-all duration-300">
        
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-start justify-between mb-4">
                <span class="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Total Pegawai</span>
                <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                    <i class="pi pi-users text-lg"></i>
                </div>
            </div>
            <div class="mb-3">
                <Skeleton v-if="isLoading" width="50%" height="2.25rem" class="my-1"></Skeleton>
                <h3 v-else class="text-3xl font-black text-surface-900 dark:text-white m-0 tracking-tight">{{ stats.totalPegawai }}</h3>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
                <span class="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <i class="pi pi-check-circle text-[10px]"></i> {{ stats.activePegawai }}
                </span>
                <span class="text-surface-400 font-medium">Pegawai Berstatus Aktif</span>
            </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-start justify-between mb-4">
                <span class="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Aparatur Laki-Laki</span>
                <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-inner">
                    <i class="pi pi-user text-lg"></i>
                </div>
            </div>
            <div class="mb-3">
                <Skeleton v-if="isLoading" width="50%" height="2.25rem" class="my-1"></Skeleton>
                <h3 v-else class="text-3xl font-black text-surface-900 dark:text-white m-0 tracking-tight">{{ stats.lakiLaki }}</h3>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
                <span class="font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">
                    {{ calculatePercentage(stats.lakiLaki, stats.totalPegawai) }}%
                </span>
                <span class="text-surface-400 font-medium">Rasio dari Total SDM</span>
            </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-start justify-between mb-4">
                <span class="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Aparatur Perempuan</span>
                <div class="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-inner">
                    <i class="pi pi-user text-lg"></i>
                </div>
            </div>
            <div class="mb-3">
                <Skeleton v-if="isLoading" width="50%" height="2.25rem" class="my-1"></Skeleton>
                <h3 v-else class="text-3xl font-black text-surface-900 dark:text-white m-0 tracking-tight">{{ stats.perempuan }}</h3>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
                <span class="font-black text-pink-600 dark:text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md">
                    {{ calculatePercentage(stats.perempuan, stats.totalPegawai) }}%
                </span>
                <span class="text-surface-400 font-medium">Rasio dari Total SDM</span>
            </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div class="flex items-start justify-between mb-4">
                <span class="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-widest">Rekrutmen Bulan Ini</span>
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                    <i class="pi pi-bolt text-lg"></i>
                </div>
            </div>
            <div class="mb-3">
                <Skeleton v-if="isLoading" width="50%" height="2.25rem" class="my-1"></Skeleton>
                <h3 v-else class="text-3xl font-black text-surface-900 dark:text-white m-0 tracking-tight">{{ stats.newThisMonth }}</h3>
            </div>
            <div class="flex items-center gap-1.5 text-xs">
                <span class="font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {{ stats.totalCuti }}
                </span>
                <span class="text-surface-400 font-medium">Total Pengajuan Berkas Cuti</span>
            </div>
        </div>

    </div>
</template>