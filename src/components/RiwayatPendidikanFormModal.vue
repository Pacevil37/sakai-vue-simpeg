<script setup>
import { ref, watch, onMounted } from 'vue';
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
import riwayatPendidikanService from '@/services/riwayatPendidikanService';

const props = defineProps({
    visible: Boolean,
    riwayat: Object,
    isEditing: Boolean
});

const emit = defineEmits(['hide', 'saved', 'update:visible']);

const toast = useToast();

const jenjangOptions = ['SD', 'SMP', 'SMA', 'SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'];

const form = ref({
    pegawai_id: null,
    jenjang: '',
    institusi: '',
    tahun_lulus: new Date().getFullYear(),
    ijazah_file: null
});

const submitted = ref(false);
const loading = ref(false);
const pegawaiOptions = ref([]);
const fileUploadRef = ref(null);

const rules = {
    pegawai_id: { required: helpers.withMessage('Pegawai harus dipilih', required) },
    jenjang: { required: helpers.withMessage('Jenjang pendidikan harus dipilih', required) },
    institusi: { required: helpers.withMessage('Nama institusi/sekolah harus diisi', required) },
    tahun_lulus: { required: helpers.withMessage('Tahun lulus harus diisi', required) }
};

const v$ = useVuelidate(rules, form);

watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            loadPegawaiOptions();
            if (props.isEditing && props.riwayat) {
                form.value = {
                    pegawai_id: props.riwayat.pegawai_id || props.riwayat.pegawai?.id || null,
                    jenjang: props.riwayat.jenjang || '',
                    institusi: props.riwayat.institusi || '',
                    tahun_lulus: props.riwayat.tahun_lulus || new Date().getFullYear(),
                    ijazah_file: null
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
        const raw = response?.data?.data || response?.data || [];
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
        pegawaiOptions.value = list.map((item) => ({
            label: `${item.nama_lengkap} (${item.nip || 'N/A'})`,
            value: item.id
        }));
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
        jenjang: '',
        institusi: '',
        tahun_lulus: new Date().getFullYear(),
        ijazah_file: null
    };
    submitted.value = false;
    v$.value.$reset();
    if (fileUploadRef.value) {
        fileUploadRef.value.clear();
    }
};

const onFileSelect = (event) => {
    const file = event.files && event.files[0];
    form.value.ijazah_file = file ? file.name : null; // simpan nama file sebagai string
};

const onFileClear = () => {
    form.value.ijazah_file = null;
};

const saveRiwayat = async () => {
    submitted.value = true;
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    loading.value = true;
    try {
        const payload = {
            pegawai_id: form.value.pegawai_id,
            jenjang: form.value.jenjang,
            institusi: form.value.institusi,
            tahun_lulus: form.value.tahun_lulus,
            ijazah_file: form.value.ijazah_file || null
        };

        if (props.isEditing) {
            await riwayatPendidikanService.updateRiwayatPendidikan(props.riwayat.id, payload);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Riwayat pendidikan berhasil diperbarui',
                life: 3000
            });
        } else {
            await riwayatPendidikanService.createRiwayatPendidikan(payload);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Riwayat pendidikan baru berhasil ditambahkan',
                life: 3000
            });
        }
        emit('saved');
    } catch (error) {
        console.error('Error saving riwayat:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal menyimpan riwayat pendidikan',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Dialog
        :visible="visible"
        :header="isEditing ? 'Edit Riwayat Pendidikan' : 'Tambah Riwayat Pendidikan'"
        :modal="true"
        :closable="true"
        class="p-fluid"
        :style="{ width: '50vw' }"
        @hide="$emit('hide')"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="field">
            <label for="pegawai_id" class="block font-medium mb-2">Pegawai <span class="text-red-500">*</span></label>
            <Dropdown
                id="pegawai_id"
                v-model="form.pegawai_id"
                :options="pegawaiOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih pegawai"
                class="w-full"
                :class="{ 'p-invalid': v$.pegawai_id.$invalid && submitted }"
                :filter="true"
                showClear
            />
            <small class="p-error" v-if="v$.pegawai_id.$invalid && submitted">
                {{ v$.pegawai_id.$errors[0].$message }}
            </small>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="jenjang" class="block font-medium mb-2">Jenjang Pendidikan <span class="text-red-500">*</span></label>
                    <Dropdown id="jenjang" v-model="form.jenjang" :options="jenjangOptions" placeholder="Pilih jenjang" class="w-full" :class="{ 'p-invalid': v$.jenjang.$invalid && submitted }" />
                    <small class="p-error" v-if="v$.jenjang.$invalid && submitted">
                        {{ v$.jenjang.$errors[0].$message }}
                    </small>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="institusi" class="block font-medium mb-2">Nama Institusi/Sekolah <span class="text-red-500">*</span></label>
                    <InputText id="institusi" v-model="form.institusi" placeholder="Nama institusi/sekolah" class="w-full" :class="{ 'p-invalid': v$.institusi.$invalid && submitted }" />
                    <small class="p-error" v-if="v$.institusi.$invalid && submitted">
                        {{ v$.institusi.$errors[0].$message }}
                    </small>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="tahun_lulus" class="block font-medium mb-2">Tahun Lulus <span class="text-red-500">*</span></label>
                    <InputNumber id="tahun_lulus" v-model="form.tahun_lulus" placeholder="Tahun lulus" class="w-full" :useGrouping="false" :min="1900" :max="2100" :class="{ 'p-invalid': v$.tahun_lulus.$invalid && submitted }" />
                    <small class="p-error" v-if="v$.tahun_lulus.$invalid && submitted">
                        {{ v$.tahun_lulus.$errors[0].$message }}
                    </small>
                </div>
            </div>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="ijazah_file" class="block font-medium mb-2">File Ijazah</label>
                    <FileUpload id="ijazah_file" ref="fileUploadRef" mode="basic" accept=".pdf,.jpg,.jpeg,.png" :maxFileSize="5000000" chooseLabel="Pilih File" :auto="false" @select="onFileSelect" @clear="onFileClear" />
                    <small class="text-gray-500">Format: PDF, JPG, PNG. Maksimal 5MB</small>
                    <div v-if="props.riwayat?.ijazah_file && isEditing" class="mt-2">
                        <small class="text-green-600">File saat ini: {{ props.riwayat.ijazah_file }}</small>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="$emit('hide')" />
            <Button :label="isEditing ? 'Update' : 'Simpan'" :icon="isEditing ? 'pi pi-check' : 'pi pi-save'" class="p-button-primary" :loading="loading" @click="saveRiwayat" />
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>
