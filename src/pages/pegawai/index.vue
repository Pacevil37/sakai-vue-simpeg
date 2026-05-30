<!-- File: src/pages/pegawai/PegawaiList.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';

// PrimeVue 4 Components Core Only (Highly Customized via Passthrough)
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import Avatar from 'primevue/avatar';
import Skeleton from 'primevue/skeleton';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// Data & Core Operational States
const pegawaiData = ref([]);
const loading = ref(false);
const deleting = ref(false);
const deleteDialog = ref(false);
const selectedPegawai = ref(null);

// Pagination & Query Matrix
const filters = ref({
    search: '',
    unit_kerja_id: null,
    status: null,
    jabatan: null
});

const pagination = ref({
    page: 1,
    limit: 10,
    total: 0
});

const sortField = ref('nama');
const sortOrder = ref(1);

// Semantic Dropdown Options
const unitOptions = ref([]);
const jabatanOptions = ref([]);
const statusOptions = ref([
    { label: 'Aktif Kerja', value: 'aktif' },
    { label: 'Non-Aktif', value: 'pensiun' },
    { label: 'Mutasi Tugas', value: 'mutasi' }
]);

const photoLoadFailures = ref({});
const unitMap = ref({});

const getUnitName = (id) => id ? (unitMap.value[id] || '—') : '—';

// Data Hydration & Resolvers
const fetchUnitOptions = async () => {
    const { data, error } = await supabase.from('units').select('id, name');
    if (error) return console.error(error);
    unitOptions.value = data.map(u => ({ label: u.name, value: u.id }));
    unitMap.value = Object.fromEntries(data.map(u => [u.id, u.name]));
};

const fetchJabatanOptions = async () => {
    const { data, error } = await supabase.from('pegawai').select('jabatan').not('jabatan', 'is', null);
    if (error) return console.error(error);
    const unique = [...new Set(data.map(p => p.jabatan).filter(Boolean))];
    jabatanOptions.value = unique.map(j => ({ label: j, value: j }));
};

const loadPegawai = async () => {
    try {
        loading.value = true;
        let query = supabase.from('pegawai').select('*', { count: 'exact' });

        if (filters.value.search) {
            const search = `%${filters.value.search}%`;
            query = query.or(`nip.ilike.${search},nama.ilike.${search},email.ilike.${search}`);
        }
        if (filters.value.unit_kerja_id) query = query.eq('unit_kerja_id', filters.value.unit_kerja_id);
        if (filters.value.status) query = query.eq('status', filters.value.status);
        if (filters.value.jabatan) query = query.eq('jabatan', filters.value.jabatan);

        const direction = sortOrder.value === 1 ? { ascending: true } : { ascending: false };
        query = query.order(sortField.value === 'nama' ? 'nama' : sortField.value, direction);

        const from = (pagination.value.page - 1) * pagination.value.limit;
        const to = from + pagination.value.limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) throw error;

        pegawaiData.value = data || [];
        pagination.value.total = count || 0;
    } catch (error) {
        console.error(error);
        toast.add({ severity: 'error', summary: 'Database Link Interrupted', detail: 'Sinkronisasi gagal dilakukan.', life: 3500 });
    } finally {
        loading.value = false;
    }
};

// Orchestration Events
const onPageChange = (e) => { pagination.value.page = e.page + 1; pagination.value.limit = e.rows; loadPegawai(); };
const onSort = (e) => { sortField.value = e.sortField; sortOrder.value = e.sortOrder; loadPegawai(); };
const onSearch = () => { pagination.value.page = 1; loadPegawai(); };
const onFilterChange = () => { pagination.value.page = 1; loadPegawai(); };

// Router Flow
const navigateToCreate = () => router.push('/pegawai/create');
const viewPegawai = (p) => router.push(`/pegawai/${p.id}`);
const editPegawai = (p) => p && router.push(`/pegawai/${p.id}/edit`);
const confirmDelete = (p) => { selectedPegawai.value = p; deleteDialog.value = true; };

