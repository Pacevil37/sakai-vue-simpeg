<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';

const stats = ref({
    total_pegawai: 0,
    cuti_pending: 0,
    cuti_setuju: 0,
    golongan_iv: 0
});

const isLoading = ref(true);

const fetchStats = async () => {
    try {
        isLoading.value = true;
        
        const { count: total_pegawai } = await supabase
            .from('pegawai')
            .select('*', { count: 'exact', head: true });
            
        const { count: cuti_pending } = await supabase
            .from('cuti')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
            
        const { count: cuti_setuju } = await supabase
            .from('cuti')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'disetujui');
            
        const { count: golongan_iv } = await supabase
            .from('pegawai')
            .select('*', { count: 'exact', head: true })
            .ilike('golongan', 'IV%');

        stats.value = {
            total_pegawai: total_pegawai || 0,
            cuti_pending: cuti_pending || 0,
            cuti_setuju: cuti_setuju || 0,
            golongan_iv: golongan_iv || 0,
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchStats();
});
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all duration-300">
            <div class="space-y-1">
                <span class="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider block">Total Pegawai</span>
                <h3 v-if="!isLoading" class="text-3xl font-black text-surface-900 dark:text-white m-0 tracking-tight">
                    {{ stats.total_pegawai }}
                </h3>
                <div v-else class="w-16 h-8 bg-surface-100 dark:bg-surface-800 animate-pulse rounded-lg mt-1"></div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-sm">
                <i class="pi pi-users"></i>
            </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all duration-300">
            <div class="space-y-1">
                <span class="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider block">Cuti Pending</span>
                <h3 v-if="!isLoading" class="text-3xl font-black text-amber-600 dark:text-amber-400 m-0 tracking-tight">
                    {{ stats.cuti_pending }}
                </h3>
                <div v-else class="w-16 h-8 bg-surface-100 dark:bg-surface-800 animate-pulse rounded-lg mt-1"></div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shadow-sm">
                <i class="pi pi-calendar"></i>
            </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all duration-300">
            <div class="space-y-1">
                <span class="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider block">Cuti Disetujui</span>
                <h3 v-if="!isLoading" class="text-3xl font-black text-emerald-600 dark:text-emerald-400 m-0 tracking-tight">
                    {{ stats.cuti_setuju }}
                </h3>
                <div v-else class="w-16 h-8 bg-surface-100 dark:bg-surface-800 animate-pulse rounded-lg mt-1"></div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shadow-sm">
                <i class="pi pi-check-circle"></i>
            </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all duration-300">
            <div class="space-y-1">
                <span class="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider block">Golongan IV</span>
                <h3 v-if="!isLoading" class="text-3xl font-black text-purple-600 dark:text-purple-400 m-0 tracking-tight">
                    {{ stats.golongan_iv }}
                </h3>
                <div v-else class="w-16 h-8 bg-surface-100 dark:bg-surface-800 animate-pulse rounded-lg mt-1"></div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shadow-sm">
                <i class="pi pi-star"></i>
            </div>
        </div>

    </div>
</template>