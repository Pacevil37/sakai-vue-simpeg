<script setup>
import { ref, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Dialog from 'primevue/dialog';
import Password from 'primevue/password';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import pegawaiService from '@/services/pegawaiService';

// Props
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    pegawai: {
        type: Object,
        default: null
    },
    isEditing: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['hide', 'saved']);

// Composables
const toast = useToast();

// Reactive data
const saving = ref(false);
const form = ref({
    nip: '',
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: null,
    jenis_kelamin: '',
    agama: '',
    status_perkawinan: '',
    pangkat_golongan: '',
    jabatan: '',
    unit_kerja: '',
    pendidikan_terakhir: '',
    nomor_sk_cpns: '',
    tanggal_sk_cpns: null,
    nomor_sk_pns: '',
    tanggal_sk_pns: null,
    email: '',
    username: '',
    password: ''
});

const errors = ref({});

// Options
const jenisKelaminOptions = ref([
    { label: 'Laki-laki', value: 'L' },
    { label: 'Perempuan', value: 'P' }
]);

const agamaOptions = ref(['Islam', 'Kristen Protestan', 'Kristen Katolik', 'Hindu', 'Buddha', 'Konghucu']);

const statusPerkawinanOptions = ref(['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']);

// Computed
const isViewing = computed(() => !props.isEditing && props.pegawai);

// Watchers
watch(
    () => props.pegawai,
    (newPegawai) => {
        if (newPegawai) {
            form.value = { ...newPegawai };
            // Convert date strings to Date objects
            if (form.value.tanggal_lahir) {
                form.value.tanggal_lahir = new Date(form.value.tanggal_lahir);
            }
            if (form.value.tanggal_sk_cpns) {
                form.value.tanggal_sk_cpns = new Date(form.value.tanggal_sk_cpns);
            }
            if (form.value.tanggal_sk_pns) {
                form.value.tanggal_sk_pns = new Date(form.value.tanggal_sk_pns);
            }
        } else {
            resetForm();
        }
    }
);

watch(
    () => props.visible,
    (visible) => {
        if (!visible) {
            resetForm();
            errors.value = {};
        }
    }
);

// Methods
const resetForm = () => {
    form.value = {
        nip: '',
        nama_lengkap: '',
        tempat_lahir: '',
        tanggal_lahir: null,
        jenis_kelamin: '',
        agama: '',
        status_perkawinan: '',
        pangkat_golongan: '',
        jabatan: '',
        unit_kerja: '',
        pendidikan_terakhir: '',
        nomor_sk_cpns: '',
        tanggal_sk_cpns: null,
        nomor_sk_pns: '',
        tanggal_sk_pns: null,
        email: '',
        username: '',
        password: ''
    };
};

const validateForm = () => {
    errors.value = {};

    if (!form.value.nip || !form.value.nip.trim()) {
        errors.value.nip = 'NIP wajib diisi';
    } else if (form.value.nip.trim().length < 8 || form.value.nip.trim().length > 30) {
        errors.value.nip = 'NIP harus antara 8-30 karakter';
    }

    if (!form.value.nama_lengkap || !form.value.nama_lengkap.trim()) {
        errors.value.nama_lengkap = 'Nama lengkap wajib diisi';
    } else if (form.value.nama_lengkap.trim().length < 2 || form.value.nama_lengkap.trim().length > 100) {
        errors.value.nama_lengkap = 'Nama lengkap harus antara 2-100 karakter';
    }

    // Validate email format if provided
    if (form.value.email && form.value.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.value.email.trim())) {
            errors.value.email = 'Format email tidak valid';
        }
    }

    // Validate username if provided (only for new pegawai)
    if (!props.isEditing && form.value.username && form.value.username.trim()) {
        if (form.value.username.trim().length < 3 || form.value.username.trim().length > 50) {
            errors.value.username = 'Username harus antara 3-50 karakter';
        }
    }

    // Validate password if provided (only for new pegawai)
    if (!props.isEditing && form.value.password && form.value.password.trim()) {
        if (form.value.password.trim().length < 6) {
            errors.value.password = 'Password minimal 6 karakter';
        }
    }

    return Object.keys(errors.value).length === 0;
};

