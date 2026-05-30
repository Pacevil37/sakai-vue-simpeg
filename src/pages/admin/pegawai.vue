<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

// PrimeVue 4 Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import PegawaiFormModal from '@/components/PegawaiFormModal.vue';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

// Reactive States
const pegawai = ref([]);
const loading = ref(false);
const deleting = ref(false);
const deleteDialogVisible = ref(false);
const selectedPegawai = ref(null);
const isEditing = ref(false);
const formModalVisible = ref(false);

const stats = ref({
    total: 0,
    aktif: 0,
    pns: 0,
    cpns: 0
});

// Filters & Pagination Configuration
const filters = reactive({
    search: '',
    unit_kerja: '',
    golongan: '',
});

const pagination = reactive({
    first: 0,
    page: 1,
    limit: 10,
    total: 0,
});

// OPTIMASI 1: Pemanggilan Paralel Data Statistik Melalui Jaringan Tunggal
const fetchStats = async () => {
    try {
        const [resTotal, resAktif, resPns, resCpns] = await Promise.all([
            supabase.from('pegawai').select('*', { count: 'exact', head: true }),
            supabase.from('pegawai').select('*', { count: 'exact', head: true }).eq('status', 'aktif'),
            supabase.from('pegawai').select('*', { count: 'exact', head: true }).eq('status_kepegawaian', 'PNS'),
            supabase.from('pegawai').select('*', { count: 'exact', head: true }).eq('status_kepegawaian', 'CPNS')
        ]);

        stats.value = {
            total: resTotal.count || 0,
            aktif: resAktif.count || 0,
            pns: resPns.count || 0,
            cpns: resCpns.count || 0
        };
    } catch (err) {
        console.error('Gagal memuat statistik aparatur:', err);
    }
};

