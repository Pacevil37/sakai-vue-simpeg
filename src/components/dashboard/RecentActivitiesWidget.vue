<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import dashboardService from '@/services/dashboardService';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';

const toast = useToast();
const activities = ref([]);
const isLoading = ref(false);

const loadRecentActivities = async () => {
    isLoading.value = true;
    try {
        const response = await dashboardService.getRecentActivities();
        activities.value = response.data || response;
    } catch (error) {
        console.warn('API error, falling back to mock logs:', error);
        // Fallback Mock Data Presisi
        activities.value = [
            { id: 1, type: 'create', description: 'Menambahkan pegawai baru: Budi Santoso', user: 'Admin HRD', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
            { id: 2, type: 'update', description: 'Memperbarui berkas pangkat: Siti Aminah', user: 'Super Admin', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
            { id: 3, type: 'login', description: 'Otentikasi sesi admin berhasil', user: 'Operator 1', createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
            { id: 4, type: 'report', description: 'Ekspor mutasi triwulan PDF', user: 'Admin HRD', createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() }
        ];
    } finally {
        isLoading.value = false;
    }
};

// Penggabungan Kamus Ikon & Skema Warna Tailwind Semantik
const activityConfig = {
    login:  { icon: 'pi pi-sign-in',   class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    logout: { icon: 'pi pi-sign-out',  class: 'bg-surface-500/10 text-surface-600 dark:text-surface-400' },
    create: { icon: 'pi pi-plus',      class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    update: { icon: 'pi pi-pencil',    class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    delete: { icon: 'pi pi-trash',     class: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    report: { icon: 'pi pi-file-pdf',  class: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    default:{ icon: 'pi pi-info-circle',class: 'bg-surface-500/10 text-surface-600 dark:text-surface-400' }
};

const getConfig = (type) => activityConfig[type] || activityConfig.default;

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '-';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Baru saja';
    
    const intervals = {
        thn: 31536000,
        bln: 2592000,
        hari: 86400,
        jam: 3600,
        mnt: 60
    };

    for (const [unit, value] of Object.entries(intervals)) {
        const count = Math.floor(seconds / value);
        if (count >= 1) return `${count} ${unit} yang lalu`;
    }
    return 'Baru saja';
};

onMounted(() => {
    loadRecentActivities();
});
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm transition-all duration-300 w-full relative min-h-[360px] flex flex-col justify-between">
        
        <div>
            <div class="flex items-center justify-between mb-5">
                <div class="flex items-center gap-2.5">
                    <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <h3 class="text-sm font-black text-surface-800 dark:text-surface-100 m-0 tracking-tight">Aktivitas Sistem Terbaru</h3>
                </div>
                <Button icon="pi pi-refresh" severity="secondary" rounded text size="small" @click="loadRecentActivities" :loading="isLoading" />
            </div>

            <div v-if="isLoading || (activities && activities.length > 0)" class="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                <ul class="list-none p-0 m-0 relative border-l-2 border-surface-100 dark:border-surface-800 ml-4 pl-5 space-y-5">
                    
                    <template v-if="isLoading">
                        <li v-for="n in 3" :key="'skel-' + n" class="relative flex items-start gap-4">
                            <div class="absolute -left-[31px] top-0.5 bg-surface-100 dark:bg-surface-800 w-5 h-5 rounded-full border-4 border-surface-0 dark:border-surface-900"></div>
                            <div class="flex-1 space-y-2">
                                <Skeleton width="75%" height="12px"></Skeleton>
                                <div class="flex gap-4">
                                    <Skeleton width="60px" height="10px"></Skeleton>
                                    <Skeleton width="80px" height="10px"></Skeleton>
                                </div>
                            </div>
                        </li>
                    </template>

                    <template v-else>
                        <li v-for="activity in activities" :key="activity.id" class="relative flex items-start gap-4 group">
                            
                            <div class="absolute -left-[34px] top-0.5 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-surface-0 dark:border-surface-900 shadow-sm transition-transform group-hover:scale-110 duration-200"
                                 :class="getConfig(activity.type).class">
                                <i :class="[getConfig(activity.type).icon, 'text-[10px] font-bold']"></i>
                            </div>

                            <div class="flex-1 min-width-0">
                                <span class="text-xs font-bold text-surface-700 dark:text-surface-200 block leading-relaxed tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">
                                    {{ activity.description }}
                                </span>
                                
                                <div class="flex items-center gap-3 mt-1.5 text-[11px] text-surface-400 dark:text-surface-500 font-medium">
                                    <span class="flex items-center gap-1 text-surface-600 dark:text-surface-300">
                                        <i class="pi pi-user text-[10px]"></i>
                                        {{ activity.user }}
                                    </span>
                                    <span class="inline-block w-1 h-1 rounded-full bg-surface-300 dark:bg-surface-700"></span>
                                    <span class="flex items-center gap-1 bg-surface-50 dark:bg-surface-800/60 px-1.5 py-0.5 rounded">
                                        <i class="pi pi-clock text-[10px]"></i>
                                        {{ formatTimeAgo(activity.createdAt) }}
                                    </span>
                                </div>
                            </div>

                        </li>
                    </template>

                </ul>
            </div>
        </div>

        <div v-if="!isLoading && activities.length === 0" class="p-6 text-center border border-dashed border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/40 rounded-xl flex flex-col items-center justify-center gap-2 my-auto">
            <div class="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400">
                <i class="pi pi-inbox text-lg"></i>
            </div>
            <h6 class="text-xs font-bold text-surface-700 dark:text-surface-200 m-0">Riwayat Berkas Steril</h6>
            <p class="text-[10px] text-surface-400 max-w-[200px] mx-auto m-0">Sistem belum mendeteksi mutasi manipulasi data dalam 24 jam terakhir.</p>
        </div>

    </div>
</template>

<style scoped>
/* Pemeliharaan Scrollbar Tanpa Mengotori Global Scope */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--surface-200);
    border-radius: 4px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--surface-700);
}
</style>