const savePegawai = async () => {
    if (!validateForm()) {
        return;
    }

    try {
        saving.value = true;

        // Prepare data - only include non-empty values
        const pegawaiData = {};

        // Required fields
        pegawaiData.nip = form.value.nip.trim();
        pegawaiData.nama_lengkap = form.value.nama_lengkap.trim();

        // Optional fields - only include if not empty/null
        if (form.value.tempat_lahir && form.value.tempat_lahir.trim()) {
            pegawaiData.tempat_lahir = form.value.tempat_lahir.trim();
        }

        if (form.value.tanggal_lahir && form.value.tanggal_lahir instanceof Date) {
            pegawaiData.tanggal_lahir = form.value.tanggal_lahir.toISOString().split('T')[0];
        }

        if (form.value.jenis_kelamin) {
            pegawaiData.jenis_kelamin = form.value.jenis_kelamin;
        }

        if (form.value.agama) {
            pegawaiData.agama = form.value.agama;
        }

        if (form.value.status_perkawinan) {
            pegawaiData.status_perkawinan = form.value.status_perkawinan;
        }

        if (form.value.pangkat_golongan && form.value.pangkat_golongan.trim()) {
            pegawaiData.pangkat_golongan = form.value.pangkat_golongan.trim();
        }

        if (form.value.jabatan && form.value.jabatan.trim()) {
            pegawaiData.jabatan = form.value.jabatan.trim();
        }

        if (form.value.unit_kerja && form.value.unit_kerja.trim()) {
            pegawaiData.unit_kerja = form.value.unit_kerja.trim();
        }

        if (form.value.pendidikan_terakhir && form.value.pendidikan_terakhir.trim()) {
            pegawaiData.pendidikan_terakhir = form.value.pendidikan_terakhir.trim();
        }

        if (form.value.nomor_sk_cpns && form.value.nomor_sk_cpns.trim()) {
            pegawaiData.nomor_sk_cpns = form.value.nomor_sk_cpns.trim();
        }

        if (form.value.tanggal_sk_cpns && form.value.tanggal_sk_cpns instanceof Date) {
            pegawaiData.tanggal_sk_cpns = form.value.tanggal_sk_cpns.toISOString().split('T')[0];
        }

        if (form.value.nomor_sk_pns && form.value.nomor_sk_pns.trim()) {
            pegawaiData.nomor_sk_pns = form.value.nomor_sk_pns.trim();
        }

        if (form.value.tanggal_sk_pns && form.value.tanggal_sk_pns instanceof Date) {
            pegawaiData.tanggal_sk_pns = form.value.tanggal_sk_pns.toISOString().split('T')[0];
        }

        // Add email if provided
        if (form.value.email && form.value.email.trim()) {
            pegawaiData.email = form.value.email.trim();
        }

        // Add user account data if creating new pegawai and email is provided
        if (!props.isEditing && pegawaiData.email) {
            // Add username and password for user account creation
            if (form.value.username && form.value.username.trim()) {
                pegawaiData.username = form.value.username.trim();
            }
            if (form.value.password && form.value.password.trim()) {
                pegawaiData.password = form.value.password.trim();
            }
        }

        console.log('Sending pegawai data:', pegawaiData); // Debug log

        if (props.isEditing) {
            await pegawaiService.updatePegawai(props.pegawai.id, pegawaiData);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Data pegawai berhasil diperbarui',
                life: 3000
            });
        } else {
            const response = await pegawaiService.createPegawai(pegawaiData);

            // Show success message with user account info if created
            let successMessage = 'Pegawai berhasil ditambahkan';
            if (response.data && response.data.user_account) {
                successMessage += ' dan akun user berhasil dibuat';
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: successMessage + ` (Username: ${response.data.user_account.username})`,
                    life: 5000
                });
            } else if (response.data && response.data.user_creation_error) {
                toast.add({
                    severity: 'warn',
                    summary: 'Pegawai Berhasil',
                    detail: `Pegawai berhasil ditambahkan, namun gagal membuat akun user: ${response.data.user_creation_error}`,
                    life: 5000
                });
            } else {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: successMessage,
                    life: 3000
                });
            }
        }

        emit('saved');
    } catch (error) {
        console.error('Error saving pegawai:', error);
        console.error('Error response:', error.response?.data);

        // Show more specific error message
        let errorMessage = 'Gagal menyimpan data pegawai';
        if (error.response && error.response.data) {
            if (error.response.data.details && Array.isArray(error.response.data.details)) {
                // Show validation errors
                const validationErrors = error.response.data.details.map((err) => `${err.field}: ${err.message}`).join(', ');
                errorMessage = `Validation Error: ${validationErrors}`;
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
            }
        }

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });
    } finally {
        saving.value = false;
    }
};
</script>

