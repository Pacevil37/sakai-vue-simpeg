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
import pegawaiService from '@/services/pegawaiService';
import mutasiService from '@/services/mutasiService';

const props = defineProps({
    visible: Boolean,
    mutasi: Object,
    isEditing: Boolean
});

const emit = defineEmits(['hide', 'saved', 'update:visible']);

const toast = useToast();

const form = ref({
    pegawai_id: null,
    unit_kerja_asal: '',
    unit_kerja_tujuan: '',
    tanggal_mutasi: null,
    alasan: ''
});

const submitted = ref(false);
const loading = ref(false);
const pegawaiOptions = ref([]);

// Opsi jenis/status dihapus karena tidak didukung kolom backend

const rules = {
    pegawai_id: { required: helpers.withMessage('Pegawai harus dipilih', required) },
    unit_kerja_asal: { required: helpers.withMessage('Unit kerja asal harus diisi', required) },
    unit_kerja_tujuan: { required: helpers.withMessage('Unit kerja tujuan harus diisi', required) },
    tanggal_mutasi: { required: helpers.withMessage('Tanggal mutasi harus dipilih', required) }
    // status: { required: helpers.withMessage('Status harus dipilih', required) }
};

const v$ = useVuelidate(rules, form);

watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            loadPegawaiOptions();
            if (props.isEditing && props.mutasi) {
                // Map data backend ke form
                form.value = {
                    pegawai_id: props.mutasi.pegawai_id || props.mutasi.pegawai?.id || null,
                    unit_kerja_asal: props.mutasi.dari_unit || props.mutasi.unit_kerja_asal || '',
                    unit_kerja_tujuan: props.mutasi.ke_unit || props.mutasi.unit_kerja_tujuan || '',
                    tanggal_mutasi: props.mutasi.tanggal_mutasi ? new Date(props.mutasi.tanggal_mutasi) : null,
                    alasan: props.mutasi.alasan || ''
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
        unit_kerja_asal: '',
        unit_kerja_tujuan: '',
        tanggal_mutasi: null,
        alasan: ''
    };
    submitted.value = false;
    v$.value.$reset();
};

const saveMutasi = async () => {
    submitted.value = true;
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    loading.value = true;
    try {
        // Map payload ke format backend
        const toISODate = (d) => {
            if (!d) return null;
            const date = typeof d === 'string' ? new Date(d) : d;
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };

        const payload = {
            pegawai_id: form.value.pegawai_id,
            dari_unit: form.value.unit_kerja_asal,
            ke_unit: form.value.unit_kerja_tujuan,
            tanggal_mutasi: toISODate(form.value.tanggal_mutasi)
        };

        if (props.isEditing) {
            await mutasiService.updateMutasi(props.mutasi.id, payload);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Mutasi berhasil diperbarui',
                life: 3000
            });
        } else {
            await mutasiService.createMutasi(payload);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Mutasi baru berhasil ditambahkan',
                life: 3000
            });
        }
        emit('saved');
    } catch (error) {
        console.error('Error saving mutasi:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal menyimpan mutasi',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Dialog :visible="visible" :header="isEditing ? 'Edit Mutasi' : 'Tambah Mutasi'" :modal="true" :closable="true" class="p-fluid" :style="{ width: '50vw' }" @hide="$emit('hide')" @update:visible="$emit('update:visible', $event)">
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
                :disabled="isEditing"
                :class="{ 'p-invalid': v$.pegawai_id.$invalid && submitted }"
                :filter="true"
                showClear
            />
            <small class="p-error" v-if="v$.pegawai_id.$invalid && submitted">
                {{ v$.pegawai_id.$errors[0].$message }}
            </small>
        </div>

        <!-- Jenis Mutasi dihapus karena tidak didukung di backend saat ini -->

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="unit_kerja_asal" class="block font-medium mb-2">Unit Kerja Asal <span class="text-red-500">*</span></label>
                    <InputText id="unit_kerja_asal" v-model="form.unit_kerja_asal" placeholder="Masukkan unit kerja asal" class="w-full" :class="{ 'p-invalid': v$.unit_kerja_asal.$invalid && submitted }" />
                    <small class="p-error" v-if="v$.unit_kerja_asal.$invalid && submitted">
                        {{ v$.unit_kerja_asal.$errors[0].$message }}
                    </small>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="unit_kerja_tujuan" class="block font-medium mb-2">Unit Kerja Tujuan <span class="text-red-500">*</span></label>
                    <InputText id="unit_kerja_tujuan" v-model="form.unit_kerja_tujuan" placeholder="Masukkan unit kerja tujuan" class="w-full" :class="{ 'p-invalid': v$.unit_kerja_tujuan.$invalid && submitted }" />
                    <small class="p-error" v-if="v$.unit_kerja_tujuan.$invalid && submitted">
                        {{ v$.unit_kerja_tujuan.$errors[0].$message }}
                    </small>
                </div>
            </div>
        </div>

        <div class="field">
            <label for="tanggal_mutasi" class="block font-medium mb-2">Tanggal Mutasi <span class="text-red-500">*</span></label>
            <Calendar id="tanggal_mutasi" v-model="form.tanggal_mutasi" dateFormat="dd/mm/yy" placeholder="Pilih tanggal mutasi" class="w-full" :class="{ 'p-invalid': v$.tanggal_mutasi.$invalid && submitted }" showIcon />
            <small class="p-error" v-if="v$.tanggal_mutasi.$invalid && submitted">
                {{ v$.tanggal_mutasi.$errors[0].$message }}
            </small>
        </div>

        <div class="field">
            <label for="alasan" class="block font-medium mb-2">Alasan Mutasi</label>
            <Textarea id="alasan" v-model="form.alasan" rows="3" placeholder="Masukkan alasan mutasi" class="w-full" :autoResize="true" />
        </div>

        <div class="field">
            <!-- Status dihapus karena tidak ada kolom di backend -->
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="$emit('hide')" />
            <Button :label="isEditing ? 'Update' : 'Simpan'" :icon="isEditing ? 'pi pi-check' : 'pi pi-save'" class="p-button-primary" :loading="loading" @click="saveMutasi" />
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>
