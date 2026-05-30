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
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// ==================== CORE STATE ====================
const items = ref([]);
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const showDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const selectedItem = ref(null);
const searchQuery = ref('');
const pegawaiOptions = ref([]);

const form = ref({ 
    pegawai_id: null, 
    nama_diklat: '', 
    penyelenggara: '', 
    tahun: new Date().getFullYear(), 
    sertifikat_file: '' 
});
const errors = ref({});

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
    const tahunList = items.value.map(i => i.tahun).filter(Boolean);
    const tahunTerbaru = tahunList.length ? Math.max(...tahunList) : '-';
    const jumlahPenyelenggara = new Set(items.value.map(i => i.penyelenggara).filter(Boolean)).size;
    return { 
        'Total Record': total, 
        'Update Terakhir': tahunTerbaru, 
        'Lembaga Mitra': jumlahPenyelenggara 
    };
});

const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value;
    const q = searchQuery.value.toLowerCase().trim();
    return items.value.filter(item => 
        item.nama_diklat?.toLowerCase().includes(q) ||
        item.pegawai?.nama?.toLowerCase().includes(q) ||
        item.pegawai?.nip?.includes(q)
    );
});

const loadPegawaiOptions = async () => {
    const { data } = await supabase.from('pegawai').select('id, nama, nip').order('nama');
    if (data) pegawaiOptions.value = data.map(p => ({ label: `${p.nip} - ${p.nama}`, value: p.id }));
};

