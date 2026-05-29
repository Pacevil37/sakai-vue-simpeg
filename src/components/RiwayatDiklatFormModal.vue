<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import pegawaiService from '@/services/pegawaiService';
import educationService from '@/services/educationService';

const props = defineProps({
    visible: Boolean,
    riwayat: Object,
    isEditing: Boolean
});

const emit = defineEmits(['hide', 'saved', 'update:visible']);

const toast = useToast();

const form = ref({
    pegawai_id: null,
    nama_diklat: '',
    penyelenggara: '',
    tahun: new Date().getFullYear(),
    sertifikat_file: null,
    keterangan: ''
});

const submitted = ref(false);
const loading = ref(false);
const pegawaiOptions = ref([]);
const fileUploadRef = ref(null);

const rules = {
    pegawai_id: { required: helpers.withMessage('Pegawai harus dipilih', required) },
    nama_diklat: { required: helpers.withMessage('Nama diklat harus diisi', required) },
    penyelenggara: { required: helpers.withMessage('Penyelenggara harus diisi', required) },
    tahun: { required: helpers.withMessage('Tahun harus diisi', required) }
};

const v$ = useVuelidate(rules, form);

const isViewing = computed(() => !props.isEditing && props.riwayat);

watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            loadPegawaiOptions();
            if ((props.isEditing || isViewing.value) && props.riwayat) {
                form.value = {
                    ...props.riwayat,
                    pegawai_id: props.riwayat.pegawai_id || props.riwayat.pegawai?.id
                };
            } else {
                resetForm();
            }
        }
    }
);

onMounted(() => {
    if (props.visible) {
        loadPegawaiOptions();
    }
});

const loadPegawaiOptions = async () => {
    try {
        const response = await pegawaiService.getPegawai({ limit: 100 });
        pegawaiOptions.value = response.data.data || [];
    } catch (error) {
        console.error('Error loading pegawai options:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat daftar pegawai',
            life: 3000
        });
    }
};

const resetForm = () => {
    form.value = {
        pegawai_id: null,
        nama_diklat: '',
        penyelenggara: '',
        tahun: new Date().getFullYear(),
        sertifikat_file: null,
        keterangan: ''
    };
    submitted.value = false;
    v$.value.$reset();
    if (fileUploadRef.value) {
        fileUploadRef.value.clear();
    }
};

const onFileSelect = (event) => {
    form.value.sertifikat_file = event.files[0];
};

const onFileClear = () => {
    form.value.sertifikat_file = null;
};

const viewSertifikat = () => {
    const filename = form.value.sertifikat_file;
    if (!filename) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const baseUrl = apiUrl.replace(/\/api\/v1$/, '');
    window.open(`${baseUrl}/uploads/dokumen/${filename}`, '_blank');
};

