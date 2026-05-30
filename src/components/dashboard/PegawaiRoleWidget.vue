<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Skeleton from 'primevue/skeleton';

const unitStats = ref([]);
const jabatanStats = ref([]);
const isLoading = ref(false);
const errorMessage = ref(null);
const activeTab = ref('unit');

const totalEmployeesUnit = computed(() => unitStats.value.reduce((acc, curr) => acc + curr.count, 0));
const totalEmployeesJabatan = computed(() => jabatanStats.value.reduce((acc, curr) => acc + curr.count, 0));
const currentStats = computed(() => activeTab.value === 'unit' ? unitStats.value : jabatanStats.value);
const currentTotal = computed(() => activeTab.value === 'unit' ? totalEmployeesUnit.value : totalEmployeesJabatan.value);

// Token Warna Adaptif Premium (Menghilangkan Hardcoded CSS Lama)
const themeList = [
    { cardBg: 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20', iconBg: 'bg-blue-500 text-white', text: 'text-blue-600 dark:text-blue-400', progressBg: 'bg-blue-500' },
    { cardBg: 'bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/20', iconBg: 'bg-purple-500 text-white', text: 'text-purple-600 dark:text-purple-400', progressBg: 'bg-purple-500' },
    { cardBg: 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20', iconBg: 'bg-emerald-500 text-white', text: 'text-emerald-600 dark:text-emerald-400', progressBg: 'bg-emerald-500' },
    { cardBg: 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20', iconBg: 'bg-amber-500 text-white', text: 'text-amber-600 dark:text-amber-400', progressBg: 'bg-amber-500' },
    { cardBg: 'bg-pink-500/5 dark:bg-pink-500/10 border-pink-500/20', iconBg: 'bg-pink-500 text-white', text: 'text-pink-600 dark:text-pink-400', progressBg: 'bg-pink-500' },
    { cardBg: 'bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/20', iconBg: 'bg-indigo-500 text-white', text: 'text-indigo-600 dark:text-indigo-400', progressBg: 'bg-indigo-500' },
    { cardBg: 'bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-500/20', iconBg: 'bg-cyan-500 text-white', text: 'text-cyan-600 dark:text-cyan-400', progressBg: 'bg-cyan-500' }
];

const getTheme = (index) => themeList[index % themeList.length];
const calculatePercentage = (count) => (currentTotal.value === 0 ? 0 : Math.round((count / currentTotal.value) * 100));

const fetchUnitStats = async () => {
    try {
        const { data: pegawai, error: errPegawai } = await supabase
            .from('pegawai')
            .select('unit_kerja_id')
            .not('unit_kerja_id', 'is', null);
        if (errPegawai) throw errPegawai;
        if (!pegawai.length) return [];

        const unitIds = [...new Set(pegawai.map(p => p.unit_kerja_id))];
        const { data: units, error: errUnits } = await supabase
            .from('units')
            .select('id, name')
            .in('id', unitIds);
        if (errUnits) throw errUnits;

        const unitMap = Object.fromEntries(units.map(u => [u.id, u.name]));
        const counts = {};
        pegawai.forEach(p => {
            const name = unitMap[p.unit_kerja_id] || 'Unit Tidak Dikenal';
            counts[name] = (counts[name] || 0) + 1;
        });

        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    } catch (err) {
        console.error('Error fetching unit stats:', err);
        throw err;
    }
};

const fetchJabatanStats = async () => {
    try {
        const { data, error } = await supabase
            .from('pegawai')
            .select('jabatan')
            .not('jabatan', 'is', null);
        if (error) throw error;

        const counts = {};
        data.forEach(p => {
            const jab = p.jabatan;
            counts[jab] = (counts[jab] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    } catch (err) {
        console.error('Error fetching jabatan stats:', err);
        throw err;
    }
};

const loadStats = async () => {
    isLoading.value = true;
    errorMessage.value = null;
    try {
        const [unit, jabatan] = await Promise.all([fetchUnitStats(), fetchJabatanStats()]);
        unitStats.value = unit;
        jabatanStats.value = jabatan;
    } catch (err) {
        errorMessage.value = 'Gagal mengambil data real-time. Menampilkan data fallback sistem.';
        unitStats.value = [
            { name: 'Sekretariat Utama', count: 45 },
            { name: 'Pendidikan Islam', count: 82 },
            { name: 'Haji & Umrah', count: 28 },
            { name: 'Bimas Islam', count: 56 }
        ];
        jabatanStats.value = [
            { name: 'Fungsional Guru', count: 120 },
            { name: 'Penyuluh Keagamaan', count: 45 },
            { name: 'Pranata Komputer AI', count: 15 },
            { name: 'Analisis Kepegawaian', count: 25 }
        ];
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadStats();
});
</script>

<template>
    <div class="w-full transition-all duration-300">
        
        <div class="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div class="flex items-center bg-surface-100 dark:bg-surface-800/60 p-1 rounded-xl gap-1">
                <button 
                    type="button" 
                    @click="activeTab = 'unit'"
                    class="px-4 py-1.5 border-none rounded-lg text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer"
                    :class="activeTab === 'unit' 
                        ? 'bg-surface-0 text-emerald-600 dark:bg-surface-900 dark:text-emerald-400 shadow-sm' 
                        : 'bg-transparent text-surface-500 dark:text-surface-400 hover:text-surface-800'"
                >
                    UNIT KERJA
                </button>
                <button 
                    type="button" 
                    @click="activeTab = 'jabatan'"
                    class="px-4 py-1.5 border-none rounded-lg text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer"
                    :class="activeTab === 'jabatan' 
                        ? 'bg-surface-0 text-emerald-600 dark:bg-surface-900 dark:text-emerald-400 shadow-sm' 
                        : 'bg-transparent text-surface-500 dark:text-surface-400 hover:text-surface-800'"
                >
                    STRUKTUR JABATAN
                </button>
            </div>
            
            <Button icon="pi pi-refresh" severity="secondary" rounded text size="small" @click="loadStats" :loading="isLoading" />
        </div>

        <Message v-if="errorMessage" severity="warn" :closable="false" class="mb-4 text-xs">{{ errorMessage }}</Message>

        <div v-if="currentStats.length > 0 && !isLoading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4">
            <div 
                v-for="(item, index) in currentStats" 
                :key="index" 
                class="group relative overflow-hidden border rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                :class="getTheme(index).cardBg"
            >
                <div class="absolute -right-6 -top-6 w-16 h-16 bg-current opacity-[0.03] rounded-full pointer-events-none"></div>

                <div class="relative z-10 flex flex-col justify-between h-full gap-4">
                    <div class="flex items-start justify-between w-full">
                        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-sm" :class="getTheme(index).iconBg">
                            <i :class="activeTab === 'unit' ? 'pi pi-building' : 'pi pi-briefcase'"></i>
                        </div>
                        <div class="text-right">
                            <span class="block text-xl font-black text-surface-900 dark:text-white tracking-tight leading-none">{{ item.count }}</span>
                            <span class="text-[9px] font-extrabold uppercase tracking-widest text-surface-400 mt-1 block">Aparatur</span>
                        </div>
                    </div>

                    <div class="min-h-[2.5rem] flex items-center">
                        <h4 class="text-xs font-extrabold text-surface-800 dark:text-surface-100 m-0 line-clamp-2 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" :title="item.name">
                            {{ item.name }}
                        </h4>
                    </div>

                    <div class="w-full pt-1">
                        <div class="flex items-center justify-between text-[10px] font-bold text-surface-400 mb-1.5">
                            <span>Distribusi Proporsi</span>
                            <span :class="getTheme(index).text" class="font-black">{{ calculatePercentage(item.count) }}%</span>
                        </div>
                        <div class="h-1.5 w-full bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                            <div 
                                class="h-full rounded-full transition-all duration-700 ease-out" 
                                :class="getTheme(index).progressBg"
                                :style="{ width: calculatePercentage(item.count) + '%' }"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="i in 4" :key="i" class="border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 rounded-2xl p-4 flex flex-col gap-4">
                <div class="flex justify-between items-center">
                    <Skeleton shape="circle" size="2.5rem"></Skeleton>
                    <Skeleton width="40px" height="1.25rem"></Skeleton>
                </div>
                <Skeleton width="75%" height="1rem" class="mt-2"></Skeleton>
                <div class="space-y-1 mt-2">
                    <Skeleton width="100%" height="6px"></Skeleton>
                </div>
            </div>
        </div>

        <div v-else class="text-center py-12 border border-dashed border-surface-200 dark:border-surface-800 rounded-2xl flex flex-col items-center justify-center p-6">
            <div class="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center text-surface-400 mb-3">
                <i class="pi pi-inbox text-xl"></i>
            </div>
            <h4 class="text-xs font-bold text-surface-900 dark:text-white m-0">Data Sektoral Belum Terbaca</h4>
            <p class="text-[11px] text-surface-400 max-w-xs m-0 mt-1">Struktur statistik penempatan dinas akan terisi otomatis setelah pembaruan data master.</p>
        </div>

    </div>
</template>