const deletePegawai = async () => {
    try {
        deleting.value = true;
        const { error } = await supabase.from('pegawai').delete().eq('id', selectedPegawai.value.id);
        if (error) throw error;
        toast.add({ severity: 'success', summary: 'Record Purged', detail: 'Arsip aparatur berhasil dihapus.', life: 3000 });
        deleteDialog.value = false;
        selectedPegawai.value = null;
        loadPegawai();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Execution Failed', detail: 'Sistem menolak modifikasi root.', life: 3000 });
    } finally { deleting.value = false; }
};

const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

// HIGH-END ENTERPRISE PASSTHROUGH MAP (Stripe & Linear Look)
const tablePassthrough = {
    root: { class: 'border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 shadow-sm' },
    thead: { class: 'bg-zinc-50/70 dark:bg-zinc-900/60 border-b border-zinc-200/60 dark:border-zinc-800/60' },
    headerCell: { class: 'p-3.5 px-5 text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 text-left uppercase border-0' },
    bodyRow: { class: 'hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-all duration-100 cursor-pointer border-b border-zinc-100 dark:border-zinc-900 last:border-0' },
    rowCell: { class: 'p-3.5 px-5 text-xs text-zinc-600 dark:text-zinc-400 border-0' },
    paginator: { 
        root: { class: 'bg-white dark:bg-zinc-950 border-t border-zinc-200/60 dark:border-zinc-800/60 p-4 text-[11px] font-medium text-zinc-500' },
        current: { class: 'text-zinc-400 dark:text-zinc-500' }
    }
};

onMounted(async () => {
    loading.value = true;
    await Promise.all([fetchUnitOptions(), fetchJabatanOptions()]);
    loadPegawai();
});
</script>

