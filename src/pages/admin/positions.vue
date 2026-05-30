<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';

// PrimeVue 4 Components
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// ==================== CORE STATE (LOGIKA UTUH) ====================
const items = ref([]);
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const showDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const selectedItem = ref(null);
const searchQuery = ref('');

const form = ref({ name: '', description: '' });

// ==================== DESIGN SYSTEM PASSTHROUGH ====================
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
    title: { class: 'text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100' },
    content: { class: 'p-6 pt-2 bg-white dark:bg-zinc-950' },
    footer: { class: 'p-6 pt-0 bg-white dark:bg-zinc-950 flex justify-end gap-2' },
    mask: { class: 'backdrop-blur-sm bg-zinc-900/40' }
};

// ==================== DATABASE & HANDLERS (LOGIKA UTUH) ====================
const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value;
    const q = searchQuery.value.toLowerCase().trim();
    return items.value.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
});

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
};

const loadData = async () => {
    loading.value = true;
    try {
        const { data, error } = await supabase.from('positions').select('*').order('name', { ascending: true });
        if (error) throw error;
        items.value = data || [];
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal Memuat', detail: err.message, life: 4000 });
    } finally {
        loading.value = false;
    }
};

const openCreate = () => {
    isEditing.value = false;
    form.value = { name: '', description: '' };
    showDialog.value = true;
};

const openEdit = (row) => {
    isEditing.value = true;
    selectedItem.value = row;
    form.value = { name: row.name, description: row.description || '' };
    showDialog.value = true;
};

const closeDialog = () => {
    showDialog.value = false;
    form.value = { name: '', description: '' };
};

const saveData = async () => {
    if (!form.value.name) return;
    submitting.value = true;
    try {
        const payload = { name: form.value.name.trim(), description: form.value.description?.trim() || null };
        if (isEditing.value) {
            await supabase.from('positions').update(payload).eq('id', selectedItem.value.id);
        } else {
            await supabase.from('positions').insert([payload]);
        }
        toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Data jabatan telah diperbarui.', life: 3000 });
        closeDialog();
        loadData();
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
    } finally {
        submitting.value = false;
    }
};

const confirmDelete = (row) => {
    selectedItem.value = row;
    deleteDialog.value = true;
};

const deleteData = async () => {
    deleting.value = true;
    try {
        await supabase.from('positions').delete().eq('id', selectedItem.value.id);
        toast.add({ severity: 'success', summary: 'Terhapus', detail: 'Record data telah dimusnahkan.', life: 3000 });
        deleteDialog.value = false;
        loadData();
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Kesalahan', detail: err.message, life: 3000 });
    } finally {
        deleting.value = false;
    }
};

onMounted(loadData);
</script>