const saveRiwayat = async () => {
    submitted.value = true;
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    loading.value = true;
    try {
        const formData = new FormData();

        // Add form fields
        Object.keys(form.value).forEach((key) => {
            if (form.value[key] !== null && form.value[key] !== undefined) {
                if (key === 'sertifikat_file' && form.value[key] instanceof File) {
                    formData.append(key, form.value[key]);
                } else if (key !== 'sertifikat_file') {
                    formData.append(key, form.value[key]);
                }
            }
        });

        if (props.isEditing) {
            await educationService.updateRiwayatDiklat(props.riwayat.id, formData);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Riwayat diklat berhasil diperbarui',
                life: 3000
            });
        } else {
            await educationService.createRiwayatDiklat(formData);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Riwayat diklat baru berhasil ditambahkan',
                life: 3000
            });
        }
        emit('saved');
    } catch (error) {
        console.error('Error saving riwayat:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal menyimpan riwayat diklat',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Dialog :visible="visible" :header="isViewing ? 'Detail Riwayat Diklat' : (isEditing ? 'Edit Riwayat Diklat' : 'Tambah Riwayat Diklat')" :modal="true" :closable="true" class="p-fluid" :style="{ width: '50vw' }" @hide="$emit('hide')" @update:visible="$emit('update:visible', $event)">
        <div class="field">
            <label for="pegawai_id" class="block font-medium mb-2">Pegawai <span class="text-red-500" v-if="!isViewing">*</span></label>
            <Dropdown
                id="pegawai_id"
                v-model="form.pegawai_id"
                :options="pegawaiOptions"
                optionLabel="nama_lengkap"
                optionValue="id"
                placeholder="Pilih pegawai"
                class="w-full"
                :class="{ 'p-invalid': v$.pegawai_id.$invalid && submitted }"
                :filter="true"
                showClear
                :disabled="isViewing"
            />
            <small class="p-error" v-if="v$.pegawai_id.$invalid && submitted">
                {{ v$.pegawai_id.$errors[0].$message }}
            </small>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="nama_diklat" class="block font-medium mb-2">Nama Diklat <span class="text-red-500" v-if="!isViewing">*</span></label>
                    <InputText id="nama_diklat" v-model="form.nama_diklat" placeholder="Nama diklat/pelatihan" class="w-full" :class="{ 'p-invalid': v$.nama_diklat.$invalid && submitted }" :disabled="isViewing" />
                    <small class="p-error" v-if="v$.nama_diklat.$invalid && submitted">
                        {{ v$.nama_diklat.$errors[0].$message }}
                    </small>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="penyelenggara" class="block font-medium mb-2">Penyelenggara <span class="text-red-500" v-if="!isViewing">*</span></label>
                    <InputText id="penyelenggara" v-model="form.penyelenggara" placeholder="Nama penyelenggara" class="w-full" :class="{ 'p-invalid': v$.penyelenggara.$invalid && submitted }" :disabled="isViewing" />
                    <small class="p-error" v-if="v$.penyelenggara.$invalid && submitted">
                        {{ v$.penyelenggara.$errors[0].$message }}
                    </small>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="tahun" class="block font-medium mb-2">Tahun <span class="text-red-500" v-if="!isViewing">*</span></label>
                    <InputNumber id="tahun" v-model="form.tahun" placeholder="Tahun diklat" class="w-full" :useGrouping="false" :min="1900" :max="2100" :class="{ 'p-invalid': v$.tahun.$invalid && submitted }" :disabled="isViewing" />
                    <small class="p-error" v-if="v$.tahun.$invalid && submitted">
                        {{ v$.tahun.$errors[0].$message }}
                    </small>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="sertifikat_file" class="block font-medium mb-2">File Sertifikat</label>
                    <div v-if="isViewing">
                        <Button 
                            v-if="form.sertifikat_file" 
                            label="Lihat Sertifikat" 
                            icon="pi pi-file-pdf" 
                            class="p-button-outlined" 
                            @click="viewSertifikat" 
                        />
                        <span v-else class="text-gray-500">-</span>
                    </div>
                    <div v-else>
                        <FileUpload id="sertifikat_file" ref="fileUploadRef" mode="basic" accept=".pdf,.jpg,.jpeg,.png" :maxFileSize="5000000" chooseLabel="Pilih File" :auto="false" @select="onFileSelect" @clear="onFileClear" />
                        <small class="text-gray-500">Format: PDF, JPG, PNG. Maksimal 5MB</small>
                        <div v-if="form.sertifikat_file && isEditing" class="mt-2">
                            <small class="text-green-600">File saat ini: {{ form.sertifikat_file }}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="field">
            <label for="keterangan" class="block font-medium mb-2">Keterangan</label>
            <Textarea id="keterangan" v-model="form.keterangan" rows="2" placeholder="Keterangan tambahan" class="w-full" :autoResize="true" :disabled="isViewing" />
        </div>

        <template #footer>
            <div v-if="isViewing">
                <Button label="Tutup" icon="pi pi-times" class="p-button-text" @click="$emit('hide')" />
            </div>
            <div v-else>
                <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="$emit('hide')" />
                <Button :label="isEditing ? 'Update' : 'Simpan'" :icon="isEditing ? 'pi pi-check' : 'pi pi-save'" class="p-button-primary" :loading="loading" @click="saveRiwayat" />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>
