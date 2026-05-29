<script setup>
import { ref, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Password from 'primevue/password';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import userService from '@/services/userService';
import pegawaiService from '@/services/pegawaiService';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    userData: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['update:visible', 'success']);

const toast = useToast();

const loading = ref(false);
const errors = ref({});
const pegawaiInputMode = ref('existing'); // 'existing' or 'new'
const activeTabIndex = ref(0);

const formData = ref({
    username: '',
    email: '',
    phone: '',
    role: null,
    status: 'active',
    password: '',
    address: '',
    pegawai_id: null,
    pegawaiData: {
        nip: '',
        nama_lengkap: '',
        tempat_lahir: '',
        no_hp: '',
        jabatan: '',
        unit_kerja: '',
        alamat: ''
    }
});

const pegawaiOptions = ref([]);
const loadingPegawai = ref(false);

const roleOptions = ref([
    { label: 'Super Admin', value: 'superadmin' },
    { label: 'Admin', value: 'admin' },
    { label: 'Operator', value: 'operator' },
    { label: 'Pegawai', value: 'pegawai' }
]);

const statusOptions = ref([
    { label: 'Aktif', value: 'active' },
    { label: 'Non-Aktif', value: 'inactive' }
]);

const isEdit = computed(() => !!props.userData);

const resetForm = () => {
    formData.value = {
        username: '',
        email: '',
        phone: '',
        role: null,
        status: 'active',
        password: '',
        address: '',
        pegawai_id: null,
        pegawaiData: {
            nip: '',
            nama_lengkap: '',
            tempat_lahir: '',
            no_hp: '',
            jabatan: '',
            unit_kerja: '',
            alamat: ''
        }
    };
    pegawaiInputMode.value = 'existing';
    errors.value = {};
};

// Watch for userData changes to populate form
watch(
    () => props.userData,
    (newData) => {
        if (newData) {
            formData.value = {
                username: newData.username || '',
                email: newData.email || '',
                phone: newData.phone || '',
                role: newData.role_name || newData.role || null,
                status: newData.status || 'active',
                password: '',
                address: newData.address || '',
                pegawai_id: newData.pegawai_id || null,
                pegawaiData: {
                    nip: '',
                    nama_lengkap: '',
                    tempat_lahir: '',
                    no_hp: '',
                    jabatan: '',
                    unit_kerja: '',
                    alamat: ''
                }
            };
            // If editing and has pegawai_id, use existing mode
            if (newData.pegawai_id) {
                pegawaiInputMode.value = 'existing';
            }
        } else {
            resetForm();
        }
    },
    { immediate: true }
);

// Auto-switch tab berdasarkan role
watch(
    () => formData.value.role,
    (newRole) => {
        activeTabIndex.value = newRole === 'pegawai' ? 1 : 0;
    }
);

const validateForm = () => {
    errors.value = {};

    if (!formData.value.username.trim()) {
        errors.value.username = 'Username harus diisi';
    }

    if (!formData.value.email.trim()) {
        errors.value.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errors.value.email = 'Format email tidak valid';
    }

    if (!formData.value.role) {
        errors.value.role = 'Role harus dipilih';
    }

    // Validate pegawai when role is 'pegawai'
    if (formData.value.role === 'pegawai') {
        if (pegawaiInputMode.value === 'existing') {
            if (!formData.value.pegawai_id) {
                errors.value.pegawai_id = 'Pegawai harus dipilih untuk role pegawai';
            }
        } else if (pegawaiInputMode.value === 'new') {
            if (!formData.value.pegawaiData.nama_lengkap || !formData.value.pegawaiData.nama_lengkap.trim()) {
                errors.value.pegawai_nama_lengkap = 'Nama lengkap pegawai harus diisi';
            }
        }
    }

    if (!formData.value.status) {
        errors.value.status = 'Status harus dipilih';
    }

    if (!isEdit.value && !formData.value.password) {
        errors.value.password = 'Password harus diisi';
    }

    return Object.keys(errors.value).length === 0;
};

