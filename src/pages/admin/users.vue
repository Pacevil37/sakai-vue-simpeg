<template>
  <div class="users-page">
    <!-- Header -->
    <div class="users-header">
      <div class="users-header-content">
        <div class="users-header-icon">
          <i class="pi pi-users"></i>
        </div>
        <div>
          <h1 class="users-title">Manajemen User</h1>
          <p class="users-subtitle">Kelola pengguna, role akses, dan tautan ke pegawai</p>
        </div>
      </div>
      <div class="users-header-actions">
        <InputGroup class="search-input">
          <InputGroupAddon>
            <i class="pi pi-search"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari email..." />
        </InputGroup>
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
        <Button label="Tambah User" icon="pi pi-plus" @click="openCreateDialog" />
      </div>
    </div>

    <!-- Filter role -->
    <div class="users-filters">
      <div class="filter-item">
        <label>Role</label>
        <Select
          v-model="filterRole"
          :options="roleOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Semua role"
          clearable
        />
      </div>
      <div class="filter-item">
        <Button label="Terapkan Filter" icon="pi pi-filter" @click="applyFilters" />
        <Button label="Reset" icon="pi pi-times" severity="secondary" outlined @click="resetFilters" />
      </div>
    </div>

    <!-- Statistik -->
    <div class="stats-grid">
      <div class="stat-card bg-blue-50">
        <div class="stat-icon"><i class="pi pi-users"></i></div>
        <div class="stat-info">
          <span class="stat-label">Total User</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
      <div class="stat-card bg-green-50">
        <div class="stat-icon"><i class="pi pi-check-circle"></i></div>
        <div class="stat-info">
          <span class="stat-label">Terverifikasi</span>
          <span class="stat-value">{{ stats.verified }}</span>
        </div>
      </div>
      <div class="stat-card bg-purple-50">
        <div class="stat-icon"><i class="pi pi-shield"></i></div>
        <div class="stat-info">
          <span class="stat-label">Super Admin</span>
          <span class="stat-value">{{ stats.superAdmin }}</span>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="users-table-wrap">
      <DataTable
        :value="filteredUsers"
        :loading="loading"
        paginator
        :rows="10"
        class="users-datatable"
      >
        <Column field="email" header="Email" sortable />
        <Column field="role" header="Role" sortable>
          <template #body="{ data }">
            <Tag :value="getRoleLabel(data.role)" :severity="getRoleSeverity(data.role)" />
          </template>
        </Column>
        <Column field="email_confirmed_at" header="Status Verifikasi">
          <template #body="{ data }">
            <Tag
              :value="data.email_confirmed_at ? 'Terverifikasi' : 'Belum Verifikasi'"
              :severity="data.email_confirmed_at ? 'success' : 'warning'"
            />
          </template>
        </Column>
        <Column field="pegawai_nama" header="Tautan Pegawai">
          <template #body="{ data }">
            <span v-if="data.pegawai_nama" class="text-primary">{{ data.pegawai_nama }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </Column>
        <Column field="created_at" header="Bergabung">
          <template #body="{ data }">
            {{ formatDate(data.created_at) }}
          </template>
        </Column>
        <Column header="Aksi" :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <Button
              icon="pi pi-pencil"
              severity="warning"
              size="small"
              @click="openEditRoleDialog(data)"
              v-tooltip.top="'Edit Role'"
            />
          </template>
        </Column>
        <template #empty>
          <div class="text-center py-4">Belum ada data user.</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Create User -->
    <Dialog
      v-model:visible="createDialogVisible"
      header="Tambah User Baru"
      :style="{ width: '500px' }"
      modal
      :closable="!creating"
    >
      <div class="field">
        <label>Email <span class="text-red-500">*</span></label>
        <InputText v-model="newUser.email" type="email" required />
        <small class="text-gray-500">Email akan digunakan untuk login</small>
      </div>
      <div class="field">
        <label>Password <span class="text-red-500">*</span></label>
        <InputText v-model="newUser.password" type="password" />
      </div>
      <div class="field">
        <label>Role <span class="text-red-500">*</span></label>
        <Select v-model="newUser.role" :options="roleOptions" optionLabel="label" optionValue="value" />
      </div>
      <div class="field" v-if="newUser.role === 'pegawai'">
        <label>Tautan Pegawai (opsional)</label>
        <Select
          v-model="newUser.pegawai_id"
          :options="pegawaiOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih pegawai"
          clearable
        />
        <small class="text-gray-500">Hubungkan user ini dengan data pegawai yang sudah ada</small>
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="createDialogVisible = false" :disabled="creating" />
        <Button label="Buat User" @click="createUser" :loading="creating" />
      </template>
    </Dialog>

    <!-- Dialog Edit Role -->
    <Dialog
      v-model:visible="editRoleDialog"
      header="Ubah Role User"
      :style="{ width: '400px' }"
      modal
    >
      <div class="field">
        <label>User</label>
        <InputText :value="selectedUser?.email" disabled class="w-full" />
      </div>
      <div class="field">
        <label>Role <span class="text-red-500">*</span></label>
        <Select
          v-model="newRole"
          :options="roleOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Pilih role"
          class="w-full"
        />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="editRoleDialog = false" />
        <Button label="Simpan" @click="saveRole" :loading="savingRole" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// State
const users = ref([]);
const loading = ref(false);
const savingRole = ref(false);
const editRoleDialog = ref(false);
const selectedUser = ref(null);
const newRole = ref('');
const createDialogVisible = ref(false);
const creating = ref(false);
const newUser = ref({ email: '', password: '', role: 'pegawai', pegawai_id: null });
const pegawaiOptions = ref([]);

// Filter
const searchQuery = ref('');
const filterRole = ref(null);

// Options
const roleOptions = ref([
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Admin Kepegawaian', value: 'admin_kepegawaian' },
  { label: 'Pegawai', value: 'pegawai' }
]);

// Statistik
const stats = computed(() => {
  const total = users.value.length;
  const verified = users.value.filter(u => u.email_confirmed_at).length;
  const superAdmin = users.value.filter(u => u.role === 'super_admin').length;
  return { total, verified, superAdmin };
});

// Filtered users
const filteredUsers = computed(() => {
  let result = users.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(u => u.email.toLowerCase().includes(q));
  }
  if (filterRole.value) {
    result = result.filter(u => u.role === filterRole.value);
  }
  return result;
});

