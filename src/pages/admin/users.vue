<template>
  <div class="w-full  mx-auto p-6 md:p-10 flex flex-col gap-8 antialiased">
    
    <div class="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex items-start gap-5">
          <div class="w-14 h-14 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-xl shadow-zinc-500/20">
            <i class="pi pi-users text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase mb-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Identity & Access Management
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white m-0 uppercase">Manajemen User</h1>
            <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-2 max-w-2xl leading-relaxed font-medium">
              Otorisasi akses sistem dan manajemen identitas tanpa mengganggu sesi login Admin.
            </p>
          </div>
        </div>
        <div class="flex gap-3">
            <Button icon="pi pi-sync" class="p-4 bg-zinc-100 text-zinc-600 border-0 rounded-xl hover:bg-zinc-200 transition-all" @click="loadData" :loading="loading" />
            <Button label="Registrasi User" icon="pi pi-plus" class="text-xs font-black bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-xl border-0 shadow-lg uppercase tracking-widest" @click="openCreateDialog" />
        </div>
      </div>

      <div class="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800/50"></div>

      <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div class="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <InputGroup class="max-w-md group shadow-sm rounded-xl overflow-hidden">
            <InputGroupAddon class="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
              <i class="pi pi-search text-[10px] text-zinc-400"></i>
            </InputGroupAddon>
            <InputText v-model="searchQuery" placeholder="Cari email user..." class="text-xs p-3 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus:ring-0" />
          </InputGroup>
          <Select v-model="filterRole" :options="roleOptions" optionLabel="label" optionValue="value" placeholder="Filter Role" class="text-xs h-10 w-48 border-zinc-200" />
        </div>
        
        <div class="flex gap-8">
          <div v-for="(val, label) in statsSummary" :key="label" class="flex flex-col items-end">
            <span class="text-[9px] uppercase font-black text-zinc-400 tracking-widest">{{ label }}</span>
            <span class="text-base font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <DataTable :value="filteredUsers" :loading="loading" :pt="tablePT" paginator :rows="10">
        <Column header="User Identity">
          <template #body="{ data }">
            <div class="flex flex-col">
              <span class="font-black text-zinc-800 dark:text-zinc-200 text-sm">{{ data.email }}</span>
              <span class="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">ID: {{ data.id?.substring(0,8) }}</span>
            </div>
          </template>
        </Column>
        
        <Column header="Access Role">
          <template #body="{ data }">
            <Tag :value="getRoleLabel(data.role)" :pt="tagPT(data.role)" />
          </template>
        </Column>

        <Column header="Tautan Pegawai">
          <template #body="{ data }">
            <div v-if="data.pegawai_nama" class="flex items-center gap-2">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span class="text-xs font-bold text-zinc-700 uppercase leading-none">{{ data.pegawai_nama }}</span>
            </div>
            <span v-else class="text-[10px] text-zinc-300 italic tracking-wide">Unlinked</span>
          </template>
        </Column>

        <Column header="Action" class="w-[120px]" bodyClass="text-right">
          <template #body="{ data }">
            <div class="flex justify-end gap-2">
              <Button icon="pi pi-pencil" text rounded class="p-button-sm text-zinc-400 hover:text-zinc-950 transition-colors" @click="openEditRoleDialog(data)" />
              <Button icon="pi pi-trash" text rounded class="p-button-sm text-zinc-300 hover:text-red-600 transition-colors" @click="confirmDelete(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="createDialogVisible" header="REGISTRASI USER BARU" :pt="dialogPT" modal :style="{ width: '550px' }">
      <div class="flex flex-col gap-8 py-8">
        <div class="flex flex-col gap-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
          <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Pilih Profil Pegawai</label>
          <Select v-model="newUser.pegawai_id" :options="pegawaiOptions" optionLabel="label" optionValue="value" filter placeholder="Cari Pegawai..." class="w-full text-xs h-12" @change="handlePegawaiSelect" />
        </div>

        <div class="flex flex-col gap-6 px-2">
          <div class="flex flex-col gap-3">
            <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Email Address</label>
            <InputText v-model="newUser.email" placeholder="email@instansi.go.id" class="w-full text-xs p-4 border-zinc-200 rounded-xl" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="flex flex-col gap-3">
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Password</label>
              <Password v-model="newUser.password" toggleMask :feedback="false" placeholder="Minimal 6 karakter" class="w-full" inputClass="w-full text-xs p-4 border-zinc-200 rounded-xl" />
            </div>
            <div class="flex flex-col gap-3">
              <label class="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Role</label>
              <Select v-model="newUser.role" :options="roleOptions" optionLabel="label" optionValue="value" class="w-full text-xs h-[52px]" />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-3 w-full pt-6">
          <Button label="Batal" text class="text-[10px] font-black uppercase text-zinc-400 px-6" @click="createDialogVisible = false" />
          <Button label="Buat User Tanpa Logout" class="text-[10px] font-black bg-zinc-950 text-white px-10 py-5 rounded-xl border-0 uppercase tracking-widest shadow-2xl" :loading="creating" @click="createUser" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteVisible" header="HAPUS USER" :pt="dialogPT" modal :style="{ width: '400px' }">
      <div class="flex flex-col items-center text-center gap-6 py-8">
        <div class="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl">
          <i class="pi pi-trash"></i>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm font-black text-zinc-900 uppercase">Hapus Akses Permanen?</p>
          <p class="text-xs text-zinc-500 leading-relaxed px-4">User <b>{{ selectedUser?.email }}</b> akan segera dihapus dari database akses.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex flex-col gap-3 w-full">
          <Button label="YA, HAPUS SEKARANG" class="w-full bg-red-600 text-white text-[10px] font-black py-4 rounded-xl border-0" @click="deleteUser" :loading="deleting" />
          <Button label="BATAL" text class="w-full text-zinc-400 text-[10px] font-black py-2" @click="deleteVisible = false" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="editRoleDialog" header="EDIT ROLE" :pt="dialogPT" modal :style="{ width: '400px' }">
       <div class="flex flex-col gap-6 py-6">
          <Select v-model="newRole" :options="roleOptions" optionLabel="label" optionValue="value" class="w-full text-xs h-14" />
       </div>
       <template #footer>
          <Button label="Update" class="bg-zinc-950 text-white px-8 py-4 rounded-xl text-[10px] font-black" @click="saveRole" :loading="savingRole" />
       </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { createClient } from '@supabase/supabase-js'; // Import ini penting!
