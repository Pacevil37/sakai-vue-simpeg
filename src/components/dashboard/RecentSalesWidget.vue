<script setup>
import { onMounted, ref } from 'vue';
import { ProductService } from '@/service/ProductService';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';

// Mengubah nilai awal ke array kosong demi keamanan iterasi
const products = ref([]);
const isLoading = ref(false);

// PERBAIKAN 1: Lokalisasi Finansial ke Rupiah (IDR)
const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'Rp 0';
    return value.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

// PERBAIKAN 2: Penanganan Gambar Rusak (Image Fallback Handler)
const onImageError = (event) => {
    event.target.src = 'https://primefaces.org/cdn/primevue/images/product/placeholder.svg';
};

const loadProducts = async () => {
    isLoading.value = true;
    try {
        const data = await ProductService.getProductsSmall();
        products.value = data || [];
    } catch (error) {
        console.error('Gagal memuat data produk penjualan:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadProducts();
});

// Konfigurasi Desain Passthrough (pt) untuk Tabel Penjualan Modern
const tablePassthrough = {
    root: { class: 'text-xs' },
    thead: { class: 'bg-surface-50 dark:bg-surface-800/60 text-surface-700 dark:text-surface-300 border-b border-surface-200 dark:border-surface-700' },
    headerCell: { class: 'p-3.5 text-[11px] uppercase tracking-wider font-extrabold text-left' },
    bodyRow: { class: 'hover:bg-surface-50/80 dark:hover:bg-surface-800/30 transition-colors duration-150' },
    rowCell: { class: 'p-3 border-b border-surface-100 dark:border-surface-800 vertical-align-middle' },
    paginator: {
        root: { class: 'bg-transparent border-t border-surface-100 dark:border-surface-800 p-2 text-xs' }
    }
};
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm transition-all duration-300 w-full">
        
        <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                <h3 class="text-sm font-black text-surface-800 dark:text-surface-100 m-0 tracking-tight">Transaksi Penjualan Terbaru</h3>
            </div>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400">
                Live Data
            </span>
        </div>

        <div class="border border-surface-100 dark:border-surface-800 rounded-xl overflow-hidden bg-surface-0 dark:bg-surface-950">
            <DataTable 
                :value="isLoading ? Array(5).fill({}) : products" 
                :rows="5" 
                :paginator="!isLoading && products.length > 0" 
                :pt="tablePassthrough"
                responsiveLayout="scroll"
            >
                <Column header="Produk" class="w-[80px] text-center">
                    <template #body="slotProps">
                        <div v-if="isLoading" class="flex justify-center">
                            <Skeleton shape="circle" size="2.5rem"></Skeleton>
                        </div>
                        <div v-else class="flex justify-center">
                            <img 
                                :src="`https://primefaces.org/cdn/primevue/images/product/${slotProps.data.image}`" 
                                :alt="slotProps.data.name" 
                                @error="onImageError"
                                class="w-10 h-10 object-cover rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm transition-transform hover:scale-105 duration-200" 
                            />
                        </div>
                    </template>
                </Column>

                <Column field="name" header="Nama Komoditas" :sortable="true">
                    <template #body="slotProps">
                        <Skeleton v-if="isLoading" width="80%" height="12px"></Skeleton>
                        <span v-else class="font-bold text-surface-900 dark:text-surface-100 block truncate max-w-[180px]" :title="slotProps.data.name">
                            {{ slotProps.data.name }}
                        </span>
                    </template>
                </Column>

                <Column field="price" header="Nilai Kontrak" :sortable="true" class="w-[140px]">
                    <template #body="slotProps">
                        <Skeleton v-if="isLoading" width="60%" height="12px"></Skeleton>
                        <span v-else class="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                            {{ formatCurrency(slotProps.data.price) }}
                        </span>
                    </template>
                </Column>

                <Column header="Aksi" class="w-[70px] text-center">
                    <template #body>
                        <Skeleton v-if="isLoading" shape="circle" size="1.75rem" class="mx-auto"></Skeleton>
                        <Button 
                            v-else
                            icon="pi pi-search" 
                            severity="secondary"
                            rounded 
                            text 
                            size="small"
                            class="hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150"
                        />
                    </template>
                </Column>
            </DataTable>
        </div>

        <div v-if="!isLoading && products.length === 0" class="mt-4 p-6 text-center border border-dashed border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950/20 rounded-xl flex flex-col items-center justify-center gap-1.5">
            <i class="pi pi-receipt text-surface-400 text-xl"></i>
            <span class="text-xs font-bold text-surface-700 dark:text-surface-200">Buku Kas Bersih</span>
            <p class="text-[10px] text-surface-400 m-0">Belum ada nota penjualan atau transaksi yang tercatat hari ini.</p>
        </div>

    </div>
</template>