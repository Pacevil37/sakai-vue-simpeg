<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';

const toast = useToast();
const isLoading = ref(false);
const pendingKinerja = ref([]);
const pendingMutasi = ref([]);

// Penyelarasan Properti Passthrough (pt) untuk Tabel Modern Tanpa CSS Kustom
const tablePassthrough = {
    root: { class: 'text-xs' },
    thead: { class: 'bg-surface-50 dark:bg-surface-800/50 text-surface-700 dark:text-surface-300 font-bold border-b border-surface-200 dark:border-surface-700' },
    headerCell: { class: 'p-3 text-[11px] uppercase tracking-wider font-extrabold border-b border-surface-200 dark:border-surface-700' },
    bodyRow: { class: 'hover:bg-surface-50/80 dark:hover:bg-surface-800/40 transition-colors duration-150' },
    rowCell: { class: 'p-3 border-b border-surface-100 dark:border-surface-800 text-surface-600 dark:text-surface-400 font-medium' }
};

const fetchPendingKinerja = async () => {
    try {
        const { data, error } = await supabase
            .from('penilaian_kinerja')
            .select(`
                id, tahun, nilai, status,
                pegawai:nip, nama_lengkap
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;
        return (data || []).map(item => ({
            nip: item.pegawai?.nip || '-',
            nama: item.pegawai?.nama_lengkap || 'Tidak diketahui',
            tahun: item.tahun,
            status: item.status
        }));
    } catch (err) {
        console.error('Error fetching pending kinerja:', err);
        return [];
    }
};

const fetchLatestMutasi = async () => {
    try {
        const { data, error } = await supabase
            .from('mutasi')
            .select(`
                id, ke_unit, tanggal_mutasi,
                pegawai:nip, nama_lengkap
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;
        return (data || []).map(item => ({
            nip: item.pegawai?.nip || '-',
            nama: item.pegawai?.nama_lengkap || 'Tidak diketahui',
            ke_unit: item.ke_unit,
            tanggal_mutasi: item.tanggal_mutasi ? new Date(item.tanggal_mutasi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'
        }));
    } catch (err) {
        console.error('Error fetching mutasi:', err);
        return [];
    }
};

const loadPendingData = async () => {
    isLoading.value = true;
    try {
        const [kinerja, mutasi] = await Promise.all([
            fetchPendingKinerja(),
            fetchLatestMutasi()
        ]);
        pendingKinerja.value = kinerja;
        pendingMutasi.value = mutasi;
    } catch (error) {
        console.warn('Error loading pending data:', error);
        toast.add({
            severity: 'error',
            summary: 'Sinkronisasi Gagal',
            detail: 'Gagal memuat log mutasi & kinerja terbaru.',
            life: 4000
        });
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadPendingData();
});
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full transition-all duration-300">
        
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between gap-4 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <i class="pi pi-star-fill text-sm"></i>
                        </div>
                        <h3 class="text-sm font-black text-surface-800 dark:text-surface-100 m-0 tracking-tight">Persetujuan Kinerja</h3>
                    </div>
                    <Button icon="pi pi-refresh" severity="secondary" rounded text size="small" @click="loadPendingData" :loading="isLoading" />
                </div>

                <div class="border border-surface-100 dark:border-surface-800 rounded-xl overflow-hidden bg-surface-0 dark:bg-surface-950">
                    <DataTable :value="isLoading ? Array(3).fill({}) : pendingKinerja" :pt="tablePassthrough" responsiveLayout="scroll">
                        <Column field="nip" header="NIP" class="w-[110px]">
                            <template #body="slotProps">
                                <Skeleton v-if="isLoading" width="80px" height="12px"></Skeleton>
                                <span v-else class="font-bold font-mono text-surface-900 dark:text-surface-200">{{ slotProps.data.nip }}</span>
                            </template>
                        </Column>
                        <Column field="nama" header="Nama Pegawai">
                            <template #body="slotProps">
                                <Skeleton v-if="isLoading" width="130px" height="12px"></Skeleton>
                                <span v-else class="truncate block max-w-[140px]" :title="slotProps.data.nama">{{ slotProps.data.nama }}</span>
                            </template>
                        </Column>
                        <Column field="tahun" header="Tahun" class="w-[70px] text-center">
                            <template #body="slotProps">
                                <Skeleton v-if="isLoading" width="35px" height="12px" class="mx-auto"></Skeleton>
                                <span v-else>{{ slotProps.data.tahun }}</span>
                            </template>
                        </Column>
                        <Column header="Status" class="w-[90px] text-right">
                            <template #body="slotProps">
                                <Skeleton v-if="isLoading" width="50px" height="18px" class="ml-auto"></Skeleton>
                                <Tag v-else :value="slotProps.data.status?.toUpperCase()" severity="warn" class="text-[9px] font-black tracking-wider px-2 py-0.5" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <div v-if="!isLoading && pendingKinerja.length === 0" class="mt-4 p-4 text-center border border-dashed border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/30 rounded-xl flex flex-col items-center justify-center gap-1.5">
                <i class="pi pi-check-circle text-emerald-500 text-lg"></i>
                <span class="text-xs font-bold text-surface-700 dark:text-surface-300">Semua Berkas Bersih</span>
                <p class="text-[10px] text-surface-400 m-0">Tidak ada antrean peninjauan kinerja berkas saat ini.</p>
            </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between gap-4 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <i class="pi pi-directions-alt text-sm"></i>
                        </div>
                        <h3 class="text-sm font-black text-surface-800 dark:text-surface-100 m-0 tracking-tight">Mutasi Instansi Terbaru</h3>
                    </div>
                    <Button icon="pi pi-refresh" severity="secondary" rounded text size="small" @click="loadPendingData" :loading="isLoading" />
                </div>

                <div class="border border-surface-100 dark:border-surface-800 rounded-xl overflow-hidden bg-surface-0 dark:bg-surface-950">
                    <DataTable :value="isLoading ? Array(3).fill({}) : pendingMutasi" :pt="tablePassthrough" responsiveLayout="scroll">
                        <Column field="nip" header="NIP" class="w-[110px]">
                            <template #body="slotProps">
                                <Skeleton v-if="isLoading" width="80px" height="12px"></Skeleton>
                                <span v-else class="font-bold font-mono text-surface-900 dark:text-surface-200">{{ slotProps.data.nip }}</span>
                            </template>
                        </Column>
                        <Column field="nama" header="Nama">
                            <template #body="slotProps">
                                <Skeleton v-if="isLoading" width="120px" height="12px"></Skeleton>
                                <span v-else class="truncate block max-w-[130px]" :title="slotProps.data.nama">{{ slotProps.data.nama }}</span>
                            </template>
                        </Column>
                        <Column field="ke_unit" header="Unit Tujuan">
                            <template #body="slotProps">
                                <Skeleton v-if="isLoading" width="90px" height="12px"></Skeleton>
                                <span v-else class="truncate block max-w-[110px] text-emerald-600 dark:text-emerald-400 font-semibold" :title="slotProps.data.ke_unit">{{ slotProps.data.ke_unit }}</span>
                            </template>
                        </Column>
                        <Column field="tanggal_mutasi" header="Tanggal" class="w-[80px] text-right">
                            <template #body="slotProps">
                                <Skeleton v-if="isLoading" width="45px" height="12px" class="ml-auto"></Skeleton>
                                <span v-else class="text-surface-400 font-bold text-[11px]">{{ slotProps.data.tanggal_mutasi }}</span>
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <div v-if="!isLoading && pendingMutasi.length === 0" class="mt-4 p-4 text-center border border-dashed border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/30 rounded-xl flex flex-col items-center justify-center gap-1.5">
                <i class="pi pi-folder-open text-surface-400 text-lg"></i>
                <span class="text-xs font-bold text-surface-700 dark:text-surface-300">Log Mutasi Kosong</span>
                <p class="text-[10px] text-surface-400 m-0">Belum ada pergerakan rotasi struktur dinas pegawai.</p>
            </div>
        </div>

    </div>
</template>