<template>
    <div class="w-full max-w-[1400px] mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
        
        <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
            
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="flex items-start gap-5">
                    <div class="w-14 h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shrink-0 shadow-xl shadow-zinc-500/10">
                        <i class="pi pi-briefcase text-xl"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Identity Ledger Structure
                        </div>
                        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0">Master Klasifikasi Jabatan</h1>
                        <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
                            Sistem repositori terpusat untuk manajemen definisi dan hirarki jabatan struktural dalam database organisasi nasional.
                        </p>
                    </div>
                </div>
            </div>

            <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <InputGroup class="w-full sm:w-[400px] group">
                    <InputGroupAddon class="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 group-focus-within:border-zinc-400 transition-colors">
                        <i class="pi pi-search text-[10px] text-zinc-400"></i>
                    </InputGroupAddon>
                    <InputText 
                        v-model="searchQuery" 
                        placeholder="Cari record jabatan..." 
                        class="text-xs border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-0 w-full p-3" 
                    />
                </InputGroup>
                
                <Button 
                    icon="pi pi-plus" 
                    label="Registrasi Jabatan Baru" 
                    class="w-full sm:w-auto text-xs font-bold bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-0 px-8 py-3 rounded-xl shadow-lg hover:opacity-90 transition-all shrink-0 uppercase tracking-tighter" 
                    @click="openCreate" 
                />
            </div>
        </div>

        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2 px-1">
                <i class="pi pi-database text-[10px] text-zinc-400"></i>
                <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Arsip Data Terverifikasi</span>
            </div>
            
            <DataTable :value="filteredItems" :loading="loading" :pt="tablePassthrough" scrollable scrollHeight="50vh">
                <template #empty>
                    <div class="py-24 text-center flex flex-col items-center justify-center gap-4">
                        <div class="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                            <i class="pi pi-folder-open text-2xl text-zinc-200 dark:text-zinc-800"></i>
                        </div>
                        <p class="text-xs text-zinc-400 font-medium tracking-tight">Tidak ada record jabatan yang tersimpan dalam ledger ini.</p>
                    </div>
                </template>
                
                <Column field="name" header="Nomenklatur Jabatan" class="min-w-[280px]">
                    <template #body="{ data }">
                        <span class="font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">{{ data.name }}</span>
                    </template>
                </Column>
                
                <Column field="description" header="Uraian Deskripsi" class="min-w-[400px]">
                    <template #body="{ data }">
                        <span class="text-zinc-500 line-clamp-1 italic text-[11px] font-medium">{{ data.description || '— Tanpa Deskripsi Struktural —' }}</span>
                    </template>
                </Column>
                
                <Column field="created_at" header="Tanggal Registrasi" class="w-[200px]">
                    <template #body="{ data }">
                        <div class="flex flex-col">
                            <span class="text-zinc-600 dark:text-zinc-400 font-bold text-[11px]">{{ formatDate(data.created_at) }}</span>
                            <span class="text-[9px] text-zinc-400 uppercase font-black tracking-tighter">System Logged</span>
                        </div>
                    </template>
                </Column>
                
                <Column header="Opsi Pengelolaan" class="w-[140px]" headerClass="text-center" bodyClass="text-center">
                    <template #body="{ data }">
                        <div class="flex items-center justify-center gap-2">
                            <Button icon="pi pi-pencil" text rounded size="small" class="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2" @click="openEdit(data)" />
                            <Button icon="pi pi-trash" text rounded severity="danger" size="small" class="text-zinc-400 hover:text-red-500 p-2" @click="confirmDelete(data)" />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <Dialog v-model:visible="showDialog" :header="isEditing ? 'Modifikasi Record Jabatan' : 'Registrasi Record Jabatan Baru'" :pt="dialogPT" :modal="true" :style="{ width: '500px' }">
            <div class="flex flex-col gap-6 py-6">
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Nomenklatur Jabatan Resmi</label>
                    <InputText v-model="form.name" placeholder="Masukkan nama jabatan lengkap..." class="w-full text-xs font-semibold p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800 focus:border-zinc-400 transition-all" />
                </div>
                
                <div class="flex flex-col gap-2">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Uraian Tugas & Fungsi</label>
                    <Textarea v-model="form.description" placeholder="Berikan rincian singkat mengenai tanggung jawab jabatan ini..." rows="5" class="w-full text-xs font-medium p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 focus:ring-2 focus:ring-zinc-100 dark:focus:ring-zinc-800 focus:border-zinc-400 transition-all" />
                </div>
            </div>
            <template #footer>
                <div class="flex items-center justify-end gap-3 w-full border-t border-zinc-100 dark:border-zinc-900 pt-6">
                    <Button label="Batalkan" class="text-xs font-bold text-zinc-400 hover:text-zinc-600 bg-transparent border-0 px-4" @click="closeDialog" />
                    <Button :label="isEditing ? 'Simpan Perubahan' : 'Finalisasi Registrasi'" class="text-xs font-bold bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 px-8 py-3 rounded-xl border-0 shadow-xl" :loading="submitting" @click="saveData" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteDialog" header="Otorisasi Penghapusan" :pt="dialogPT" :modal="true" :style="{ width: '380px' }">
            <div class="py-6 flex flex-col items-center text-center gap-4">
                <div class="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center border border-red-100 dark:border-red-900/50">
                    <i class="pi pi-shield-exclamation text-xl text-red-500"></i>
                </div>
                <div class="flex flex-col gap-1">
                    <p class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Konfirmasi Tindakan</p>
                    <p class="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed px-4 italic">
                        Menghapus record "{{ selectedItem?.name }}" akan berdampak pada relasi pangkalan data lainnya.
                    </p>
                </div>
            </div>
            <template #footer>
                <div class="flex flex-col gap-2 w-full pt-4">
                    <Button label="Ya, Konfirmasi Hapus" class="w-full text-[10px] font-black uppercase tracking-widest bg-red-500 text-white border-0 py-3 rounded-xl shadow-lg shadow-red-500/20" :loading="deleting" @click="deleteData" />
                    <Button label="Batalkan Otorisasi" class="w-full text-[10px] font-bold text-zinc-400 bg-transparent border-0 py-2" @click="deleteDialog = false" />
                </div>
            </template>
        </Dialog>

    </div>
</template>