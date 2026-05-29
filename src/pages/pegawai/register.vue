<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import pegawaiService from '@/services/pegawaiService';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import Password from 'primevue/password';
import Button from 'primevue/button';

const router = useRouter();
const toast = useToast();

// Form data
const form = ref({
    email: '',
    password: '',
    pegawaiData: {
        nip: '',
        nama_lengkap: '',
        tempat_lahir: '',
        tanggal_lahir: null,
        jenis_kelamin: '',
        agama: '',
        no_hp: '',
        alamat: '',
        jabatan: '',
        unit_kerja: '',
        pangkat_golongan: ''
    }
});

// Form validation
const errors = ref({});
const loading = ref(false);

// Options
const jenisKelaminOptions = ref([
    { label: 'Laki-laki', value: 'L' },
    { label: 'Perempuan', value: 'P' }
]);

const agamaOptions = ref([
    { label: 'Islam', value: 'Islam' },
    { label: 'Kristen', value: 'Kristen' },
    { label: 'Katolik', value: 'Katolik' },
    { label: 'Hindu', value: 'Hindu' },
    { label: 'Buddha', value: 'Buddha' },
    { label: 'Konghucu', value: 'Konghucu' }
]);

// Methods
const validateForm = () => {
    errors.value = {};

    if (!form.value.email || form.value.email.trim() === '') {
        errors.value.email = 'Email harus diisi';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.value.email)) {
            errors.value.email = 'Format email tidak valid';
        }
    }

    if (!form.value.password || form.value.password.trim() === '') {
        errors.value.password = 'Password harus diisi';
    } else if (form.value.password.length < 6) {
        errors.value.password = 'Password minimal 6 karakter';
    }

    if (!form.value.pegawaiData.nama_lengkap || form.value.pegawaiData.nama_lengkap.trim() === '') {
        errors.value.nama_lengkap = 'Nama lengkap harus diisi';
    }

    if (form.value.pegawaiData.no_hp && form.value.pegawaiData.no_hp.trim() !== '') {
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(form.value.pegawaiData.no_hp)) {
            errors.value.no_hp = 'Format nomor telepon tidak valid';
        }
    }

    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'warn',
            summary: 'Validasi Gagal',
            detail: 'Mohon periksa kembali data yang diisi',
            life: 3000
        });
        return;
    }

    try {
        loading.value = true;

        const response = await pegawaiService.registerPegawai({
            email: form.value.email,
            password: form.value.password,
            pegawaiData: form.value.pegawaiData
        });

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Registrasi pegawai berhasil. Silakan login dengan email dan password yang telah dibuat.',
            life: 5000
        });

        // Redirect to login
        router.push('/login');
    } catch (error) {
        console.error('Error registering pegawai:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.error || error.message || 'Gagal melakukan registrasi',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const goToLogin = () => {
    router.push('/login');
};

// Lifecycle
onMounted(() => {
    // Initialize form if needed
});
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-6">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="bg-white shadow-sm rounded-lg mb-6">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">Registrasi Pegawai</h1>
                            <p class="text-sm text-gray-600 mt-1">Daftarkan diri Anda sebagai pegawai baru</p>
                        </div>
                        <Button label="Kembali ke Login" icon="pi pi-arrow-left" severity="secondary" outlined @click="goToLogin" />
                    </div>
                </div>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Account Information Card -->
                <div class="bg-white shadow-sm rounded-lg">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="pi pi-user mr-2 text-blue-600"></i>
                            Informasi Akun
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">Data untuk login ke sistem</p>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Email -->
                            <div class="space-y-2">
                                <label for="email" class="block text-sm font-medium text-gray-700"> Email <span class="text-red-500">*</span> </label>
                                <InputText id="email" v-model="form.email" type="email" :class="{ 'p-invalid': errors.email }" placeholder="Masukkan email" class="w-full" />
                                <small v-if="errors.email" class="text-red-500 text-xs">{{ errors.email }}</small>
                            </div>

                            <!-- Password -->
                            <div class="space-y-2">
                                <label for="password" class="block text-sm font-medium text-gray-700"> Password <span class="text-red-500">*</span> </label>
                                <Password id="password" v-model="form.password" :class="{ 'p-invalid': errors.password }" placeholder="Masukkan password" class="w-full" :feedback="true" toggleMask />
                                <small v-if="errors.password" class="text-red-500 text-xs">{{ errors.password }}</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Personal Information Card -->
                <div class="bg-white shadow-sm rounded-lg">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="pi pi-user mr-2 text-green-600"></i>
                            Informasi Pribadi
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">Data pribadi dan identitas pegawai</p>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- NIP -->
                            <div class="space-y-2">
                                <label for="nip" class="block text-sm font-medium text-gray-700"> NIP </label>
                                <InputText id="nip" v-model="form.pegawaiData.nip" :class="{ 'p-invalid': errors.nip }" placeholder="Masukkan NIP" class="w-full" />
                                <small v-if="errors.nip" class="text-red-500 text-xs">{{ errors.nip }}</small>
                            </div>

                            <!-- Nama Lengkap -->
                            <div class="space-y-2">
                                <label for="nama_lengkap" class="block text-sm font-medium text-gray-700"> Nama Lengkap <span class="text-red-500">*</span> </label>
                                <InputText id="nama_lengkap" v-model="form.pegawaiData.nama_lengkap" :class="{ 'p-invalid': errors.nama_lengkap }" placeholder="Masukkan nama lengkap" class="w-full" />
                                <small v-if="errors.nama_lengkap" class="text-red-500 text-xs">{{ errors.nama_lengkap }}</small>
                            </div>

                            <!-- Tempat Lahir -->
                            <div class="space-y-2">
                                <label for="tempat_lahir" class="block text-sm font-medium text-gray-700"> Tempat Lahir </label>
                                <InputText id="tempat_lahir" v-model="form.pegawaiData.tempat_lahir" :class="{ 'p-invalid': errors.tempat_lahir }" placeholder="Masukkan tempat lahir" class="w-full" />
                                <small v-if="errors.tempat_lahir" class="text-red-500 text-xs">{{ errors.tempat_lahir }}</small>
                            </div>

                            <!-- Tanggal Lahir -->
                            <div class="space-y-2">
                                <label for="tanggal_lahir" class="block text-sm font-medium text-gray-700"> Tanggal Lahir </label>
                                <DatePicker id="tanggal_lahir" v-model="form.pegawaiData.tanggal_lahir" :class="{ 'p-invalid': errors.tanggal_lahir }" placeholder="Pilih tanggal lahir" dateFormat="dd/mm/yy" class="w-full" />
                                <small v-if="errors.tanggal_lahir" class="text-red-500 text-xs">{{ errors.tanggal_lahir }}</small>
                            </div>

                            <!-- Jenis Kelamin -->
                            <div class="space-y-2">
                                <label for="jenis_kelamin" class="block text-sm font-medium text-gray-700"> Jenis Kelamin </label>
                                <Select
                                    id="jenis_kelamin"
                                    v-model="form.pegawaiData.jenis_kelamin"
                                    :options="jenisKelaminOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    :class="{ 'p-invalid': errors.jenis_kelamin }"
                                    placeholder="Pilih jenis kelamin"
                                    class="w-full"
                                />
                                <small v-if="errors.jenis_kelamin" class="text-red-500 text-xs">{{ errors.jenis_kelamin }}</small>
                            </div>

                            <!-- Agama -->
                            <div class="space-y-2">
                                <label for="agama" class="block text-sm font-medium text-gray-700"> Agama </label>
                                <Select id="agama" v-model="form.pegawaiData.agama" :options="agamaOptions" optionLabel="label" optionValue="value" :class="{ 'p-invalid': errors.agama }" placeholder="Pilih agama" class="w-full" />
                                <small v-if="errors.agama" class="text-red-500 text-xs">{{ errors.agama }}</small>
                            </div>

                            <!-- No HP -->
                            <div class="space-y-2">
                                <label for="no_hp" class="block text-sm font-medium text-gray-700"> No. Telepon </label>
                                <InputText id="no_hp" v-model="form.pegawaiData.no_hp" :class="{ 'p-invalid': errors.no_hp }" placeholder="Masukkan nomor telepon" class="w-full" />
                                <small v-if="errors.no_hp" class="text-red-500 text-xs">{{ errors.no_hp }}</small>
                            </div>

                            <!-- Alamat -->
                            <div class="space-y-2 md:col-span-2 lg:col-span-3">
                                <label for="alamat" class="block text-sm font-medium text-gray-700"> Alamat </label>
                                <Textarea id="alamat" v-model="form.pegawaiData.alamat" :class="{ 'p-invalid': errors.alamat }" placeholder="Masukkan alamat lengkap" rows="3" class="w-full" />
                                <small v-if="errors.alamat" class="text-red-500 text-xs">{{ errors.alamat }}</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Work Information Card -->
                <div class="bg-white shadow-sm rounded-lg">
                    <div class="px-6 py-4 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                            <i class="pi pi-briefcase mr-2 text-purple-600"></i>
                            Informasi Pekerjaan
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">Data pekerjaan dan posisi pegawai</p>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <!-- Jabatan -->
                            <div class="space-y-2">
                                <label for="jabatan" class="block text-sm font-medium text-gray-700"> Jabatan </label>
                                <InputText id="jabatan" v-model="form.pegawaiData.jabatan" :class="{ 'p-invalid': errors.jabatan }" placeholder="Masukkan jabatan" class="w-full" />
                                <small v-if="errors.jabatan" class="text-red-500 text-xs">{{ errors.jabatan }}</small>
                            </div>

                            <!-- Unit Kerja -->
                            <div class="space-y-2">
                                <label for="unit_kerja" class="block text-sm font-medium text-gray-700"> Unit Kerja </label>
                                <InputText id="unit_kerja" v-model="form.pegawaiData.unit_kerja" :class="{ 'p-invalid': errors.unit_kerja }" placeholder="Masukkan unit kerja" class="w-full" />
                                <small v-if="errors.unit_kerja" class="text-red-500 text-xs">{{ errors.unit_kerja }}</small>
                            </div>

                            <!-- Pangkat Golongan -->
                            <div class="space-y-2">
                                <label for="pangkat_golongan" class="block text-sm font-medium text-gray-700"> Pangkat Golongan </label>
                                <InputText id="pangkat_golongan" v-model="form.pegawaiData.pangkat_golongan" :class="{ 'p-invalid': errors.pangkat_golongan }" placeholder="Masukkan pangkat golongan" class="w-full" />
                                <small v-if="errors.pangkat_golongan" class="text-red-500 text-xs">{{ errors.pangkat_golongan }}</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="bg-white shadow-sm rounded-lg">
                    <div class="px-6 py-4">
                        <div class="flex justify-end space-x-3">
                            <Button label="Batal" severity="secondary" outlined @click="goToLogin" :disabled="loading" class="px-6" />
                            <Button label="Daftar" type="submit" :loading="loading" class="px-6" />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Custom styles for better form appearance */
.p-field {
    margin-bottom: 0;
}

.p-inputtext,
.p-dropdown,
.p-calendar,
.p-inputtextarea,
.p-password {
    width: 100%;
}

/* Grid responsive adjustments */
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .grid-cols-3 {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
