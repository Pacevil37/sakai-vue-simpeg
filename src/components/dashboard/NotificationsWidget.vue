<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import Skeleton from 'primevue/skeleton';

const pendingCuti = ref([]);
const isLoading = ref(false);
const menu = ref(null);

const menuItems = ref([
    { label: 'Segarkan', icon: 'pi pi-refresh', command: () => fetchNotifications() },
    { label: 'Kelola Semua', icon: 'pi pi-arrow-right', to: '/cuti' }
]);

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fetchNotifications = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await supabase
            .from('cuti')
            .select('id, jenis_cuti, tanggal_mulai, status, pegawai(nama)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (error) throw error;
        pendingCuti.value = data || [];
    } catch (err) {
        console.error('Gagal mengambil notifikasi:', err);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchNotifications();
});
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm transition-all duration-300">
        
        <div class="flex items-center justify-between mb-6 pb-3 border-b border-surface-100 dark:border-surface-800">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <i class="pi pi-bell"></i>
                </div>
                <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 m-0">Notifikasi Permohonan Cuti</h3>
            </div>
            <div class="relative">
                <Button icon="pi pi-ellipsis-v" severity="secondary" text rounded size="small" @click="menu.toggle($event)" aria-haspopup="true" aria-controls="overlay_menu" />
                <Menu ref="menu" id="overlay_menu" :model="menuItems" :popup="true" class="!min-w-40 !border-surface-200 dark:!border-surface-800" />
            </div>
        </div>

        <div v-if="isLoading" class="flex flex-col gap-4">
            <div v-for="i in 3" :key="i" class="flex items-center gap-4 py-1">
                <Skeleton shape="circle" size="3rem" class="shrink-0"></Skeleton>
                <div class="flex-1 space-y-2">
                    <Skeleton width="40%" height="12px"></Skeleton>
                    <Skeleton width="85%" height="10px"></Skeleton>
                </div>
            </div>
        </div>

        <div v-else-if="pendingCuti.length === 0" class="text-center py-8 opacity-40 flex flex-col items-center justify-center">
            <i class="pi pi-inbox text-3xl mb-2 block"></i>
            <p class="text-xs font-medium m-0">Seluruh berkas permohonan telah bersih diproses</p>
        </div>

        <div v-else class="flex flex-col gap-4">
            <span class="text-[10px] font-black uppercase tracking-widest text-surface-400 block mb-1">Antrean Masuk Hari Ini</span>
            
            <ul class="p-0 m-0 list-none divide-y divide-surface-100 dark:divide-surface-800/60">
                <li v-for="cuti in pendingCuti" :key="cuti.id" class="flex items-start sm:items-center py-4 first:pt-0 last:pb-0 group transition-all">
                    <div class="w-10 h-10 flex items-center justify-center bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 rounded-xl mr-4 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <i class="pi pi-file text-sm"></i>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <p class="text-sm m-0 text-surface-700 dark:text-surface-200 leading-normal">
                            <span class="font-extrabold text-surface-900 dark:text-white">{{ cuti.pegawai?.nama || 'Aparatur Negara' }}</span> 
                            mengajukan permohonan 
                            <span class="px-2 py-0.5 rounded-md text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">{{ cuti.jenis_cuti }}</span>
                        </p>
                        <span class="flex items-center gap-1.5 text-[11px] text-surface-400 mt-1.5 font-medium">
                            <i class="pi pi-calendar-plus text-[10px]"></i>
                            Mulai Tanggal: {{ formatDate(cuti.tanggal_mulai) }}
                        </span>
                    </div>
                </li>
            </ul>
        </div>
        
    </div>
</template>