const onSubmit = async () => {
    if (!validateForm()) {
        // Pindah tab sesuai error agar tidak terasa "tidak berfungsi"
        const errorKeys = Object.keys(errors.value);
        const userTabErrors = ['username', 'email', 'role', 'status', 'password'];
        const pegawaiTabErrors = ['pegawai_id', 'pegawai_nama_lengkap'];

        if (errorKeys.some((k) => userTabErrors.includes(k))) {
            activeTabIndex.value = 0; // Akun Pengguna
        } else if (errorKeys.some((k) => pegawaiTabErrors.includes(k))) {
            activeTabIndex.value = 1; // Data Pegawai
        }

        toast.add({
            severity: 'warn',
            summary: 'Validasi',
            detail: 'Lengkapi data yang wajib diisi sebelum menyimpan.',
            life: 3000
        });
        return;
    }

    try {
        loading.value = true;

        const submitData = { ...formData.value };

        // Convert role string to role_id for backend
        const roleMapping = {
            superadmin: 4,
            admin: 2,
            operator: 3,
            pegawai: 1
        };
        submitData.role_id = roleMapping[submitData.role];
        delete submitData.role; // Remove the string role

        // Handle pegawai data based on input mode
        if (submitData.role_id === 1) {
            // role is 'pegawai'
            if (pegawaiInputMode.value === 'new') {
                // Include pegawaiData in request, remove pegawai_id
                submitData.pegawaiData = { ...formData.value.pegawaiData };
                // Email will be automatically set from user email if not provided
                if (!submitData.pegawaiData.email && submitData.email) {
                    submitData.pegawaiData.email = submitData.email;
                }
                delete submitData.pegawai_id; // Remove pegawai_id when creating new pegawai
            } else {
                // Remove pegawaiData when using existing pegawai
                delete submitData.pegawaiData;
            }
        } else {
            // Remove both if role is not pegawai
            delete submitData.pegawai_id;
            delete submitData.pegawaiData;
        }

        // Remove password from update if empty
        if (isEdit.value && !submitData.password) {
            delete submitData.password;
        }

        // Log data before sending
        console.log('Submitting user data:', JSON.stringify(submitData, null, 2));

        if (isEdit.value) {
            await userService.updateUser(props.userData.id, submitData);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'User berhasil diperbarui',
                life: 3000
            });
        } else {
            const response = await userService.createUser(submitData);
            console.log('User created successfully:', response);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: response?.data?.message || 'User berhasil ditambahkan',
                life: 3000
            });
        }

        emit('success');
        onHide();
    } catch (error) {
        console.error('API error:', error);
        console.error('Error response:', error?.response?.data);
        console.error('Error status:', error?.response?.status);

        // Extract error message
        let errorMessage = 'Gagal simpan user';
        if (error?.response?.data) {
            if (error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            }
        } else if (error?.message) {
            errorMessage = error.message;
        }

        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: errorMessage,
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

const onHide = () => {
    emit('update:visible', false);
    resetForm();
};

const onRoleChange = () => {
    // Reset pegawai data when role changes
    if (formData.value.role !== 'pegawai') {
        formData.value.pegawai_id = null;
        formData.value.pegawaiData = {
            nip: '',
            nama_lengkap: '',
            tempat_lahir: '',
            no_hp: '',
            jabatan: '',
            unit_kerja: '',
            alamat: ''
        };
        pegawaiInputMode.value = 'existing';
    }
    // Load pegawai options when role is 'pegawai' and mode is 'existing'
    if (formData.value.role === 'pegawai' && pegawaiInputMode.value === 'existing') {
        loadPegawaiOptions();
    }
};

const onPegawaiInputModeChange = () => {
    // Reset pegawai data when mode changes
    if (pegawaiInputMode.value === 'existing') {
        formData.value.pegawai_id = null;
        // Load pegawai options
        loadPegawaiOptions();
    } else {
        // Clear pegawaiData when switching to new mode
        formData.value.pegawaiData = {
            nip: '',
            nama_lengkap: '',
            tempat_lahir: '',
            no_hp: '',
            jabatan: '',
            unit_kerja: '',
            alamat: ''
        };
    }
};

// Load pegawai options on component mount if role is pegawai and mode is existing
watch(
    () => [formData.value.role, pegawaiInputMode.value],
    ([newRole, newMode]) => {
        if (newRole === 'pegawai' && newMode === 'existing' && pegawaiOptions.value.length === 0) {
            loadPegawaiOptions();
        }
    }
);

const loadPegawaiOptions = async () => {
    try {
        loadingPegawai.value = true;
        const response = await pegawaiService.getPegawai({ page: 1, limit: 1000 }); // Load all pegawai

        // Handle different response structures
        let pegawaiData = [];
        if (response && response.data) {
            // If response.data is an array
            if (Array.isArray(response.data)) {
                pegawaiData = response.data;
            }
            // If response.data has a data property (nested structure)
            else if (response.data.data && Array.isArray(response.data.data)) {
                pegawaiData = response.data.data;
            }
        }

        // Filter out pegawai that already have user accounts
        const availablePegawai = pegawaiData.filter((pegawai) => !pegawai.has_user_account);
        pegawaiOptions.value = availablePegawai;
    } catch (error) {
        console.error('Error loading pegawai options:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data pegawai',
            life: 3000
        });
    } finally {
        loadingPegawai.value = false;
    }
};
</script>