// Fetch Utama Data Pegawai Berdasarkan Filter & Jangkauan Baris
const fetchPegawai = async () => {
    loading.value = true;
    try {
        let query = supabase
            .from('pegawai')
            .select('*', { count: 'exact' })
            .order('nama', { ascending: true })
            .range((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit - 1);

        if (filters.search) {
            query = query.or(`nip.ilike.%${filters.search}%,nama.ilike.%${filters.search}%,jabatan.ilike.%${filters.search}%`);
        }
        if (filters.unit_kerja) {
            query = query.ilike('unit_kerja', `%${filters.unit_kerja}%`);
        }
        if (filters.golongan) {
            query = query.ilike('golongan', `%${filters.golongan}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;

        pegawai.value = data || [];
        pagination.total = count || 0;
    } catch (err) {
        console.error('Error fetching pegawai:', err);
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Sistem gagal mengunduh data pegawai.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const loadPegawai = () => {
    pagination.page = 1;
    pagination.first = 0;
    fetchPegawai();
    fetchStats();
};

const resetFilters = () => {
    filters.search = '';
    filters.unit_kerja = '';
    filters.golongan = '';
    loadPegawai();
};

const onPageChange = (event) => {
    pagination.first = event.first;
    pagination.page = event.page + 1;
    pagination.limit = event.rows;
    fetchPegawai();
};

// Logika Aksi CRUD Modals
const openCreateModal = () => {
    selectedPegawai.value = null;
    isEditing.value = false;
    formModalVisible.value = true;
};

const editPegawai = (peg) => {
    selectedPegawai.value = { ...peg };
    isEditing.value = true;
    formModalVisible.value = true;
};

const viewDetail = (id) => {
    router.push(`/pegawai/${id}`);
};

const confirmDelete = (peg) => {
    selectedPegawai.value = peg;
    deleteDialogVisible.value = true;
};

const deletePegawai = async () => {
    if (!selectedPegawai.value) return;
    deleting.value = true;
    try {
        const { error } = await supabase.from('pegawai').delete().eq('id', selectedPegawai.value.id);
        if (error) throw error;
        
        toast.add({ severity: 'success', summary: 'Penghapusan Berhasil', detail: 'Rekam data aparatur berhasil dihapus permanently.', life: 3000 });
        loadPegawai();
    } catch (err) {
        console.error(err);
        toast.add({ severity: 'error', summary: 'Eksekusi Gagal', detail: err.message, life: 3000 });
    } finally {
        deleting.value = false;
        deleteDialogVisible.value = false;
        selectedPegawai.value = null;
    }
};

const closeFormModal = () => {
    formModalVisible.value = false;
    selectedPegawai.value = null;
};

const onPegawaiSaved = () => {
    closeFormModal();
    loadPegawai();
};

const exportPegawai = () => {
    toast.add({ severity: 'info', summary: 'Fitur Ekspor', detail: 'Pemrosesan lembar kerja Excel sedang disiapkan.', life: 2000 });
};

onMounted(() => {
    loadPegawai();
});

// Passthrough styling untuk merombak DataTable mengikuti standar Tailwind CSS
const tablePassthrough = {
    thead: { class: 'bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-200 border-b border-surface-200 dark:border-surface-700' },
    headerCell: { class: 'p-4 text-xs uppercase tracking-wider font-extrabold text-left' },
    bodyRow: { class: 'hover:bg-surface-50/50 dark:hover:bg-surface-800/40 transition-colors duration-150' },
    rowCell: { class: 'p-4 border-b border-surface-100 dark:border-surface-800/60 vertical-align-middle text-sm' },
    paginator: { root: { class: 'bg-transparent border-t border-surface-100 dark:border-surface-800 p-3 text-xs' } }
};
</script>

<template>
    <div class="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-6 transition-all duration-300">
        
        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <h1 class="text-xl font-black text-surface-900 dark:text-white m-0 tracking-tight">Pusat Manajemen Pegawai</h1>
                <p class="text-xs font-medium text-surface-500 dark:text-surface-400 m-0 mt-1">Kelola direktori biodata, mutasi golongan, unit kerja, dan hak otentikasi aparatur.</p>
            </div>
            <div class="flex items-center gap-3">
                <Button 
                    v-if="authStore.canViewAllPegawai"
                    label="Ekspor Excel" 
                    icon="pi pi-file-excel" 
                    severity="success" 
                    outlined
                    size="small"
                    class="font-bold rounded-xl"
                    @click="exportPegawai" 
                />
                <Button 
                    v-if="authStore.canCreatePegawai"
                    label="Tambah Aparatur Baru" 
                    icon="pi pi-plus" 
                    severity="emerald" 
                    size="small"
                    class="font-bold rounded-xl shadow-sm bg-emerald-600 border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 text-white"
                    @click="openCreateModal" 
                />
            </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
            <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Kata Kunci</label>
                <div class="relative w-full">
                    <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm"></i>
                    <InputText v-model="filters.search" placeholder="Cari NIP, nama, atau jabatan..." class="w-full pl-10 text-sm rounded-xl" @keyup.enter="loadPegawai" />
                </div>
            </div>
            <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Unit Kerja</label>
                <div class="relative w-full">
                    <i class="pi pi-building absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm"></i>
                    <InputText v-model="filters.unit_kerja" placeholder="Filter divisi / dinas..." class="w-full pl-10 text-sm rounded-xl" @keyup.enter="loadPegawai" />
                </div>
            </div>
            <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Golongan Ruang</label>
                <div class="relative w-full">
                    <i class="pi pi-bookmark absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm"></i>
                    <InputText v-model="filters.golongan" placeholder="Contoh: IV/a, III/b..." class="w-full pl-10 text-sm rounded-xl" @keyup.enter="loadPegawai" />
                </div>
            </div>
            <div class="flex gap-2 inputs-buttons-row">
                <Button label="Saring Data" icon="pi pi-filter" class="flex-1 font-bold rounded-xl text-sm" size="small" @click="loadPegawai" />
                <Button label="Reset" icon="pi pi-refresh" severity="secondary" outlined class="font-bold rounded-xl text-sm" size="small" @click="resetFilters" />
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div class="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">Total Pegawai</span>
                    <div class="text-2xl font-black text-blue-900 dark:text-blue-100 font-mono">{{ stats.total }}</div>
                </div>
                <div class="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center"><i class="pi pi-users text-sm font-bold"></i></div>
            </div>
            <div class="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Status Aktif</span>
                    <div class="text-2xl font-black text-emerald-900 dark:text-emerald-100 font-mono">{{ stats.aktif }}</div>
                </div>
                <div class="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center"><i class="pi pi-check-circle text-sm font-bold"></i></div>
            </div>
            <div class="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <span class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">Aparatur PNS</span>
                    <div class="text-2xl font-black text-amber-900 dark:text-amber-100 font-mono">{{ stats.pns }}</div>
                </div>
                <div class="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center"><i class="pi pi-briefcase text-sm font-bold"></i></div>
            </div>
            <div class="bg-purple-500/5 dark:bg-purple-500/10 border border-purple-200/50 dark:border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                    <span class="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">Pegawai CPNS</span>
                    <div class="text-2xl font-black text-purple-900 dark:text-purple-100 font-mono">{{ stats.cpns }}</div>
                </div>
                <div class="w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center"><i class="pi pi-graduation-cap text-sm font-bold"></i></div>
            </div>
        </div>

        <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden shadow-sm">
            <DataTable
                :value="loading ? Array(pagination.limit).fill({}) : pegawai"
                :paginator="!loading && pegawai.length > 0"
                :rows="pagination.limit"
                :totalRecords="pagination.total"
                :first="pagination.first"
                :pt="tablePassthrough"
                @page="onPageChange"
                responsiveLayout="scroll"
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} aparatur"
            >
                <Column field="nip" header="NIP" class="w-[15%]">
                    <template #body="slotProps">
                        <Skeleton v-if="loading" width="85%" height="12px"></Skeleton>
                        <span v-else class="font-mono text-xs font-bold text-surface-700 dark:text-surface-300">{{ slotProps.data.nip }}</span>
                    </template>
                </Column>

                <Column field="nama" header="Identitas Pegawai" class="w-[25%]">
                    <template #body="slotProps">
                        <Skeleton v-if="loading" width="70%" height="14px" class="mb-1"></Skeleton>
                        <Skeleton v-if="loading" width="40%" height="10px"></Skeleton>
                        <div v-else class="flex flex-col">
                            <span class="font-bold text-surface-900 dark:text-surface-50">{{ slotProps.data.nama }}</span>
                            <span class="text-[11px] font-semibold text-surface-400 dark:text-surface-500 mt-0.5">{{ slotProps.data.jenis_kelamin }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="jabatan" header="Penugasan Struktural" class="w-[25%]">
                    <template #body="slotProps">
                        <Skeleton v-if="loading" width="80%" height="14px" class="mb-1"></Skeleton>
                        <Skeleton v-if="loading" width="50%" height="10px"></Skeleton>
                        <div v-else class="flex flex-col">
                            <span class="font-medium text-surface-800 dark:text-surface-200">{{ slotProps.data.jabatan || '-' }}</span>
                            <span class="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5 truncate max-w-[220px]" :title="slotProps.data.unit_kerja">{{ slotProps.data.unit_kerja || '-' }}</span>
                        </div>
                    </template>
                </Column>

                <Column field="golongan" header="Gol" class="w-[10%]">
                    <template #body="slotProps">
                        <Skeleton v-if="loading" width="40%" height="12px"></Skeleton>
                        <span v-else class="font-semibold text-surface-700 dark:text-surface-300 font-mono">{{ slotProps.data.golongan || '-' }}</span>
                    </template>
                </Column>

                <Column field="status" header="Status" class="w-[10%]">
                    <template #body="slotProps">
                        <Skeleton v-if="loading" width="50px" height="20px" class="rounded"></Skeleton>
                        <Tag 
                            v-else
                            :value="slotProps.data.status?.toUpperCase()" 
                            :severity="slotProps.data.status === 'aktif' ? 'success' : 'danger'"
                            class="text-[10px] font-extrabold tracking-wide px-2.5 py-0.5"
                        />
                    </template>
                </Column>

                <Column header="Aksi" class="w-[15%] text-center">
                    <template #body="slotProps">
                        <div v-if="loading" class="flex gap-2 justify-center">
                            <Skeleton shape="circle" size="1.75rem"></Skeleton>
                            <Skeleton shape="circle" size="1.75rem"></Skeleton>
                            <Skeleton shape="circle" size="1.75rem"></Skeleton>
                        </div>
                        <div v-else class="flex items-center gap-1">
                            <Button icon="pi pi-eye" rounded text size="small" class="hover:bg-blue-500/10 hover:text-blue-600" v-tooltip.top="'Lihat Detail'" @click="viewDetail(slotProps.data.id)" />
                            <Button icon="pi pi-pencil" rounded text size="small" class="hover:bg-amber-500/10 hover:text-amber-600" v-tooltip.top="'Ubah Data'" @click="editPegawai(slotProps.data)" />
                            <Button icon="pi pi-trash" rounded text severity="danger" size="small" class="hover:bg-rose-500/10" v-tooltip.top="'Hapus Aparatur'" @click="confirmDelete(slotProps.data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="deleteDialogVisible" header="Konfirmasi Penghapusan" :modal="true" :style="{ width: '420px' }" class="p-0 overflow-hidden">
            <div class="flex flex-col items-center text-center p-4">
                <div class="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                    <i class="pi pi-exclamation-triangle text-xl"></i>
                </div>
                <h4 class="text-sm font-black text-surface-900 dark:text-white m-0">Hapus Data Secara Permanen?</h4>
                <p class="text-xs text-surface-500 dark:text-surface-400 mt-2 mb-0 leading-relaxed">
                    Apakah Anda yakin ingin menghapus aparatur <strong>{{ selectedPegawai?.nama }}</strong>? Tindakan ini akan menghapus semua berkas digital yang terhubung dan tidak dapat dibatalkan.
                </p>
            </div>
            <template #footer>
                <div class="flex items-center gap-2 w-full justify-end border-t border-surface-100 dark:border-surface-800 pt-3">
                    <Button label="Batalkan" icon="pi pi-times" text size="small" class="font-bold" @click="deleteDialogVisible = false" />
                    <Button label="Ya, Hapus" icon="pi pi-trash" severity="danger" size="small" class="font-bold shadow-sm" :loading="deleting" @click="deletePegawai" />
                </div>
            </template>
        </Dialog>
    </div>

    <PegawaiFormModal
        :visible="formModalVisible"
        :pegawai="selectedPegawai"
        :isEditing="isEditing"
        @hide="closeFormModal"
        @saved="onPegawaiSaved"
    />
</template>