<template>
    <Dialog :visible="visible" :header="isEditing ? 'Edit Pegawai' : isViewing ? 'Detail Pegawai' : 'Tambah Pegawai'" :modal="true" :closable="true" class="p-fluid" style="width: 900px; max-width: 95vw; max-height: 90vh" @hide="$emit('hide')">
        <form v-if="!isViewing" @submit.prevent="savePegawai">
            <div class="grid">
                <!-- NIP -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="nip" class="block text-sm font-medium mb-2"> NIP <span class="text-red-500">*</span> </label>
                        <InputText id="nip" v-model="form.nip" :class="{ 'p-invalid': errors.nip }" :disabled="isViewing" placeholder="Masukkan NIP" />
                        <small v-if="errors.nip" class="p-error">{{ errors.nip }}</small>
                    </div>
                </div>

                <!-- Nama Lengkap -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="nama_lengkap" class="block text-sm font-medium mb-2"> Nama Lengkap <span class="text-red-500">*</span> </label>
                        <InputText id="nama_lengkap" v-model="form.nama_lengkap" :class="{ 'p-invalid': errors.nama_lengkap }" :disabled="isViewing" placeholder="Masukkan nama lengkap" />
                        <small v-if="errors.nama_lengkap" class="p-error">{{ errors.nama_lengkap }}</small>
                    </div>
                </div>

                <!-- Tempat Lahir -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="tempat_lahir" class="block text-sm font-medium mb-2"> Tempat Lahir </label>
                        <InputText id="tempat_lahir" v-model="form.tempat_lahir" :disabled="isViewing" placeholder="Masukkan tempat lahir" />
                    </div>
                </div>

                <!-- Tanggal Lahir -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="tanggal_lahir" class="block text-sm font-medium mb-2"> Tanggal Lahir </label>
                        <Calendar id="tanggal_lahir" v-model="form.tanggal_lahir" :disabled="isViewing" dateFormat="dd/mm/yy" placeholder="Pilih tanggal lahir" showIcon class="w-full" />
                    </div>
                </div>

                <!-- Jenis Kelamin -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="jenis_kelamin" class="block text-sm font-medium mb-2"> Jenis Kelamin </label>
                        <Dropdown id="jenis_kelamin" v-model="form.jenis_kelamin" :disabled="isViewing" :options="jenisKelaminOptions" optionLabel="label" optionValue="value" placeholder="Pilih jenis kelamin" class="w-full" />
                    </div>
                </div>

                <!-- Agama -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="agama" class="block text-sm font-medium mb-2"> Agama </label>
                        <Dropdown id="agama" v-model="form.agama" :disabled="isViewing" :options="agamaOptions" placeholder="Pilih agama" class="w-full" />
                    </div>
                </div>

                <!-- Status Perkawinan -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="status_perkawinan" class="block text-sm font-medium mb-2"> Status Perkawinan </label>
                        <Dropdown id="status_perkawinan" v-model="form.status_perkawinan" :disabled="isViewing" :options="statusPerkawinanOptions" placeholder="Pilih status perkawinan" class="w-full" />
                    </div>
                </div>

                <!-- Pangkat/Golongan -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="pangkat_golongan" class="block text-sm font-medium mb-2"> Pangkat/Golongan </label>
                        <InputText id="pangkat_golongan" v-model="form.pangkat_golongan" :disabled="isViewing" placeholder="Masukkan pangkat/golongan" />
                    </div>
                </div>

                <!-- Jabatan -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="jabatan" class="block text-sm font-medium mb-2"> Jabatan </label>
                        <InputText id="jabatan" v-model="form.jabatan" :disabled="isViewing" placeholder="Masukkan jabatan" />
                    </div>
                </div>

                <!-- Unit Kerja -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="unit_kerja" class="block text-sm font-medium mb-2"> Unit Kerja </label>
                        <InputText id="unit_kerja" v-model="form.unit_kerja" :disabled="isViewing" placeholder="Masukkan unit kerja" />
                    </div>
                </div>

                <!-- Pendidikan Terakhir -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="pendidikan_terakhir" class="block text-sm font-medium mb-2"> Pendidikan Terakhir </label>
                        <InputText id="pendidikan_terakhir" v-model="form.pendidikan_terakhir" :disabled="isViewing" placeholder="Masukkan pendidikan terakhir" />
                    </div>
                </div>

                <!-- Nomor SK CPNS -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="nomor_sk_cpns" class="block text-sm font-medium mb-2"> Nomor SK CPNS </label>
                        <InputText id="nomor_sk_cpns" v-model="form.nomor_sk_cpns" :disabled="isViewing" placeholder="Masukkan nomor SK CPNS" />
                    </div>
                </div>

                <!-- Tanggal SK CPNS -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="tanggal_sk_cpns" class="block text-sm font-medium mb-2"> Tanggal SK CPNS </label>
                        <Calendar id="tanggal_sk_cpns" v-model="form.tanggal_sk_cpns" :disabled="isViewing" dateFormat="dd/mm/yy" placeholder="Pilih tanggal SK CPNS" showIcon class="w-full" />
                    </div>
                </div>

                <!-- Nomor SK PNS -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="nomor_sk_pns" class="block text-sm font-medium mb-2"> Nomor SK PNS </label>
                        <InputText id="nomor_sk_pns" v-model="form.nomor_sk_pns" :disabled="isViewing" placeholder="Masukkan nomor SK PNS" />
                    </div>
                </div>

                <!-- Tanggal SK PNS -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="tanggal_sk_pns" class="block text-sm font-medium mb-2"> Tanggal SK PNS </label>
                        <Calendar id="tanggal_sk_pns" v-model="form.tanggal_sk_pns" :disabled="isViewing" dateFormat="dd/mm/yy" placeholder="Pilih tanggal SK PNS" showIcon class="w-full" />
                    </div>
                </div>

                <!-- Email -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="email" class="block text-sm font-medium mb-2"> Email </label>
                        <InputText id="email" v-model="form.email" type="email" :disabled="isViewing || isEditing" :class="{ 'p-invalid': errors.email }" placeholder="Masukkan email" />
                        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                        <small class="text-gray-500" v-if="!isEditing">Email akan digunakan untuk membuat akun user</small>
                    </div>
                </div>

                <!-- Username (hanya untuk create baru) -->
                <div v-if="!isEditing" class="col-12 md:col-6">
                    <div class="field">
                        <label for="username" class="block text-sm font-medium mb-2"> Username </label>
                        <InputText id="username" v-model="form.username" :disabled="isViewing" :class="{ 'p-invalid': errors.username }" placeholder="Masukkan username (opsional)" />
                        <small v-if="errors.username" class="p-error">{{ errors.username }}</small>
                        <small class="text-gray-500">Jika kosong, akan menggunakan bagian sebelum @ dari email</small>
                    </div>
                </div>

                <!-- Password (hanya untuk create baru) -->
                <div v-if="!isEditing" class="col-12 md:col-6">
                    <div class="field">
                        <label for="password" class="block text-sm font-medium mb-2"> Password </label>
                        <Password id="password" v-model="form.password" :disabled="isViewing" :class="{ 'p-invalid': errors.password }" placeholder="Masukkan password (opsional)" :feedback="false" toggleMask />
                        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                        <small class="text-gray-500">Jika kosong, akan menggunakan password default: password123</small>
                    </div>
                </div>
            </div>
        </form>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" @click="$emit('hide')" severity="secondary" :disabled="saving" />
            <Button :label="isEditing ? 'Update' : 'Simpan'" icon="pi pi-check" @click="savePegawai" :loading="saving" v-if="!isViewing" />
        </template>
    </Dialog>
</template>

<style scoped>
.p-fluid .field {
    margin-bottom: 1.5rem;
}

.p-invalid {
    border-color: #e24c4c;
}
</style>
