<script setup>
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import kgbService from '@/services/kgbService';
import pegawaiService from '@/services/pegawaiService';

const props = defineProps({
    kgb: {
        type: Object,
        default: null
    },
    editing: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['success', 'cancel']);

const toast = useToast();

// Reactive data
const submitted = ref(false);
const saving = ref(false);
const loadingPegawai = ref(false);

const form = ref({
    pegawai_id: null,
    nomor_sk: '',
    tanggal_sk: null,
    gaji_lama: null,
    gaji_baru: null,
    tmt_kgb: null
});

const pegawaiOptions = ref([]);
// Status dihapus karena tidak ada di skema backend untuk KGB

// Methods
const loadPegawai = async () => {
    try {
        loadingPegawai.value = true;
        const response = await pegawaiService.getPegawai({
            page: 1,
            limit: 1000
        });
        // Backend mengembalikan { success, data } dan di dalamnya model getAllPegawai
        // mengembalikan { data: rows, total, page, limit, totalPages }
        const listSource = response?.data?.data ?? response?.data ?? [];
        pegawaiOptions.value = Array.isArray(listSource) ? listSource : [];
    } catch (error) {
        console.error('Error loading pegawai:', error);
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

const saveKgb = async () => {
    submitted.value = true;

    if (!form.value.pegawai_id || !form.value.nomor_sk || !form.value.tanggal_sk || form.value.gaji_lama === null || form.value.gaji_lama === undefined || form.value.gaji_baru === null || form.value.gaji_baru === undefined || !form.value.tmt_kgb) {
        return;
    }

    try {
        saving.value = true;

        const kgbData = {
            pegawai_id: form.value.pegawai_id,
            nomor_sk: form.value.nomor_sk,
            tanggal_sk: form.value.tanggal_sk ? form.value.tanggal_sk.toISOString().split('T')[0] : null,
            gaji_lama: form.value.gaji_lama,
            gaji_baru: form.value.gaji_baru,
            tmt_kgb: form.value.tmt_kgb ? form.value.tmt_kgb.toISOString().split('T')[0] : null
        };

        if (props.editing && props.kgb) {
            await kgbService.updateKgb(props.kgb.id, kgbData);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'KGB berhasil diperbarui',
                life: 3000
            });
        } else {
            await kgbService.createKgb(kgbData);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'KGB baru berhasil dibuat',
                life: 3000
            });
        }

        emit('success');
    } catch (error) {
        console.error('Error saving KGB:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal menyimpan KGB',
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

// Watch for props.kgb changes
watch(
    () => props.kgb,
    (newKgb) => {
        if (newKgb) {
            form.value = {
                pegawai_id: newKgb.pegawai_id,
                nomor_sk: newKgb.nomor_sk,
                tanggal_sk: newKgb.tanggal_sk ? new Date(newKgb.tanggal_sk) : null,
                gaji_lama: newKgb.gaji_lama ?? null,
                gaji_baru: newKgb.gaji_baru ?? null,
                tmt_kgb: newKgb.tmt_kgb ? new Date(newKgb.tmt_kgb) : null
            };
        } else {
            form.value = {
                pegawai_id: null,
                nomor_sk: '',
                tanggal_sk: null,
                gaji_lama: null,
                gaji_baru: null,
                tmt_kgb: null
            };
        }
    },
    { immediate: true }
);

// Lifecycle
onMounted(() => {
    loadPegawai();
});
</script>

<template>
    <div>
        <form @submit.prevent="saveKgb">
            <div class="grid">
                <!-- Pegawai Selection -->
                <div class="col-12">
                    <div class="field">
                        <label for="pegawai_id" class="block text-sm font-medium mb-2"> Pegawai <span class="text-red-500">*</span> </label>
                        <Dropdown
                            id="pegawai_id"
                            v-model="form.pegawai_id"
                            :options="pegawaiOptions"
                            optionLabel="nama_lengkap"
                            optionValue="id"
                            placeholder="Pilih Pegawai"
                            :loading="loadingPegawai"
                            :disabled="editing"
                            class="w-full"
                            :class="{ 'p-invalid': submitted && !form.pegawai_id }"
                        />
                        <small v-if="submitted && !form.pegawai_id" class="p-error"> Pegawai harus dipilih </small>
                    </div>
                </div>

                <!-- Nomor SK -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="nomor_sk" class="block text-sm font-medium mb-2"> Nomor SK <span class="text-red-500">*</span> </label>
                        <InputText id="nomor_sk" v-model="form.nomor_sk" placeholder="Masukkan nomor SK" class="w-full" :class="{ 'p-invalid': submitted && !form.nomor_sk }" />
                        <small v-if="submitted && !form.nomor_sk" class="p-error"> Nomor SK harus diisi </small>
                    </div>
                </div>

                <!-- Tanggal SK -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="tanggal_sk" class="block text-sm font-medium mb-2"> Tanggal SK <span class="text-red-500">*</span> </label>
                        <Calendar id="tanggal_sk" v-model="form.tanggal_sk" date-format="dd/mm/yy" placeholder="Pilih tanggal SK" class="w-full" :class="{ 'p-invalid': submitted && !form.tanggal_sk }" />
                        <small v-if="submitted && !form.tanggal_sk" class="p-error"> Tanggal SK harus diisi </small>
                    </div>
                </div>

                <!-- Gaji Lama -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="gaji_lama" class="block text-sm font-medium mb-2"> Gaji Lama <span class="text-red-500">*</span> </label>
                        <InputNumber id="gaji_lama" v-model="form.gaji_lama" placeholder="Gaji lama" :min="0" :use-grouping="true" class="w-full" :class="{ 'p-invalid': submitted && (form.gaji_lama === null || form.gaji_lama === undefined) }" />
                        <small v-if="submitted && (form.gaji_lama === null || form.gaji_lama === undefined)" class="p-error"> Gaji lama harus diisi </small>
                    </div>
                </div>

                <!-- Gaji Baru -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="gaji_baru" class="block text-sm font-medium mb-2"> Gaji Baru <span class="text-red-500">*</span> </label>
                        <InputNumber id="gaji_baru" v-model="form.gaji_baru" placeholder="Gaji baru" :min="0" :use-grouping="true" class="w-full" :class="{ 'p-invalid': submitted && (form.gaji_baru === null || form.gaji_baru === undefined) }" />
                        <small v-if="submitted && (form.gaji_baru === null || form.gaji_baru === undefined)" class="p-error"> Gaji baru harus diisi </small>
                    </div>
                </div>

                <!-- TMT KGB -->
                <div class="col-12 md:col-6">
                    <div class="field">
                        <label for="tmt_kgb" class="block text-sm font-medium mb-2"> TMT KGB <span class="text-red-500">*</span> </label>
                        <Calendar id="tmt_kgb" v-model="form.tmt_kgb" date-format="dd/mm/yy" placeholder="Pilih TMT KGB" class="w-full" :class="{ 'p-invalid': submitted && !form.tmt_kgb }" />
                        <small v-if="submitted && !form.tmt_kgb" class="p-error"> TMT KGB harus diisi </small>
                    </div>
                </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-content-end gap-2 mt-4">
                <Button type="button" label="Batal" icon="pi pi-times" class="p-button-text" @click="$emit('cancel')" />
                <Button type="submit" :label="editing ? 'Update' : 'Simpan'" icon="pi pi-check" class="p-button-primary" :loading="saving" />
            </div>
        </form>
    </div>
</template>

<style scoped>
.field {
    margin-bottom: 1rem;
}

.p-invalid {
    border-color: #e24c4c;
}
</style>