const loadData = async () => {
    loading.value = true;
    try {
        const { data, error } = await supabase
            .from('riwayat_diklat')
            .select('*, pegawai(id, nip, nama)')
            .order('tahun', { ascending: false });
        if (error) throw error;
        items.value = data || [];
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Sinkronisasi ledger gagal.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const validate = () => {
    errors.value = {};
    if (!form.value.pegawai_id) errors.value.pegawai_id = 'Personel wajib dipilih.';
    if (!form.value.nama_diklat) errors.value.nama_diklat = 'Nama diklat tidak boleh kosong.';
    return Object.keys(errors.value).length === 0;
};

const saveData = async () => {
    if (!validate()) return;
    submitting.value = true;
    try {
        const payload = { ...form.value, updated_at: new Date().toISOString() };
        if (isEditing.value) {
            await supabase.from('riwayat_diklat').update(payload).eq('id', selectedItem.value.id);
        } else {
            await supabase.from('riwayat_diklat').insert([{ ...payload, created_at: new Date().toISOString() }]);
        }
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Record kompetensi telah diamankan.', life: 3000 });
        showDialog.value = false;
        loadData();
    } finally { submitting.value = false; }
};

const openCreateModal = () => {
    isEditing.value = false;
    form.value = { pegawai_id: null, nama_diklat: '', penyelenggara: '', tahun: new Date().getFullYear(), sertifikat_file: '' };
    errors.value = {};
    showDialog.value = true;
};

const openEditModal = (row) => {
    isEditing.value = true;
    selectedItem.value = row;
    form.value = { ...row };
    showDialog.value = true;
};

const confirmDelete = (row) => { selectedItem.value = row; deleteDialog.value = true; };

const deleteData = async () => {
    deleting.value = true;
    try {
        await supabase.from('riwayat_diklat').delete().eq('id', selectedItem.value.id);
        deleteDialog.value = false;
        loadData();
    } finally { deleting.value = false; }
};

onMounted(() => { loadData(); loadPegawaiOptions(); });
</script>

<template>
    <div class="w-full max-w-[1400px] mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
        
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="flex items-start gap-5">
                    <div class="w-14 h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-xl shadow-zinc-500/10">
                        <i class="pi pi-book text-xl"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Competency Development Ledger
                        </div>
                        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0">Riwayat Diklat</h1>
                        <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
                            Pemantauan sistematis terhadap pengembangan kompetensi dan pelatihan teknis aparatur secara berkala.
                        </p>
                    </div>
                </div>
                <Button label="Input Record Diklat" icon="pi pi-plus" class="text-xs font-bold bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 px-8 py-3 rounded-xl border-0 shadow-lg uppercase tracking-tighter" @click="openCreateModal" />
            </div>

            <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                <InputGroup class="max-w-md group">
                    <InputGroupAddon class="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                        <i class="pi pi-search text-[10px] text-zinc-400"></i>
                    </InputGroupAddon>
                    <InputText v-model="searchQuery" placeholder="Cari NIP, Nama, atau Jenis Diklat..." class="text-xs p-3 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus:ring-0" />
                </InputGroup>
                
                <div class="flex gap-4">
                    <div v-for="(val, key) in stats" :key="key" class="flex flex-col items-end">
                        <span class="text-[9px] uppercase font-bold text-zinc-400 tracking-tighter">{{ key }}</span>
                        <span class="text-sm font-black text-zinc-900 dark:text-zinc-100">{{ val }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2 px-1 text-zinc-400">
                <i class="pi pi-database text-[10px]"></i>
                <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Database Kompetensi Terintegrasi</span>
            </div>
            
            <DataTable :value="loading ? Array(5).fill({}) : filteredItems" :pt="tablePassthrough">
                <template #empty>
                    <div class="py-20 text-center flex flex-col items-center justify-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200">
                            <i class="pi pi-inbox text-xl"></i>
                        </div>
                        <p class="text-xs text-zinc-400 font-medium tracking-tight">Belum ada record pengembangan kompetensi yang terdaftar.</p>
                    </div>
                </template>

                <Column field="pegawai.nama" header="Personel">
                    <template #body="{ data }">
                        <Skeleton v-if="loading" width="90%" />
                        <div v-else class="flex flex-col">
                            <span class="font-bold text-zinc-800 dark:text-zinc-200 tracking-tight text-sm">{{ data.pegawai?.nama }}</span>
                            <span class="text-[10px] font-mono text-zinc-400">{{ data.pegawai?.nip }}</span>
                        </div>
                    </template>
                </Column>
                
                <Column field="nama_diklat" header="Jenis Diklat">
                    <template #body="{ data }">
                        <Skeleton v-if="loading" width="70%" />
                        <Tag v-else :value="data.nama_diklat" class="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold border border-zinc-200 dark:border-zinc-700 px-2 py-1 uppercase" />
                    </template>
                </Column>
                
                <Column field="penyelenggara" header="Penyelenggara">
                    <template #body="{ data }">
                        <Skeleton v-if="loading" width="60%" />
                        <span v-else class="text-xs italic text-zinc-500 font-medium">{{ data.penyelenggara }}</span>
                    </template>
                </Column>

                <Column field="tahun" header="Tahun" class="w-[100px] text-center font-black" />

                <Column header="Opsi" class="w-[120px]" bodyClass="text-right">
                    <template #body="{ data }">
                        <div class="flex items-center justify-end gap-1">
                            <Button icon="pi pi-pencil" text rounded size="small" class="text-zinc-400 hover:text-zinc-900" @click="openEditModal(data)" />
                            <Button icon="pi pi-trash" text rounded severity="danger" size="small" class="text-zinc-400 hover:text-red-500" @click="confirmDelete(data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="showDialog" :header="isEditing ? 'Ubah Record Diklat' : 'Registrasi Diklat Baru'" :pt="dialogPT" modal :style="{ width: '500px' }">
            <div class="flex flex-col gap-6 py-6">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Personel Terkait <span class="text-red-500">*</span></label>
                    <Select v-model="form.pegawai_id" :options="pegawaiOptions" optionLabel="label" optionValue="value" filter placeholder="Pilih NIP/Nama..." class="w-full text-xs border-zinc-200 bg-zinc-50/50 rounded-xl" />
                    <small v-if="errors.pegawai_id" class="text-[9px] text-red-500 font-bold uppercase">{{ errors.pegawai_id }}</small>
                </div>
                
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Nama Diklat/Pelatihan <span class="text-red-500">*</span></label>
                    <InputText v-model="form.nama_diklat" placeholder="E.g. Diklat PIM III, Pelatihan Cyber Security" class="w-full text-xs p-4 border-zinc-200 bg-zinc-50/50 rounded-xl" />
                    <small v-if="errors.nama_diklat" class="text-[9px] text-red-500 font-bold uppercase">{{ errors.nama_diklat }}</small>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Lembaga Penyelenggara</label>
                        <InputText v-model="form.penyelenggara" placeholder="E.g. LAN RI, BKN" class="w-full text-xs p-4 border-zinc-200 bg-zinc-50/50 rounded-xl" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Tahun Pelaksanaan</label>
                        <InputNumber v-model="form.tahun" :useGrouping="false" placeholder="2024" class="w-full text-xs rounded-xl" />
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Dokumen Sertifikat (URL)</label>
                    <InputText v-model="form.sertifikat_file" placeholder="Cloud Storage Link..." class="w-full text-[11px] font-mono p-4 border-zinc-200 bg-zinc-50/50 rounded-xl" />
                </div>
            </div>
            <template #footer>
                <div class="flex items-center justify-end gap-3 w-full border-t border-zinc-100 pt-6">
                    <Button label="Batalkan" class="text-xs font-bold text-zinc-400 bg-transparent border-0 px-4" @click="showDialog = false" />
                    <Button label="Finalisasi Record" class="text-xs font-bold bg-zinc-950 text-white px-8 py-3 rounded-xl border-0 shadow-lg" :loading="submitting" @click="saveData" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteDialog" header="Otorisasi Penghapusan" :pt="dialogPT" modal :style="{ width: '380px' }">
            <div class="py-6 flex flex-col items-center text-center gap-4">
                <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                    <i class="pi pi-shield-exclamation text-xl text-red-500"></i>
                </div>
                <p class="text-[11px] font-medium text-zinc-500 leading-relaxed px-4 italic">
                    Record diklat milik <strong>{{ selectedItem?.pegawai?.nama }}</strong> akan dihapus secara permanen dari ledger.
                </p>
            </div>
            <template #footer>
                <div class="flex flex-col gap-2 w-full pt-4">
                    <Button label="Ya, Konfirmasi Hapus" class="w-full text-[10px] font-black uppercase tracking-widest bg-red-500 text-white border-0 py-3 rounded-xl shadow-lg shadow-red-500/20" :loading="deleting" @click="deleteData" />
                    <Button label="Batalkan" class="w-full text-[10px] font-bold text-zinc-400 bg-transparent border-0 py-2" @click="deleteDialog = false" />
                </div>
            </template>
        </Dialog>

    </div>
</template>

<style scoped>
/* No manual CSS - Pure Tailwind + Passthrough */
</style>