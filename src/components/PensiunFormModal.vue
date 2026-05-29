<script setup>
import { ref, watch, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import FileUpload from 'primevue/fileupload';
import pegawaiService from '@/services/pegawaiService';
import pensiunService from '@/services/pensiunService';

const props = defineProps({
    visible: Boolean,
    pensiun: Object,
    isEditing: Boolean
});

const emit = defineEmits(['hide', 'saved', 'update:visible']);

const toast = useToast();

const form = ref({
    pegawai_id: null,
    jenis_pensiun: null,
    tanggal_pensiun: null,
    no_sk: '',
    alasan: '',
    keterangan: '',
    status: 'aktif',
    file_sk: null
});

const submitted = ref(false);
const loading = ref(false);
const pegawaiOptions = ref([]);

const jenisPensiunOptions = [
    { label: 'BUP (Batas Usia Pensiun)', value: 'bup' },
    { label: 'Janda/Duda', value: 'janda_duda' },
    { label: 'Atas Permintaan Sendiri', value: 'aps' },
    { label: 'Pemberhentian', value: 'pemberhentian' },
    { label: 'Meninggal Dunia', value: 'meninggal_dunia' }
];

const statusOptions = [
    { label: 'Aktif', value: 'aktif' },
    { label: 'Selesai', value: 'selesai' },
    { label: 'Dibatalkan', value: 'dibatalkan' }
];

const rules = {
    pegawai_id: { required: helpers.withMessage('Pegawai harus dipilih', required) },
    jenis_pensiun: { required: helpers.withMessage('Jenis pensiun harus dipilih', required) },
    tanggal_pensiun: { required: helpers.withMessage('Tanggal pensiun harus dipilih', required) },
    status: { required: helpers.withMessage('Status harus dipilih', required) }
};

const v$ = useVuelidate(rules, form);

watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            loadPegawaiOptions();
            if (props.isEditing && props.pensiun) {
                form.value = {
                    ...props.pensiun,
                    pegawai_id: props.pensiun.pegawai_id || props.pensiun.pegawai?.id,
                    no_sk: props.pensiun.nomor_sk || props.pensiun.no_sk,
                    tanggal_pensiun: props.pensiun.tmt_pensiun ? new Date(props.pensiun.tmt_pensiun) : (props.pensiun.tanggal_pensiun ? new Date(props.pensiun.tanggal_pensiun) : null),
                    tanggal_sk: props.pensiun.tanggal_sk ? new Date(props.pensiun.tanggal_sk) : null
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
        jenis_pensiun: null,
        tanggal_pensiun: null,
        no_sk: '',
        alasan: '',
        keterangan: '',
        status: 'aktif',
        file_sk: null
    };
    submitted.value = false;
    v$.value.$reset();
};

const onFileSelect = (event) => {
    form.value.file_sk = event.files[0];
};

const savePensiun = async () => {
    submitted.value = true;
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    loading.value = true;
    try {
        const formData = new FormData();
        Object.keys(form.value).forEach(key => {
            if (form.value[key] !== null && form.value[key] !== undefined) {
                if (key === 'tanggal_pensiun' && form.value[key] instanceof Date) {
                    formData.append(key, form.value[key].toISOString().split('T')[0]);
                } else {
                    formData.append(key, form.value[key]);
                }
            }
        });

        if (props.isEditing) {
            await pensiunService.updatePensiun(props.pensiun.id, formData);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Data pensiun berhasil diperbarui',
                life: 3000
            });
        } else {
            await pensiunService.createPensiun(formData);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Data pensiun baru berhasil ditambahkan',
                life: 3000
            });
        }
        emit('saved');
    } catch (error) {
        console.error('Error saving pensiun:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal menyimpan data pensiun',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Dialog :visible="visible" :header="isEditing ? 'Edit Pensiun' : 'Tambah Pensiun'" :modal="true" :closable="true" class="p-fluid" :style="{ width: '50vw' }" @hide="$emit('hide')" @update:visible="$emit('update:visible', $event)">
        <div class="field">
            <label for="pegawai_id" class="block font-medium mb-2">Pegawai <span class="text-red-500">*</span></label>
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
            />
            <small class="p-error" v-if="v$.pegawai_id.$invalid && submitted">
                {{ v$.pegawai_id.$errors[0].$message }}
            </small>
        </div>

        <div class="field">
            <label for="jenis_pensiun" class="block font-medium mb-2">Jenis Pensiun <span class="text-red-500">*</span></label>
            <Dropdown
                id="jenis_pensiun"
                v-model="form.jenis_pensiun"
                :options="jenisPensiunOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih jenis pensiun"
                class="w-full"
                :class="{ 'p-invalid': v$.jenis_pensiun.$invalid && submitted }"
            />
            <small class="p-error" v-if="v$.jenis_pensiun.$invalid && submitted">
                {{ v$.jenis_pensiun.$errors[0].$message }}
            </small>
        </div>

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="tanggal_pensiun" class="block font-medium mb-2">Tanggal Pensiun <span class="text-red-500">*</span></label>
                    <Calendar id="tanggal_pensiun" v-model="form.tanggal_pensiun" dateFormat="dd/mm/yy" placeholder="Pilih tanggal pensiun" class="w-full" :class="{ 'p-invalid': v$.tanggal_pensiun.$invalid && submitted }" showIcon />
                    <small class="p-error" v-if="v$.tanggal_pensiun.$invalid && submitted">
                        {{ v$.tanggal_pensiun.$errors[0].$message }}
                    </small>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="no_sk" class="block font-medium mb-2">Nomor SK</label>
                    <InputText id="no_sk" v-model="form.no_sk" placeholder="Masukkan nomor SK" class="w-full" />
                </div>
            </div>
        </div>

        <div class="field">
            <label for="alasan" class="block font-medium mb-2">Alasan Pensiun</label>
            <Textarea id="alasan" v-model="form.alasan" rows="3" placeholder="Masukkan alasan pensiun" class="w-full" :autoResize="true" />
        </div>

        <div class="field">
            <label for="keterangan" class="block font-medium mb-2">Keterangan</label>
            <Textarea id="keterangan" v-model="form.keterangan" rows="2" placeholder="Masukkan keterangan tambahan" class="w-full" :autoResize="true" />
        </div>

        <div class="field">
            <label class="block font-medium mb-2">Upload SK Pensiun (PDF)</label>
            <FileUpload mode="basic" name="file_sk" accept="application/pdf" :maxFileSize="1000000" @select="onFileSelect" :auto="false" chooseLabel="Pilih File SK" />
        </div>

        <div class="field">
            <label for="status" class="block font-medium mb-2">Status <span class="text-red-500">*</span></label>
            <Dropdown id="status" v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Pilih status" class="w-full" :class="{ 'p-invalid': v$.status.$invalid && submitted }" />
            <small class="p-error" v-if="v$.status.$invalid && submitted">
                {{ v$.status.$errors[0].$message }}
            </small>
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="$emit('hide')" />
            <Button :label="isEditing ? 'Update' : 'Simpan'" :icon="isEditing ? 'pi pi-check' : 'pi pi-save'" class="p-button-primary" :loading="loading" @click="savePensiun" />
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>
