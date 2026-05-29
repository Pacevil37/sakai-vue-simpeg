<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, numeric, between, helpers } from '@vuelidate/validators';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import pegawaiService from '@/services/pegawaiService';
import performanceService from '@/services/performanceService';

const props = defineProps({
    visible: Boolean,
    kinerja: Object,
    isEditing: Boolean
});

const emit = defineEmits(['hide', 'saved', 'update:visible']);

const toast = useToast();

const form = ref({
    pegawai_id: null,
    tahun: new Date().getFullYear(),
    periode: 'tahunan',
    nilai: null,
    penilai: '',
    komentar: '',
    rekomendasi: ''
});

const submitted = ref(false);
const loading = ref(false);
const pegawaiOptions = ref([]);

const periodeOptions = [
    { label: 'Tahunan', value: 'tahunan' },
    { label: 'Semester 1', value: 'semester_1' },
    { label: 'Semester 2', value: 'semester_2' },
    { label: 'Triwulan 1', value: 'triwulan_1' },
    { label: 'Triwulan 2', value: 'triwulan_2' },
    { label: 'Triwulan 3', value: 'triwulan_3' },
    { label: 'Triwulan 4', value: 'triwulan_4' }
];

const rules = {
    pegawai_id: { required: helpers.withMessage('Pegawai harus dipilih', required) },
    tahun: {
        required: helpers.withMessage('Tahun harus diisi', required),
        numeric,
        between: between(2000, 2100)
    },
    periode: { required: helpers.withMessage('Periode harus dipilih', required) },
    nilai: {
        required: helpers.withMessage('Nilai harus diisi', required),
        numeric,
        between: between(0, 100)
    }
};

const v$ = useVuelidate(rules, form);

const nilaiCategory = computed(() => {
    if (form.value.nilai === null) return '';
    return getNilaiCategory(form.value.nilai);
});

watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            loadPegawaiOptions();
            if (props.isEditing && props.kinerja) {
                form.value = {
                    ...props.kinerja,
                    pegawai_id: props.kinerja.pegawai_id || props.kinerja.pegawai?.id
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
        tahun: new Date().getFullYear(),
        periode: 'tahunan',
        nilai: null,
        penilai: '',
        komentar: '',
        rekomendasi: ''
    };
    submitted.value = false;
    v$.value.$reset();
};

const saveKinerja = async () => {
    submitted.value = true;
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    loading.value = true;
    try {
        if (props.isEditing) {
            await performanceService.updatePerformance(props.kinerja.id, form.value);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Penilaian kinerja berhasil diperbarui',
                life: 3000
            });
        } else {
            await performanceService.createPerformance(form.value);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Penilaian kinerja baru berhasil ditambahkan',
                life: 3000
            });
        }
        emit('saved');
    } catch (error) {
        console.error('Error saving kinerja:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal menyimpan penilaian kinerja',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const getNilaiCategory = (nilai) => {
    if (nilai >= 90) return 'Sangat Baik';
    if (nilai >= 80) return 'Baik';
    if (nilai >= 70) return 'Cukup';
    if (nilai >= 60) return 'Kurang';
    return 'Buruk';
};
</script>

<template>
    <Dialog
        :visible="visible"
        :header="isEditing ? 'Edit Penilaian Kinerja' : 'Tambah Penilaian Kinerja'"
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

        <div class="grid">
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="tahun" class="block font-medium mb-2">Tahun <span class="text-red-500">*</span></label>
                    <InputNumber id="tahun" v-model="form.tahun" placeholder="Tahun penilaian" class="w-full" :useGrouping="false" :min="2000" :max="2100" :class="{ 'p-invalid': v$.tahun.$invalid && submitted }" />
                    <small class="p-error" v-if="v$.tahun.$invalid && submitted">
                        {{ v$.tahun.$errors[0].$message }}
                    </small>
                </div>
            </div>
            <div class="col-12 md:col-6">
                <div class="field">
                    <label for="periode" class="block font-medium mb-2">Periode <span class="text-red-500">*</span></label>
                    <Dropdown id="periode" v-model="form.periode" :options="periodeOptions" optionLabel="label" optionValue="value" placeholder="Pilih periode" class="w-full" :class="{ 'p-invalid': v$.periode.$invalid && submitted }" />
                    <small class="p-error" v-if="v$.periode.$invalid && submitted">
                        {{ v$.periode.$errors[0].$message }}
                    </small>
                </div>
            </div>
        </div>

        <div class="field">
            <label for="nilai" class="block font-medium mb-2">Nilai <span class="text-red-500">*</span></label>
            <InputNumber id="nilai" v-model="form.nilai" placeholder="Masukkan nilai (0-100)" class="w-full" :useGrouping="false" :min="0" :max="100" :class="{ 'p-invalid': v$.nilai.$invalid && submitted }" />
            <small class="p-error" v-if="v$.nilai.$invalid && submitted">
                {{ v$.nilai.$errors[0].$message }}
            </small>
            <small class="text-gray-500" v-if="form.nilai !== null"> Kategori: {{ getNilaiCategory(form.nilai) }} </small>
        </div>

        <div class="field">
            <label for="penilai" class="block font-medium mb-2">Penilai</label>
            <InputText id="penilai" v-model="form.penilai" placeholder="Nama penilai" class="w-full" />
        </div>

        <div class="field">
            <label for="komentar" class="block font-medium mb-2">Komentar</label>
            <Textarea id="komentar" v-model="form.komentar" rows="3" placeholder="Masukkan komentar penilaian" class="w-full" :autoResize="true" />
        </div>

        <div class="field">
            <label for="rekomendasi" class="block font-medium mb-2">Rekomendasi</label>
            <Textarea id="rekomendasi" v-model="form.rekomendasi" rows="2" placeholder="Masukkan rekomendasi" class="w-full" :autoResize="true" />
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="$emit('hide')" />
            <Button :label="isEditing ? 'Update' : 'Simpan'" :icon="isEditing ? 'pi pi-check' : 'pi pi-save'" class="p-button-primary" :loading="loading" @click="saveKinerja" />
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}
</style>