<template>
    <div class="p-6 md:p-10 max-w-[1700px] mx-auto w-full flex flex-col gap-6  dark:bg-zinc-950 min-h-screen antialiased text-zinc-900 dark:text-zinc-50">
        
        <!-- ==================== CONTEXTUAL SYSTEM HEADER ==================== -->
      <div class="flex flex-col gap-4 bg-white p-4 rounded-xl shadow-sm dark:bg-zinc-900">
      
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-900">
            <div>
                <div class="flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mb-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Identity Ledger
                </div>
                <h1 class="text-xl font-semibold tracking-tight m-0 text-zinc-900 dark:text-zinc-100">Direktori Pegawai</h1>
                <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-1 max-w-2xl leading-relaxed">
                    Sistem pemantauan data terpusat untuk penugasan struktur organisasi, administrasi kepangkatan, dan validitas status kepegawaian nasional.
                </p>
            </div>
            
            <!-- Minimalist Action Hub -->
            <div class="flex items-center gap-2 self-start md:self-end">
                <Button 
                    v-if="authStore.canCreatePegawai"
                    label="Registrasi Pegawai" 
                    icon="pi pi-plus" 
                    size="small" 
                    class="font-semibold text-xs rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 px-3.5 py-1.5 shadow-sm transition-all border-0" 
                    @click="navigateToCreate" 
                />
                
                <div class="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

                <Button 
                    v-if="authStore.canEditPegawai"
                    label="Edit" 
                    icon="pi pi-pencil" 
                    size="small" 
                    class="font-medium text-xs rounded-lg bg-transparent hover:bg-zinc-50 text-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-900/60 p-1.5 border-0"
                    :class="{ 'opacity-30 pointer-events-none': !selectedPegawai }"
                    @click="editPegawai(selectedPegawai)" 
                />
                <Button 
                    v-if="authStore.canDeletePegawai"
                    icon="pi pi-trash" 
                    size="small" 
                    class="rounded-lg bg-transparent text-zinc-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 border-0"
                    :class="{ 'opacity-30 pointer-events-none': !selectedPegawai }"
                    @click="confirmDelete(selectedPegawai)" 
                />
            </div>
        </div>

        <!-- ==================== PREMIUM ULTRA-SLIM FILTERS ==================== -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-4 shadow-inner-sm">
            <div class="flex flex-col gap-1.5">
                <label for="search" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Kueri Cari</label>
                <div class="relative w-full">
                    <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 text-[11px]"></i>
                    <InputText id="search" v-model="filters.search" placeholder="Ketik NIP atau Nama..." class="w-full pl-8 text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:border-zinc-400 dark:focus:border-zinc-700 shadow-sm" @input="onSearch" />
                </div>
            </div>
            
            <div class="flex flex-col gap-1.5">
                <label for="department" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Unit Penugasan</label>
                <Dropdown id="department" v-model="filters.unit_kerja_id" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Semua Divisi" :showClear="true" class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" @change="onFilterChange" />
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="status" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Status Hubungan</label>
                <Dropdown id="status" v-model="filters.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Semua Status" :showClear="true" class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" @change="onFilterChange" />
            </div>

            <div class="flex flex-col gap-1.5">
                <label for="position" class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Klasifikasi Jabatan</label>
                <Dropdown id="position" v-model="filters.jabatan" :options="jabatanOptions" optionLabel="label" optionValue="value" placeholder="Semua Hierarki" :showClear="true" class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" @change="onFilterChange" />
            </div>
        </div>

      </div>

        <!-- ==================== PREMIUM ENTERPRISE DATATABLE ==================== -->
        <DataTable
            :value="loading ? Array(pagination.limit).fill({}) : pegawaiData"
            :paginator="!loading && pegawaiData.length > 0"
            :rows="pagination.limit"
            :totalRecords="pagination.total"
            :lazy="true"
            v-model:selection="selectedPegawai"
            selectionMode="single"
            dataKey="id"
            :pt="tablePassthrough"
            @page="onPageChange"
            @sort="onSort"
            :sortField="sortField"
            :sortOrder="sortOrder"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :rowsPerPageOptions="[10, 20, 50]"
            currentPageReportTemplate="Showing {first} - {last} of {totalRecords} Records"
            responsiveLayout="scroll"
        >
            <!-- NIP METRIC -->
            <Column field="nip" header="ID Ledger" :sortable="true" class="w-[12%]">
                <template #body="slotProps">
                    <Skeleton v-if="loading" width="60%" height="8px" class="rounded-sm" />
                    <span v-else class="font-mono text-[11px] font-semibold tracking-tight text-zinc-400 dark:text-zinc-500">{{ slotProps.data.nip }}</span>
                </template>
            </Column>

            <!-- IDENTITY MATRIC (AVATAR INLINE WITH COMPACT INFO) -->
            <Column field="nama" header="Aparatur Sipil" :sortable="true" class="w-[32%]">
                <template #body="slotProps">
                    <div v-if="loading" class="flex items-center gap-2.5">
                        <Skeleton shape="circle" size="1.75rem" class="shrink-0" />
                        <div class="flex flex-col gap-1 w-full">
                            <Skeleton width="50%" height="10px" class="rounded-sm" />
                            <Skeleton width="30%" height="8px" class="rounded-sm" />
                        </div>
                    </div>
                    <div v-else class="flex items-center gap-2.5">
                        <img 
                            v-if="slotProps.data.foto_url && !photoLoadFailures[slotProps.data.id]" 
                            :src="slotProps.data.foto_url" 
                            alt="A" 
                            class="w-7 h-7 rounded-full object-cover shrink-0 filter contrast-[1.02] border border-zinc-200/80 dark:border-zinc-800" 
                            @error="photoLoadFailures[slotProps.data.id] = true" 
                        />
                        <Avatar v-else :label="(slotProps.data.nama || 'U').charAt(0).toUpperCase()" shape="circle" class="w-7 h-7 text-[10px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-bold shrink-0 border border-zinc-200/50 dark:border-zinc-800/80" />
                        <div class="flex flex-col">
                            <span class="font-medium text-zinc-800 dark:text-zinc-200 tracking-tight leading-normal">{{ slotProps.data.nama }}</span>
                            <span class="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal leading-none mt-0.5">{{ slotProps.data.email || '—' }}</span>
                        </div>
                    </div>
                </template>
            </Column>

            <!-- JABATAN CLASSIFICATION -->
            <Column field="jabatan" header="Role / Jabatan" :sortable="true" class="w-[18%]">
                <template #body="slotProps">
                    <Skeleton v-if="loading" width="45%" height="9px" class="rounded-sm" />
                    <span v-else class="text-xs font-normal text-zinc-700 dark:text-zinc-300">{{ slotProps.data.jabatan || 'Staf Teknis' }}</span>
                </template>
            </Column>

            <!-- UNIT KERJA MAP -->
            <Column field="unit_kerja_id" header="Departemen" :sortable="true" class="w-[18%]">
                <template #body="slotProps">
                    <Skeleton v-if="loading" width="55%" height="9px" class="rounded-sm" />
                    <span v-else class="text-zinc-400 dark:text-zinc-500 text-xs">{{ getUnitName(slotProps.data.unit_kerja_id) }}</span>
                </template>
            </Column>

            <!-- GOLONGAN MATRIX -->
            <Column field="golongan" header="Gol" :sortable="true" class="w-[8%]">
                <template #body="slotProps">
                    <Skeleton v-if="loading" width="30%" height="8px" class="rounded-sm" />
                    <span v-else class="font-mono text-zinc-500 dark:text-zinc-500 text-xs font-semibold">{{ slotProps.data.golongan || '—' }}</span>
                </template>
            </Column>

            <!-- LUXURY DOT STATUS INDICATOR -->
            <Column field="status" header="Status" :sortable="true" class="w-[12%]">
                <template #body="slotProps">
                    <Skeleton v-if="loading" width="40px" height="14px" class="rounded-full" />
                    <div v-else class="inline-flex items-center gap-1.5 text-[11px] font-medium"
                         :class="{
                             'text-emerald-600 dark:text-emerald-400': slotProps.data.status === 'aktif',
                             'text-zinc-400 dark:text-zinc-500': slotProps.data.status === 'pensiun',
                             'text-amber-600 dark:text-amber-400': slotProps.data.status === 'mutasi'
                         }"
                    >
                        <span class="w-1.5 h-1.5 rounded-full" 
                              :class="{ 
                                  'bg-emerald-500 dark:bg-emerald-400 shadow-sm shadow-emerald-500/50': slotProps.data.status === 'aktif', 
                                  'bg-zinc-300 dark:bg-zinc-700': slotProps.data.status === 'pensiun', 
                                  'bg-amber-500 dark:bg-amber-400': slotProps.data.status === 'mutasi' 
                              }">
                        </span>
                        {{ slotProps.data.status === 'aktif' ? 'Active' : slotProps.data.status === 'mutasi' ? 'Mutated' : 'Suspended' }}
                    </div>
                </template>
            </Column>

            <!-- DETAILED ROW CHEVRON -->
            <Column class="w-[2%]" :exportable="false">
                <template #body="slotProps">
                    <div v-if="!loading" class="text-right flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="pi pi-angle-right text-zinc-300 dark:text-zinc-600 text-xs" @click.stop="viewPegawai(slotProps.data)"></i>
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- ==================== PREMIUM MINIMALIST ALERT MODAL ==================== -->
        <Dialog v-model:visible="deleteDialog" :style="{ width: '360px' }" :showHeader="false" :modal="true" class="border-0 rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900">
            <div class="p-6 flex flex-col">
                <div class="flex items-center gap-3 mb-3 text-red-600 dark:text-red-400">
                    <i class="pi pi-exclamation-triangle text-base" />
                    <h3 class="text-sm font-semibold text-zinc-900 dark:text-white m-0 tracking-tight">Destructive Action Notice</h3>
                </div>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 m-0 leading-relaxed">
                    Arsip data atas nama <span class="font-semibold text-zinc-800 dark:text-zinc-200">{{ selectedPegawai?.nama }}</span> akan dihapus secara permanen dari pangkalan data organisasi. Tindakan tidak dapat dibatalkan.
                </p>
                <div class="flex items-center justify-end gap-2 mt-6 w-full">
                    <Button label="Cancel" class="font-semibold text-[11px] bg-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border-0 p-2 px-3.5 rounded-lg" @click="deleteDialog = false" />
                    <Button label="Purge Record" class="font-semibold text-[11px] bg-red-600 hover:bg-red-700 text-white border-0 p-2 px-3.5 rounded-lg shadow-sm shadow-red-600/20" :loading="deleting" @click="deletePegawai" />
                </div>
            </div>
        </Dialog>
    </div>
</template>