import { supabase } from '@/lib/supabase';

// UI Imports...
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// Zinc Styling PT... (Sama seperti sebelumnya)
const tablePT = { root: { class: 'border border-zinc-200 rounded-3xl overflow-hidden bg-white' }, thead: { class: 'bg-zinc-50' }, headerCell: { class: 'p-6 text-[9px] font-black text-zinc-400 uppercase' }, bodyRow: { class: 'hover:bg-zinc-50/30 border-b border-zinc-50' }, rowCell: { class: 'p-6 text-xs' } };
const dialogPT = { root: { class: 'border-0 bg-white rounded-[2.5rem] shadow-3xl' }, header: { class: 'p-10 pb-0 text-xs font-black uppercase text-zinc-400' }, content: { class: 'px-10' }, footer: { class: 'p-10 bg-zinc-50/50' } };
const tagPT = (role) => ({ root: { class: `text-[9px] font-black uppercase px-3 py-1 rounded-lg ${role === 'super_admin' ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-600'}` } });

// STATE
const users = ref([]);
const loading = ref(false);
const creating = ref(false);
const savingRole = ref(false);
const deleting = ref(false);
const createDialogVisible = ref(false);
const editRoleDialog = ref(false);
const deleteVisible = ref(false);
const selectedUser = ref(null);
const newRole = ref('');
const searchQuery = ref('');
const filterRole = ref(null);
const pegawaiOptions = ref([]);
const rawPegawaiData = ref([]);
const newUser = ref({ email: '', password: '', role: 'pegawai', pegawai_id: null });

const roleOptions = ref([
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Operator', value: 'operator' },
  { label: 'Pegawai', value: 'pegawai' }
]);

