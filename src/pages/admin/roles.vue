<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import roleService from '@/services/roleService';

// Composables
const toast = useToast();
const confirm = useConfirm();

// Reactive data
const roles = ref([]);
const roleStats = ref([]);
const loading = ref(false);
const saving = ref(false);
const submitted = ref(false);
const roleDialog = ref(false);
const editingRole = ref(false);

const role = ref({
    name: '',
    description: ''
});

// Methods
const loadRoles = async () => {
    try {
        loading.value = true;
        const response = await roleService.getAllRoles();
        roles.value = response.data;
    } catch (error) {
        console.error('Error loading roles:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data role',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const loadRoleStats = async () => {
    try {
        const response = await roleService.getRoleStats();
        roleStats.value = response.data;
    } catch (error) {
        console.error('Error loading role stats:', error);
    }
};

const openNewRoleDialog = () => {
    role.value = { name: '', description: '' };
    submitted.value = false;
    editingRole.value = false;
    roleDialog.value = true;
};

const editRole = (roleData) => {
    role.value = { ...roleData };
    editingRole.value = true;
    roleDialog.value = true;
};

const hideRoleDialog = () => {
    roleDialog.value = false;
    submitted.value = false;
};

const saveRole = async () => {
    submitted.value = true;

    if (!role.value.name || !role.value.description) {
        return;
    }

    try {
        saving.value = true;

        if (editingRole.value) {
            await roleService.updateRole(role.value.id, role.value);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Role berhasil diperbarui',
                life: 3000
            });
        } else {
            await roleService.createRole(role.value);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Role baru berhasil dibuat',
                life: 3000
            });
        }

        hideRoleDialog();
        await loadRoles();
        await loadRoleStats();
    } catch (error) {
        console.error('Error saving role:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal menyimpan role',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

const confirmDeleteRole = (roleData) => {
    confirm.require({
        message: `Apakah Anda yakin ingin menghapus role "${roleData.name}"?`,
        header: 'Konfirmasi Hapus',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Hapus',
        rejectLabel: 'Batal',
        accept: async () => {
            try {
                await roleService.deleteRole(roleData.id);
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Role berhasil dihapus',
                    life: 3000
                });
                await loadRoles();
                await loadRoleStats();
            } catch (error) {
                console.error('Error deleting role:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message || 'Gagal menghapus role',
                    life: 3000
                });
            }
        }
    });
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Lifecycle
onMounted(() => {
    loadRoles();
    loadRoleStats();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <h5>Manajemen Role</h5>
                <p>Kelola role dan akses sistem</p>

                <!-- Toolbar -->
                <div class="flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                    <Button label="Tambah Role" icon="pi pi-plus" class="p-button-primary" @click="openNewRoleDialog" />
                    <div class="flex flex-wrap gap-2">
                        <Button label="Refresh" icon="pi pi-refresh" class="p-button-secondary" @click="loadRoles" />
                    </div>
                </div>

                <!-- Role Statistics -->
                <div class="grid mb-4" v-if="roleStats.length > 0">
                    <div class="col-12 md:col-3" v-for="stat in roleStats" :key="stat.name">
                        <div class="card bg-blue-50 border-1 border-blue-200">
                            <div class="flex align-items-center">
                                <div class="flex-1">
                                    <div class="text-blue-600 font-medium">{{ stat.name }}</div>
                                    <div class="text-2xl font-bold text-blue-900">{{ stat.user_count }} pengguna</div>
                                </div>
                                <div class="text-blue-600">
                                    <i class="pi pi-users text-2xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Data Table -->
                <DataTable
                    :value="roles"
                    :loading="loading"
                    :paginator="true"
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 25, 50]"
                    tableStyle="min-width: 50rem"
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords} roles"
                    responsiveLayout="scroll"
                >
                    <template #empty>
                        <div class="text-center py-4">
                            <i class="pi pi-info-circle text-4xl text-gray-400 mb-3"></i>
                            <p class="text-gray-500">Tidak ada role ditemukan</p>
                        </div>
                    </template>

                    <Column field="id" header="ID" style="width: 10%">
                        <template #body="slotProps">
                            <span class="font-mono text-sm">{{ slotProps.data.id }}</span>
                        </template>
                    </Column>

                    <Column field="name" header="Nama Role" style="width: 25%">
                        <template #body="slotProps">
                            <div class="font-medium">{{ slotProps.data.name }}</div>
                        </template>
                    </Column>

                    <Column field="description" header="Deskripsi" style="width: 40%">
                        <template #body="slotProps">
                            <span class="text-gray-600">{{ slotProps.data.description }}</span>
                        </template>
                    </Column>

                    <Column field="created_at" header="Dibuat" style="width: 15%">
                        <template #body="slotProps">
                            <span class="text-sm text-gray-500">
                                {{ formatDate(slotProps.data.created_at) }}
                            </span>
                        </template>
                    </Column>

                    <Column header="Aksi" style="width: 10%">
                        <template #body="slotProps">
                            <div class="flex gap-1">
                                <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-info p-button-sm" @click="editRole(slotProps.data)" v-tooltip.top="'Edit Role'" />
                                <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="confirmDeleteRole(slotProps.data)" v-tooltip.top="'Hapus Role'" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>

    <!-- New/Edit Role Dialog -->
    <Dialog v-model:visible="roleDialog" :header="editingRole ? 'Edit Role' : 'Tambah Role Baru'" :modal="true" :closable="true" class="p-fluid" style="width: 450px">
        <div class="field">
            <label for="roleName" class="font-medium">Nama Role</label>
            <InputText id="roleName" v-model="role.name" :class="{ 'p-invalid': submitted && !role.name }" placeholder="Masukkan nama role" />
            <small v-if="submitted && !role.name" class="p-error">Nama role wajib diisi</small>
        </div>

        <div class="field">
            <label for="roleDescription" class="font-medium">Deskripsi</label>
            <Textarea id="roleDescription" v-model="role.description" :class="{ 'p-invalid': submitted && !role.description }" placeholder="Masukkan deskripsi role" rows="3" />
            <small v-if="submitted && !role.description" class="p-error">Deskripsi wajib diisi</small>
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="hideRoleDialog" />
            <Button :label="editingRole ? 'Update' : 'Simpan'" icon="editingRole ? 'pi pi-check' : 'pi pi-plus'" class="p-button-primary" :loading="saving" @click="saveRole" />
        </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog></ConfirmDialog>

    <!-- Toast -->
    <Toast />
</template>

<style scoped>
.card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.p-button-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
}

.font-mono {
    font-family: 'Courier New', monospace;
}
</style>
