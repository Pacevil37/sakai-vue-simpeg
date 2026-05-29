<script setup>
import { ref, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import educationService from '@/services/educationService';
import pegawaiService from '@/services/pegawaiService';

// Props
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    pendidikan: {
        type: Object,
        default: null
    },
    isEditing: {
        type: Boolean,
        default: false
    },
    isDiklat: {
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
const pegawaiOptions = ref([]);
const form = ref({
    pegawai_id: null,
    jenjang: '',
    institusi: '',
    tahun_lulus: null,
    nama_diklat: '',
    penyelenggara: '',
    tahun: null
});

const errors = ref({});

// Options
const jenjangOptions = ref(['SD', 'SMP', 'SMA', 'SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3']);

// Computed
const isViewing = computed(() => !props.isEditing && props.pendidikan);

// Methods
const getModalHeader = () => {
    if (isViewing.value) {
        return props.isDiklat ? 'Detail Riwayat Diklat' : 'Detail Riwayat Pendidikan';
    } else if (props.isEditing) {
        return props.isDiklat ? 'Edit Riwayat Diklat' : 'Edit Riwayat Pendidikan';
    } else {
        return props.isDiklat ? 'Tambah Riwayat Diklat' : 'Tambah Riwayat Pendidikan';
    }
};

const resetForm = () => {
    form.value = {
        pegawai_id: null,
        jenjang: '',
        institusi: '',
        tahun_lulus: null,
        nama_diklat: '',
        penyelenggara: '',
        tahun: null
    };
};

const validateForm = () => {
    errors.value = {};

    if (!form.value.pegawai_id) {
        errors.value.pegawai_id = 'Pegawai wajib dipilih';
    }

    if (!props.isDiklat) {
        // Validation for riwayat pendidikan
        if (!form.value.jenjang) {
            errors.value.jenjang = 'Jenjang wajib diisi';
        }
        if (!form.value.institusi) {
            errors.value.institusi = 'Institusi wajib diisi';
        }
        if (!form.value.tahun_lulus) {
            errors.value.tahun_lulus = 'Tahun lulus wajib diisi';
        }
    } else {
        // Validation for riwayat diklat
        if (!form.value.nama_diklat) {
            errors.value.nama_diklat = 'Nama diklat wajib diisi';
        }
        if (!form.value.penyelenggara) {
            errors.value.penyelenggara = 'Penyelenggara wajib diisi';
        }
        if (!form.value.tahun) {
            errors.value.tahun = 'Tahun wajib diisi';
        }
    }

    return Object.keys(errors.value).length === 0;
};

const loadPegawai = async () => {
    try {
        const response = await pegawaiService.getPegawai({ limit: 1000 });
        pegawaiOptions.value = (response.data || []).map((pegawai) => ({
            label: `${pegawai.nama_lengkap} (${pegawai.nip})`,
            value: pegawai.id
        }));
    } catch (error) {
        console.error('Error loading pegawai:', error);
    }
};

const savePendidikan = async () => {
    if (!validateForm()) {
        return;
    }

    try {
        saving.value = true;

        // Prepare data
        const data = { ...form.value };

        if (props.isDiklat) {
            // Remove pendidikan fields
            delete data.jenjang;
            delete data.institusi;
            delete data.tahun_lulus;
        } else {
            // Remove diklat fields
            delete data.nama_diklat;
            delete data.penyelenggara;
            delete data.tahun;
        }

        if (props.isEditing) {
            if (props.isDiklat) {
                await educationService.updateRiwayatDiklat(props.pendidikan.id, data);
            } else {
                await educationService.updateRiwayatPendidikan(props.pendidikan.id, data);
            }
        } else {
            if (props.isDiklat) {
                await educationService.createRiwayatDiklat(data);
            } else {
                await educationService.createRiwayatPendidikan(data);
            }
        }

        emit('saved');
    } catch (error) {
        console.error('Error saving pendidikan:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal menyimpan data pendidikan',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

// Watchers
watch(
    () => props.pendidikan,
    (newPendidikan) => {
        if (newPendidikan) {
            form.value = { ...newPendidikan };
        } else {
            resetForm();
        }
    }
);

watch(
    () => props.visible,
    (visible) => {
        if (visible) {
            loadPegawai();
        } else {
            resetForm();
            errors.value = {};
        }
    }
);
</script>

<template>
    <Dialog :visible="visible" :header="getModalHeader()" :modal="true" :closable="true" class="p-fluid" style="width: 600px; max-width: 90vw" @hide="$emit('hide')">
        <form @submit.prevent="savePendidikan">
            <div class="grid">
                <!-- Pegawai -->
                <div class="col-12">
                    <div class="field">
                        <label for="pegawai_id" class="block text-sm font-medium mb-2"> Pegawai <span class="text-red-500">*</span> </label>
                        <Dropdown
                            id="pegawai_id"
                            v-model="form.pegawai_id"
                            :disabled="isViewing"
                            :options="pegawaiOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Pilih pegawai"
                            class="w-full"
                            :class="{ 'p-invalid': errors.pegawai_id }"
                            filter
                            show-clear
                        />
                        <small v-if="errors.pegawai_id" class="p-error">{{ errors.pegawai_id }}</small>
                    </div>
                </div>

                <!-- Fields for Riwayat Pendidikan -->
                <template v-if="!isDiklat">
                    <!-- Jenjang -->
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="jenjang" class="block text-sm font-medium mb-2"> Jenjang <span class="text-red-500">*</span> </label>
                            <Dropdown id="jenjang" v-model="form.jenjang" :disabled="isViewing" :options="jenjangOptions" placeholder="Pilih jenjang" class="w-full" :class="{ 'p-invalid': errors.jenjang }" />
                            <small v-if="errors.jenjang" class="p-error">{{ errors.jenjang }}</small>
                        </div>
                    </div>

                    <!-- Institusi -->
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="institusi" class="block text-sm font-medium mb-2"> Institusi <span class="text-red-500">*</span> </label>
                            <InputText id="institusi" v-model="form.institusi" :class="{ 'p-invalid': errors.institusi }" :disabled="isViewing" placeholder="Masukkan nama institusi" />
                            <small v-if="errors.institusi" class="p-error">{{ errors.institusi }}</small>
                        </div>
                    </div>

                    <!-- Tahun Lulus -->
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="tahun_lulus" class="block text-sm font-medium mb-2"> Tahun Lulus <span class="text-red-500">*</span> </label>
                            <InputNumber
                                id="tahun_lulus"
                                v-model="form.tahun_lulus"
                                :class="{ 'p-invalid': errors.tahun_lulus }"
                                :disabled="isViewing"
                                placeholder="Tahun lulus"
                                :min="1950"
                                :max="new Date().getFullYear()"
                                :use-grouping="false"
                                class="w-full"
                            />
                            <small v-if="errors.tahun_lulus" class="p-error">{{ errors.tahun_lulus }}</small>
                        </div>
                    </div>
                </template>

                <!-- Fields for Riwayat Diklat -->
                <template v-else>
                    <!-- Nama Diklat -->
                    <div class="col-12">
                        <div class="field">
                            <label for="nama_diklat" class="block text-sm font-medium mb-2"> Nama Diklat <span class="text-red-500">*</span> </label>
                            <InputText id="nama_diklat" v-model="form.nama_diklat" :class="{ 'p-invalid': errors.nama_diklat }" :disabled="isViewing" placeholder="Masukkan nama diklat" />
                            <small v-if="errors.nama_diklat" class="p-error">{{ errors.nama_diklat }}</small>
                        </div>
                    </div>

                    <!-- Penyelenggara -->
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="penyelenggara" class="block text-sm font-medium mb-2"> Penyelenggara <span class="text-red-500">*</span> </label>
                            <InputText id="penyelenggara" v-model="form.penyelenggara" :class="{ 'p-invalid': errors.penyelenggara }" :disabled="isViewing" placeholder="Masukkan nama penyelenggara" />
                            <small v-if="errors.penyelenggara" class="p-error">{{ errors.penyelenggara }}</small>
                        </div>
                    </div>

                    <!-- Tahun -->
                    <div class="col-12 md:col-6">
                        <div class="field">
                            <label for="tahun" class="block text-sm font-medium mb-2"> Tahun <span class="text-red-500">*</span> </label>
                            <InputNumber id="tahun" v-model="form.tahun" :class="{ 'p-invalid': errors.tahun }" :disabled="isViewing" placeholder="Tahun diklat" :min="1950" :max="new Date().getFullYear()" :use-grouping="false" class="w-full" />
                            <small v-if="errors.tahun" class="p-error">{{ errors.tahun }}</small>
                        </div>
                    </div>
                </template>
            </div>

            <template #footer v-if="!isViewing">
                <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="$emit('hide')" />
                <Button :label="isEditing ? 'Simpan Perubahan' : 'Tambah Data'" icon="pi pi-check" class="p-button-primary" type="submit" :loading="saving" />
            </template>

            <template #footer v-else>
                <Button label="Tutup" icon="pi pi-times" class="p-button-text" @click="$emit('hide')" />
            </template>
        </form>
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
