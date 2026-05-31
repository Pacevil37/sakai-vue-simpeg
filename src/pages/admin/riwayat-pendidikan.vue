<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';

// PrimeVue 4 Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// ==================== CORE STATE ====================
const items = ref([]);
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const showDialog = ref(false);
const showDetailDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const selectedItem = ref(null);
const detailData = ref(null);

const form = ref({
    pegawai_id: null,
    jenjang: null,
    institusi: '',
    tahun_lulus: null,
    ijazah_file: ''
});
const errors = ref({});

// Filters
const searchQuery = ref('');
const filterJenjang = ref(null);
const filterTahun = ref(null);
const pegawaiOptions = ref([]);

const jenjangOptions = [
    { label: 'SD', value: 'SD' }, { label: 'SMP', value: 'SMP' },
    { label: 'SMA', value: 'SMA' }, { label: 'SMK', value: 'SMK' },
    { label: 'D1', value: 'D1' }, { label: 'D2', value: 'D2' },
    { label: 'D3', value: 'D3' }, { label: 'D4', value: 'D4' },
    { label: 'S1', value: 'S1' }, { label: 'S2', value: 'S2' },
    { label: 'S3', value: 'S3' }
];

// ==================== DESIGN SYSTEM PT ====================
const tablePassthrough = {
    root: { class: 'border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950' },
    thead: { class: 'bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800' },
    headerCell: { class: 'p-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest' },
    bodyRow: { class: 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-all border-b border-zinc-100 dark:border-zinc-900 last:border-0' },
    rowCell: { class: 'p-4 text-xs font-medium text-zinc-700 dark:text-zinc-300' }
};

const dialogPT = {
    root: { class: 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden' },
    header: { class: 'p-6 pb-2 bg-white dark:bg-zinc-950 flex items-center justify-between' },
    title: { class: 'text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase' },
    content: { class: 'p-6 pt-2 bg-white dark:bg-zinc-950' },
    footer: { class: 'p-6 pt-0 bg-white dark:bg-zinc-950 flex justify-end gap-2' },
    mask: { class: 'backdrop-blur-sm bg-zinc-900/40' }
};

// ==================== LOGIC & DATA FETCHING ====================
const stats = computed(() => {
    const total = items.value.length;
    const sarjana = items.value.filter(i => ['S1', 'S2', 'S3'].includes(i.jenjang)).length;
    const diploma = items.value.filter(i => i.jenjang?.startsWith('D')).length;
    const sma = items.value.filter(i => ['SMA', 'SMK'].includes(i.jenjang)).length;
    return { total, sarjana, diploma, sma };
});

const loadPegawaiOptions = async () => {
    const { data } = await supabase.from('pegawai').select('id, nama, nip').order('nama');
    if (data) pegawaiOptions.value = data.map(p => ({ label: `${p.nip} - ${p.nama}`, value: p.id }));
};

const loadData = async () => {
    loading.value = true;
    try {
        let query = supabase.from('riwayat_pendidikan').select('*, pegawai(id, nip, nama)').order('created_at', { ascending: false });
        
        if (filterJenjang.value) query = query.eq('jenjang', filterJenjang.value);
        if (filterTahun.value) query = query.eq('tahun_lulus', filterTahun.value);

        const { data, error } = await query;
        if (error) throw error;

        let filtered = data || [];
        if (searchQuery.value) {
            const term = searchQuery.value.toLowerCase();
            filtered = filtered.filter(item => 
                item.pegawai?.nip?.toLowerCase().includes(term) || 
                item.pegawai?.nama?.toLowerCase().includes(term)
            );
        }
        items.value = filtered;
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
    } finally {
        loading.value = false;
    }
};

const validate = () => {
    errors.value = {};
    if (!form.value.pegawai_id) errors.value.pegawai_id = 'Pilih personel terlebih dahulu.';
    if (!form.value.jenjang) errors.value.jenjang = 'Jenjang pendidikan wajib diisi.';
    return Object.keys(errors.value).length === 0;
};

const saveData = async () => {
    if (!validate()) return;
    submitting.value = true;
    try {
        const payload = { ...form.value, updated_at: new Date().toISOString() };
        if (isEditing.value) {
            await supabase.from('riwayat_pendidikan').update(payload).eq('id', selectedItem.value.id);
        } else {
            await supabase.from('riwayat_pendidikan').insert([{ ...payload, created_at: new Date().toISOString() }]);
        }
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Ledger pendidikan diperbarui.', life: 3000 });
        showDialog.value = false;
        loadData();
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
    } finally {
        submitting.value = false;
    }
};

const confirmDelete = (row) => { selectedItem.value = row; deleteDialog.value = true; };
const deleteData = async () => {
    deleting.value = true;
    try {
        await supabase.from('riwayat_pendidikan').delete().eq('id', selectedItem.value.id);
        toast.add({ severity: 'success', summary: 'Terhapus', detail: 'Record pendidikan telah dimusnahkan.', life: 3000 });
        deleteDialog.value = false;
        loadData();
    } finally { deleting.value = false; }
};

const openCreateModal = () => {
    isEditing.value = false;
    form.value = { pegawai_id: null, jenjang: null, institusi: '', tahun_lulus: null, ijazah_file: '' };
    errors.value = {};
    showDialog.value = true;
};

const openEditModal = (row) => {
    isEditing.value = true;
    selectedItem.value = row;
    form.value = { ...row };
    showDialog.value = true;
};

onMounted(() => { loadPegawaiOptions(); loadData(); });
</script>

<template>
    <div class="w-full mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
        
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="flex items-start gap-5">
                    <div class="w-14 h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-xl shadow-zinc-500/10">
                        <i class="pi pi-graduation-cap text-xl"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span> Educational Asset Registry
                        </div>
                        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0">Riwayat Pendidikan</h1>
                        <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
                            Manajemen record kualifikasi akademik personel untuk pemetaan kompetensi di dalam database repositori nasional.
                        </p>
                    </div>
                </div>
                <Button label="Registrasi Riwayat Baru" icon="pi pi-plus" class="text-xs font-bold bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 px-8 py-3 rounded-xl border-0 shadow-lg uppercase tracking-tighter" @click="openCreateModal" />
            </div>

            <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Pencarian Cepat</label>
                    <InputGroup class="group">
                        <InputGroupAddon class="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"><i class="pi pi-search text-[10px]"></i></InputGroupAddon>
                        <InputText v-model="searchQuery" placeholder="NIP / Nama..." class="text-xs p-2.5 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50" />
                    </InputGroup>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Jenjang</label>
                    <Select v-model="filterJenjang" :options="jenjangOptions" optionLabel="label" optionValue="value" placeholder="Semua Jenjang" class="text-xs border-zinc-200 dark:border-zinc-800" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Tahun Lulus</label>
                    <InputNumber v-model="filterTahun" :useGrouping="false" placeholder="Tahun" class="w-full text-xs" />
                </div>
                <div class="flex items-end gap-2">
                    <Button icon="pi pi-filter" label="Terapkan" class="flex-1 text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-0 py-2.5 rounded-lg" @click="loadData" />
                    <Button icon="pi pi-refresh" class="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 border-0 p-2.5 rounded-lg" @click="resetFilters" />
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(val, key) in stats" :key="key" class="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                    <i :class="['pi text-zinc-400', key === 'sarjana' ? 'pi-graduation-cap' : key === 'total' ? 'pi-book' : 'pi-certificate']"></i>
                </div>
                <div>
                    <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest m-0">{{ key }}</p>
                    <p class="text-xl font-black text-zinc-900 dark:text-white m-0 tracking-tight">{{ val }} <span class="text-[10px] text-zinc-400 font-medium">Record</span></p>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2 px-1">
                <i class="pi pi-database text-[10px] text-zinc-400"></i>
                <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Arsip Pendidikan Terverifikasi</span>
            </div>
            
            <DataTable :value="items" :loading="loading" :pt="tablePassthrough" paginator :rows="10" scrollable scrollHeight="50vh">
                <template #empty>
                    <div class="py-24 text-center flex flex-col items-center justify-center gap-4">
                        <i class="pi pi-search text-3xl text-zinc-200"></i>
                        <p class="text-xs text-zinc-400 font-medium tracking-tight">Tidak ditemukan record kualifikasi akademik.</p>
                    </div>
                </template>
                
                <Column field="pegawai.nip" header="Identitas Personel" class="min-w-[250px]">
                    <template #body="{ data }">
                        <div class="flex flex-col gap-0.5">
                            <span class="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight text-sm">{{ data.pegawai?.nama }}</span>
                            <span class="text-[10px] font-mono text-zinc-400 tracking-tighter">{{ data.pegawai?.nip }}</span>
                        </div>
                    </template>
                </Column>
                
                <Column field="jenjang" header="Jenjang" class="w-[100px]">
                    <template #body="{ data }">
                        <span class="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase">{{ data.jenjang }}</span>
                    </template>
                </Column>
                
                <Column field="institusi" header="Lembaga Pendidikan" class="min-w-[250px]" />
                <Column field="tahun_lulus" header="Tahun Lulus" class="w-[120px]" headerClass="text-center" bodyClass="text-center font-bold" />
                
                <Column header="Opsi" class="w-[140px]" bodyClass="text-center">
                    <template #body="{ data }">
                        <div class="flex items-center justify-center gap-1">
                            <Button icon="pi pi-pencil" text rounded size="small" class="text-zinc-400 hover:text-zinc-900 dark:hover:text-white" @click="openEditModal(data)" />
                            <Button icon="pi pi-trash" text rounded severity="danger" size="small" class="text-zinc-400 hover:text-red-500" @click="confirmDelete(data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="showDialog" :header="isEditing ? 'Modify Academic Record' : 'Registrasi Pendidikan Baru'" :pt="dialogPT" modal :style="{ width: '500px' }">
            <div class="flex flex-col gap-5 py-6">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pilih Personel <span class="text-red-500">*</span></label>
                    <Select v-model="form.pegawai_id" :options="pegawaiOptions" optionLabel="label" optionValue="value" filter placeholder="Cari NIP atau Nama..." class="w-full text-xs border-zinc-200 bg-zinc-50/50" />
                    <small v-if="errors.pegawai_id" class="text-[9px] text-red-500 font-bold uppercase tracking-tighter">{{ errors.pegawai_id }}</small>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Jenjang <span class="text-red-500">*</span></label>
                        <Select v-model="form.jenjang" :options="jenjangOptions" optionLabel="label" optionValue="value" class="text-xs border-zinc-200" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tahun Lulus</label>
                        <InputNumber v-model="form.tahun_lulus" :useGrouping="false" class="text-xs w-full" />
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Institusi / Universitas</label>
                    <InputText v-model="form.institusi" placeholder="Nama lembaga resmi..." class="w-full text-xs p-3 border-zinc-200" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dokumen Digital (Ijazah)</label>
                    <InputText v-model="form.ijazah_file" placeholder="Cloud Storage URL..." class="w-full text-[11px] font-mono p-3 border-zinc-200 bg-zinc-50" />
                </div>
            </div>
            <template #footer>
                <div class="flex items-center justify-end gap-3 w-full border-t border-zinc-100 pt-6">
                    <Button label="Batalkan" class="text-xs font-bold text-zinc-400 bg-transparent border-0" @click="showDialog = false" />
                    <Button label="Finalisasi Record" class="text-xs font-bold bg-zinc-950 text-white px-8 py-3 rounded-xl border-0 shadow-lg" :loading="submitting" @click="saveData" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteDialog" header="Otorisasi Penghapusan" :pt="dialogPT" modal :style="{ width: '380px' }">
            <div class="py-6 flex flex-col items-center text-center gap-4">
                <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                    <i class="pi pi-shield-exclamation text-xl text-red-500"></i>
                </div>
                <p class="text-[11px] font-medium text-zinc-500 leading-relaxed px-4 italic text-pretty">
                    Record pendidikan milik <strong>{{ selectedItem?.pegawai?.nama }}</strong> akan dihapus secara permanen.
                </p>
            </div>
            <template #footer>
                <div class="flex flex-col gap-2 w-full pt-4">
                    <Button label="Ya, Konfirmasi Hapus" class="w-full text-[10px] font-black bg-red-500 text-white border-0 py-3 rounded-xl" :loading="deleting" @click="deleteData" />
                    <Button label="Batalkan" class="w-full text-[10px] font-bold text-zinc-400 bg-transparent border-0 py-2" @click="deleteDialog = false" />
                </div>
            </template>
        </Dialog>

    </div>
</template>

<style scoped>
/* SEMUA STYLE LAMA DIHAPUS - SEKARANG MURNI TAILWIND */
</style>