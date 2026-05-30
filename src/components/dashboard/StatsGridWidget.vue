<script setup>
import { onMounted, ref } from 'vue';
import Skeleton from 'primevue/skeleton';

const isLoading = ref(false);

// Penampung Objek Matriks Utama (Satu Sumber Data untuk Seluruh Kartu)
const statsMetrics = ref([
    {
        id: 'orders',
        title: 'Total Pesanan',
        value: 152,
        isCurrency: false,
        icon: 'pi pi-shopping-cart',
        iconClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        trendValue: '24 Baru',
        trendLabel: 'sejak kunjungan terakhir',
        isPositive: true
    },
    {
        id: 'revenue',
        title: 'Total Omzet',
        value: 2100000, // Diubah ke format angka murni (Rp 2.100.000)
        isCurrency: true,
        icon: 'pi pi-wallet',
        iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        trendValue: '+52%',
        trendLabel: 'dari minggu lalu',
        isPositive: true
    },
    {
        id: 'customers',
        title: 'Mitra Aktif',
        value: 28441,
        isCurrency: false,
        icon: 'pi pi-users',
        iconClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        trendValue: '+520',
        trendLabel: 'teregistrasi baru',
        isPositive: true
    },
    {
        id: 'comments',
        title: 'Umpan Balik',
        value: 152,
        isCurrency: false,
        labelSuffix: ' Belum Dibaca',
        icon: 'pi pi-comments',
        iconClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        trendValue: '85',
        trendLabel: 'telah direspons',
        isPositive: false // Menggunakan warna netral/peringatan
    }
]);

// Fungsi Pemformat Finansial & Numerik Otomatis
const formatDisplay = (metric) => {
    if (metric.isCurrency) {
        return metric.value.toLocaleString('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
    }
    
    const output = metric.value.toLocaleString('id-ID');
    return metric.labelSuffix ? `${output}${metric.labelSuffix}` : output;
};

// Simulasi siklus pemuatan data dari API
const fakeFetchData = () => {
    isLoading.value = true;
    setTimeout(() => {
        isLoading.value = false;
    }, 800);
};

onMounted(() => {
    fakeFetchData();
});
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        
        <div 
            v-for="item in statsMetrics" 
            :key="item.id"
            class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
            <div class="flex justify-between items-start mb-4">
                <div class="space-y-1.5 flex-1 min-w-0">
                    <span class="block text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider">
                        {{ item.title }}
                    </span>
                    
                    <div v-if="isLoading">
                        <Skeleton width="60%" height="1.75rem" class="my-1"></Skeleton>
                    </div>
                    <div v-else class="text-xl font-black text-surface-900 dark:text-surface-50 font-mono truncate">
                        {{ formatDisplay(item) }}
                    </div>
                </div>

                <div 
                    class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200"
                    :class="item.iconClass"
                >
                    <i :class="[item.icon, 'text-sm font-bold']"></i>
                </div>
            </div>

            <div class="flex items-center flex-wrap gap-1 text-xs">
                <template v-if="isLoading">
                    <Skeleton width="85%" height="12px"></Skeleton>
                </template>
                <template v-else>
                    <span 
                        class="font-extrabold px-1.5 py-0.5 rounded text-[11px]"
                        :class="item.isPositive 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'"
                    >
                        {{ item.trendValue }}
                    </span>
                    <span class="text-surface-400 dark:text-surface-500 font-medium pl-0.5">
                        {{ item.trendLabel }}
                    </span>
                </template>
            </div>
        </div>

    </div>
</template>