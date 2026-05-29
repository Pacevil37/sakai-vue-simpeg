<template>
    <div class="pending-grid">
        <!-- Penilaian Kinerja Pending -->
        <div class="pending-card pending-card--kinerja">
            <div class="pending-card-header">
                <div class="pending-card-icon">
                    <i class="pi pi-star"></i>
                </div>
                <h3 class="pending-card-title">Penilaian Kinerja (Pending)</h3>
                <Button
                    icon="pi pi-refresh"
                    severity="secondary"
                    rounded
                    text
                    size="small"
                    @click="loadPendingData"
                    :loading="loading"
                    class="pending-refresh-btn"
                />
            </div>
            <div class="pending-table-wrap">
                <DataTable :value="pendingKinerja" class="pending-datatable" responsiveLayout="scroll">
                    <Column field="nip" header="NIP" class="font-medium"></Column>
                    <Column field="nama" header="Nama"></Column>
                    <Column field="tahun" header="Tahun" style="width: 80px"></Column>
                    <Column header="Status" style="width: 100px">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.status?.toUpperCase() || 'PENDING'" severity="warning" class="pending-tag" />
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div v-if="!loading && pendingKinerja.length === 0" class="pending-empty">
                <i class="pi pi-check-circle"></i>
                Tidak ada penilaian kinerja pending
            </div>
        </div>

        <!-- Mutasi Pegawai (terbaru) -->
        <div class="pending-card pending-card--mutasi">
            <div class="pending-card-header">
                <div class="pending-card-icon pending-card-icon--info">
                    <i class="pi pi-directions"></i>
                </div>
                <h3 class="pending-card-title">Mutasi Pegawai (Terbaru)</h3>
                <Button
                    icon="pi pi-refresh"
                    severity="secondary"
                    rounded
                    text
                    size="small"
                    @click="loadPendingData"
                    :loading="loading"
                    class="pending-refresh-btn"
                />
            </div>
            <div class="pending-table-wrap">
                <DataTable :value="pendingMutasi" class="pending-datatable" responsiveLayout="scroll">
                    <Column field="nip" header="NIP" class="font-medium"></Column>
                    <Column field="nama" header="Nama"></Column>
                    <Column field="ke_unit" header="Tujuan"></Column>
                    <Column field="tanggal_mutasi" header="Tanggal" style="width: 120px"></Column>
                </DataTable>
            </div>
            <div v-if="!loading && pendingMutasi.length === 0" class="pending-empty">
                <i class="pi pi-check-circle"></i>
                Tidak ada data mutasi
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';

const toast = useToast();
const loading = ref(false);
const pendingKinerja = ref([]);
const pendingMutasi = ref([]);

// Ambil data penilaian kinerja dengan status pending
const fetchPendingKinerja = async () => {
    try {
        const { data, error } = await supabase
            .from('penilaian_kinerja')
            .select(`
                id,
                tahun,
                nilai,
                status,
                pegawai_id,
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
            nilai: item.nilai,
            status: item.status
        }));
    } catch (err) {
        console.error('Error fetching pending kinerja:', err);
        return [];
    }
};

// Ambil data mutasi terbaru (tidak ada filter status, karena tidak ada kolom status)
const fetchLatestMutasi = async () => {
    try {
        const { data, error } = await supabase
            .from('mutasi')
            .select(`
                id,
                dari_unit,
                ke_unit,
                tanggal_mutasi,
                pegawai_id,
                pegawai:nip, nama_lengkap
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        return (data || []).map(item => ({
            nip: item.pegawai?.nip || '-',
            nama: item.pegawai?.nama_lengkap || 'Tidak diketahui',
            ke_unit: item.ke_unit,
            tanggal_mutasi: item.tanggal_mutasi
        }));
    } catch (err) {
        console.error('Error fetching mutasi:', err);
        return [];
    }
};

const loadPendingData = async () => {
    loading.value = true;
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
            summary: 'Gagal',
            detail: 'Tidak dapat memuat data pending',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadPendingData();
});
</script>

<style scoped>
/* Salin semua style dari kode asli Anda (tidak perlu diubah) */
.pending-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}
@media (min-width: 992px) {
    .pending-grid {
        grid-template-columns: 1fr 1fr;
    }
}
.pending-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}
.pending-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}
.pending-card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
}
.pending-card-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    background: rgba(251, 191, 36, 0.15);
    color: #b45309;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.pending-card-icon i {
    font-size: 1.2rem;
}
.pending-card-icon--info {
    background: rgba(59, 130, 246, 0.15);
    color: #2563eb;
}
.pending-card-title {
    flex: 1;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0;
    min-width: 0;
}
.pending-refresh-btn {
    opacity: 0.85;
}
.pending-table-wrap {
    overflow-x: auto;
    border-radius: 0.75rem;
    border: 1px solid var(--surface-border);
}
.pending-empty {
    margin-top: 1rem;
    padding: 1.25rem;
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    font-style: italic;
    background: var(--surface-ground);
    border-radius: 0.75rem;
    border: 1px dashed var(--surface-border);
}
.pending-empty i {
    display: block;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    opacity: 0.6;
}
:deep(.pending-datatable) {
    font-size: 0.875rem;
}
:deep(.pending-datatable .p-datatable-thead > tr > th) {
    background: var(--surface-50);
    font-weight: 700;
    color: var(--text-color);
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--surface-border);
}
:deep(.pending-datatable .p-datatable-tbody > tr > td) {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--surface-border);
}
:deep(.pending-datatable .p-datatable-tbody > tr:last-child > td) {
    border-bottom: none;
}
:deep(.pending-datatable .p-datatable-tbody > tr:hover) {
    background: var(--surface-50);
}
.pending-tag {
    font-size: 0.7rem;
    font-weight: 700;
}
</style>