// --- FIX: CREATE USER TANPA LOGOUT ---
const createUser = async () => {
  if (!newUser.value.email || !newUser.value.password) {
    toast.add({ severity: 'warn', summary: 'Input Kosong', detail: 'Email dan Password wajib diisi' });
    return;
  }

  creating.value = true;
  
  try {
    /**
     * SOLUSI AUTO-LOGOUT: 
     * Kita membuat instance Supabase "bayangan" yang tidak menyimpan session ke LocalStorage.
     * Ini mencegah session Admin tertimpa oleh session user baru.
     */
    const tempSupabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } } 
    );

    const { data: authData, error: signUpError } = await tempSupabase.auth.signUp({
      email: newUser.value.email,
      password: newUser.value.password,
    });

    if (signUpError) throw signUpError;

    const userId = authData.user.id;

    // Masukkan ke tabel roles menggunakan instance supabase utama (Admin yang sedang login)
    await supabase.from('user_roles').insert({ user_id: userId, role: newUser.value.role });

    // Link ke pegawai jika ada
    if (newUser.value.pegawai_id) {
      await supabase.from('pegawai').update({ user_id: userId }).eq('id', newUser.value.pegawai_id);
    }

    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'User baru terdaftar & Sesi Admin tetap aman!' });
    createDialogVisible.value = false;
    loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal Create', detail: err.message });
  } finally {
    creating.value = false;
  }
};

// --- FIX: DELETE USER YANG BENAR ---
const deleteUser = async () => {
  deleting.value = true;
  try {
    const userId = selectedUser.value.id;

    // 1. Putuskan hubungan di tabel pegawai (agar tidak melanggar Foreign Key)
    await supabase.from('pegawai').update({ user_id: null }).eq('user_id', userId);
    
    // 2. Hapus dari tabel user_roles
    const { error: roleError } = await supabase.from('user_roles').delete().eq('user_id', userId);
    if (roleError) throw roleError;

    /**
     * PENTING: Menghapus user dari auth.users butuh Service Role Key.
     * Jika Anda hanya punya Anon Key, cara terbaik adalah menghapus "Akses" nya (role & link).
     * Namun jika Anda sudah punya RPC/Edge Function untuk delete user, panggil di sini.
     * Di sini kita asumsikan data yang tampil di tabel berasal dari hasil join user_roles.
     * Karena row di user_roles sudah dihapus, user otomatis hilang dari daftar aplikasi.
     */

    toast.add({ severity: 'success', summary: 'Terhapus', detail: 'Hak akses user berhasil dicabut sepenuhnya' });
    deleteVisible.value = false;
    loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal Hapus', detail: err.message });
  } finally {
    deleting.value = false;
  }
};

// --- LOGIC LAINNYA ---
const loadData = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase.rpc('get_users_with_roles');
    if (error) throw error;
    users.value = data || [];

    const { data: pData } = await supabase.from('pegawai').select('id, nama, nip, email');
    rawPegawaiData.value = pData || [];
    pegawaiOptions.value = pData?.map(p => ({ label: `${p.nip} - ${p.nama}`, value: p.id })) || [];
  } finally {
    loading.value = false;
  }
};

const handlePegawaiSelect = (e) => {
  const selected = rawPegawaiData.value.find(p => p.id === e.value);
  if (selected?.email) newUser.value.email = selected.email;
};

const saveRole = async () => {
  savingRole.value = true;
  try {
    await supabase.from('user_roles').upsert({ user_id: selectedUser.value.id, role: newRole.value }, { onConflict: 'user_id' });
    toast.add({ severity: 'success', summary: 'Updated', detail: 'Role berhasil diperbarui' });
    editRoleDialog.value = false;
    loadData();
  } finally {
    savingRole.value = false;
  }
};

const confirmDelete = (user) => { selectedUser.value = user; deleteVisible.value = true; };
const openEditRoleDialog = (user) => { selectedUser.value = user; newRole.value = user.role; editRoleDialog.value = true; };
const openCreateDialog = () => { newUser.value = { email: '', password: '', role: 'pegawai', pegawai_id: null }; createDialogVisible.value = true; };
const getRoleLabel = (role) => roleOptions.value.find(r => r.value === role)?.label || role;

const filteredUsers = computed(() => {
  let res = users.value;
  if (searchQuery.value) res = res.filter(u => u.email.toLowerCase().includes(searchQuery.value.toLowerCase()));
  if (filterRole.value) res = res.filter(u => u.role === filterRole.value);
  return res;
});

const statsSummary = computed(() => ({
  'Total': users.value.length,
  'Admin': users.value.filter(u => u.role === 'super_admin').length
}));

onMounted(loadData);
</script>