<template>
    <Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :style="{ width: '600px' }" :header="isEdit ? 'Edit User' : 'Tambah User Baru'" :modal="true" :closable="true" @hide="onHide">
        <form @submit.prevent="onSubmit" class="p-fluid">
            <TabView v-model:activeIndex="activeTabIndex">
                <TabPanel header="Akun Pengguna">
                    <div class="grid">
                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="username" class="block text-sm font-medium mb-2"> Username <span class="text-red-500">*</span> </label>
                                <InputText id="username" v-model="formData.username" :class="{ 'p-invalid': errors.username }" placeholder="Masukkan username" />
                                <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="email" class="block text-sm font-medium mb-2"> Email <span class="text-red-500">*</span> </label>
                                <InputText id="email" v-model="formData.email" type="email" :class="{ 'p-invalid': errors.email }" placeholder="Masukkan email" />
                                <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="phone" class="block text-sm font-medium mb-2"> Nomor Telepon </label>
                                <InputText id="phone" v-model="formData.phone" placeholder="Masukkan nomor telepon" />
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="role" class="block text-sm font-medium mb-2"> Role <span class="text-red-500">*</span> </label>
                                <Select id="role" v-model="formData.role" :options="roleOptions" optionLabel="label" optionValue="value" :class="{ 'p-invalid': errors.role }" placeholder="Pilih role" @change="onRoleChange" />
                                <small v-if="errors.role" class="p-error">{{ errors.role }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6">
                            <div class="field">
                                <label for="status" class="block text-sm font-medium mb-2"> Status <span class="text-red-500">*</span> </label>
                                <Select id="status" v-model="formData.status" :options="statusOptions" optionLabel="label" optionValue="value" :class="{ 'p-invalid': errors.status }" placeholder="Pilih status" />
                                <small v-if="errors.status" class="p-error">{{ errors.status }}</small>
                            </div>
                        </div>

                        <div class="col-12 md:col-6" v-if="!isEdit">
                            <div class="field">
                                <label for="password" class="block text-sm font-medium mb-2"> Password <span class="text-red-500">*</span> </label>
                                <Password id="password" v-model="formData.password" :class="{ 'p-invalid': errors.password }" placeholder="Masukkan password" :feedback="false" toggleMask />
                                <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="field">
                                <label for="address" class="block text-sm font-medium mb-2"> Alamat </label>
                                <Textarea id="address" v-model="formData.address" rows="3" placeholder="Masukkan alamat lengkap" />
                            </div>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel v-if="formData.role === 'pegawai'" header="Data Pegawai">
                    <div class="field">
                        <div class="flex align-items-center mb-3">
                            <label class="block text-sm font-medium mr-3"> Mode Input Pegawai: </label>
                            <div class="flex align-items-center">
                                <input type="radio" id="pegawai_existing" value="existing" v-model="pegawaiInputMode" @change="onPegawaiInputModeChange" class="mr-2" />
                                <label for="pegawai_existing" class="mr-4">Pilih Pegawai yang Ada</label>
                                <input type="radio" id="pegawai_new" value="new" v-model="pegawaiInputMode" @change="onPegawaiInputModeChange" class="mr-2" />
                                <label for="pegawai_new">Buat Pegawai Baru</label>
                            </div>
                        </div>

                        <div v-if="pegawaiInputMode === 'existing'" class="field">
                            <label for="pegawai_id" class="block text-sm font-medium mb-2"> Pegawai <span class="text-red-500">*</span> </label>
                            <Select
                                id="pegawai_id"
                                v-model="formData.pegawai_id"
                                :options="pegawaiOptions"
                                optionLabel="nama_lengkap"
                                optionValue="id"
                                :class="{ 'p-invalid': errors.pegawai_id }"
                                placeholder="Pilih pegawai"
                                :loading="loadingPegawai"
                                filter
                            />
                            <small v-if="errors.pegawai_id" class="p-error">{{ errors.pegawai_id }}</small>
                            <small class="text-gray-500">Pilih pegawai yang akan di-link dengan user account ini</small>
                        </div>

                        <div v-if="pegawaiInputMode === 'new'" class="field">
                            <div class="border-round p-3 mb-3" style="background-color: #f8f9fa">
                                <h4 class="text-lg font-semibold mb-3">Data Pegawai Baru</h4>

                                <div class="grid">
                                    <!-- Akun untuk Pegawai Baru -->
                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="pegawai_username" class="block text-sm font-medium mb-2"> Username Akun <span class="text-red-500">*</span> </label>
                                            <InputText id="pegawai_username" v-model="formData.username" :class="{ 'p-invalid': errors.username }" placeholder="Masukkan username" />
                                            <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6" v-if="!isEdit">
                                        <div class="field">
                                            <label for="pegawai_password" class="block text-sm font-medium mb-2"> Password Akun <span class="text-red-500">*</span> </label>
                                            <Password id="pegawai_password" v-model="formData.password" :class="{ 'p-invalid': errors.password }" placeholder="Masukkan password" :feedback="false" toggleMask />
                                            <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="pegawai_nip" class="block text-sm font-medium mb-2"> NIP </label>
                                            <InputText id="pegawai_nip" v-model="formData.pegawaiData.nip" placeholder="Masukkan NIP" />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="pegawai_nama_lengkap" class="block text-sm font-medium mb-2"> Nama Lengkap <span class="text-red-500">*</span> </label>
                                            <InputText id="pegawai_nama_lengkap" v-model="formData.pegawaiData.nama_lengkap" :class="{ 'p-invalid': errors.pegawai_nama_lengkap }" placeholder="Masukkan nama lengkap" />
                                            <small v-if="errors.pegawai_nama_lengkap" class="p-error">{{ errors.pegawai_nama_lengkap }}</small>
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="pegawai_tempat_lahir" class="block text-sm font-medium mb-2"> Tempat Lahir </label>
                                            <InputText id="pegawai_tempat_lahir" v-model="formData.pegawaiData.tempat_lahir" placeholder="Masukkan tempat lahir" />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="pegawai_no_hp" class="block text sm font-medium mb-2"> No. HP </label>
                                            <InputText id="pegawai_no_hp" v-model="formData.pegawaiData.no_hp" placeholder="Masukkan nomor HP" />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="pegawai_jabatan" class="block text-sm font-medium mb-2"> Jabatan </label>
                                            <InputText id="pegawai_jabatan" v-model="formData.pegawaiData.jabatan" placeholder="Masukkan jabatan" />
                                        </div>
                                    </div>

                                    <div class="col-12 md:col-6">
                                        <div class="field">
                                            <label for="pegawai_unit_kerja" class="block text-sm font-medium mb-2"> Unit Kerja </label>
                                            <InputText id="pegawai_unit_kerja" v-model="formData.pegawaiData.unit_kerja" placeholder="Masukkan unit kerja" />
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <div class="field">
                                            <label for="pegawai_alamat" class="block text-sm font-medium mb-2"> Alamat </label>
                                            <Textarea id="pegawai_alamat" v-model="formData.pegawaiData.alamat" rows="2" placeholder="Masukkan alamat" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </form>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" @click="onHide" severity="secondary" :disabled="loading" />
            <Button :label="loading ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'" icon="pi pi-check" @click="onSubmit" :loading="loading" :disabled="loading" />
        </template>
    </Dialog>
</template>

<style scoped>
.p-fluid .field {
    margin-bottom: 1rem;
}

.text-red-500 {
    color: #ef4444;
}
.p-fluid .field {
    margin-bottom: 1rem;
}

.text-red-500 {
    color: #ef4444;
}
</style>