// Helper
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

const getRoleLabel = (role) => {
  const map = {
    super_admin: 'Super Admin',
    admin_kepegawaian: 'Admin Kepegawaian',
    pegawai: 'Pegawai'
  };
  return map[role] || role;
};

const getRoleSeverity = (role) => {
  switch (role) {
    case 'super_admin': return 'danger';
    case 'admin_kepegawaian': return 'success';
    case 'pegawai': return 'info';
    default: return 'secondary';
  }
};

// Load data via RPC
const loadData = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase.rpc('get_users_with_roles');
    if (error) throw error;
    users.value = data || [];
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};

const loadPegawaiOptions = async () => {
  const { data, error } = await supabase.from('pegawai').select('id, nama, nip');
  if (!error) {
    pegawaiOptions.value = data.map(p => ({ label: `${p.nip} - ${p.nama}`, value: p.id }));
  }
};

// Create user dengan validasi rate limit
const openCreateDialog = () => {
  newUser.value = { email: '', password: '', role: 'pegawai', pegawai_id: null };
  createDialogVisible.value = true;
};

const createUser = async () => {
  if (!newUser.value.email || !newUser.value.password) {
    toast.add({ severity: 'warn', summary: 'Validasi', detail: 'Email dan password wajib diisi', life: 3000 });
    return;
  }
  creating.value = true;
  try {
    // Cek apakah email sudah terdaftar di auth.users (via RPC atau tabel users)
    // Kita bisa menggunakan supabase.auth admin API atau query ke tabel users (perlu RLS)
    // Alternatif: coba signUp, jika email sudah ada, akan error dengan message 'User already registered'
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: newUser.value.email,
      password: newUser.value.password,
      options: { data: { role: newUser.value.role } }
    });
    if (signUpError) {
      if (signUpError.message.includes('rate limit')) {
        toast.add({ severity: 'error', summary: 'Terlalu banyak percobaan', detail: 'Coba lagi setelah beberapa menit.', life: 5000 });
      } else if (signUpError.message.includes('already registered')) {
        toast.add({ severity: 'error', summary: 'Email sudah terdaftar', detail: 'Gunakan email lain.', life: 3000 });
      } else {
        throw signUpError;
      }
      return;
    }
    const userId = authData.user.id;

    // Insert role ke user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role: newUser.value.role });
    if (roleError) throw roleError;

    // Jika role pegawai dan dipilih pegawai_id, update kolom user_id di tabel pegawai
    if (newUser.value.role === 'pegawai' && newUser.value.pegawai_id) {
      const { error: updateError } = await supabase
        .from('pegawai')
        .update({ user_id: userId })
        .eq('id', newUser.value.pegawai_id);
      if (updateError) throw updateError;
    }

    toast.add({ severity: 'success', summary: 'Berhasil', detail: `User ${newUser.value.email} telah dibuat`, life: 3000 });
    createDialogVisible.value = false;
    await loadData(); // refresh daftar user
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    creating.value = false;
  }
};

const applyFilters = () => {};
const resetFilters = () => {
  searchQuery.value = '';
  filterRole.value = null;
};

// Edit role
const openEditRoleDialog = (user) => {
  selectedUser.value = user;
  newRole.value = user.role;
  editRoleDialog.value = true;
};

const saveRole = async () => {
  if (!selectedUser.value || !newRole.value) return;
  savingRole.value = true;
  try {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: selectedUser.value.id, role: newRole.value }, { onConflict: 'user_id' });
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Role user diperbarui', life: 3000 });
    editRoleDialog.value = false;
    await loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    savingRole.value = false;
  }
};

onMounted(() => {
  loadData();
  loadPegawaiOptions();
});
</script>

<style scoped>
/* (style sama seperti sebelumnya) */
.users-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem;
}
.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: white;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}
.users-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.users-header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.users-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.users-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}
.users-header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.search-input {
  min-width: 250px;
}
.users-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  background: white;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
  align-items: flex-end;
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.filter-item label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}
.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: rgba(59,130,246,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
.stat-info {
  flex: 1;
}
.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #475569;
  display: block;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}
.users-table-wrap {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 1rem;
}
.users-datatable {
  width: 100%;
}
.users-datatable :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.75rem 1rem;
}
.users-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}
.users-datatable :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}
.field {
  margin-bottom: 1rem;
}
.field label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: #334155;
}
.p-error {
  color: #ef4444;
  font-size: 0.75rem;
}
.text-red-500 { color: #ef4444; }
@media (max-width: 640px) {
  .users-page { padding: 1rem; }
  .users-header { flex-direction: column; align-items: stretch; }
  .search-input { width: 100%; }
  .users-filters { flex-direction: column; align-items: stretch; }
}
</style>