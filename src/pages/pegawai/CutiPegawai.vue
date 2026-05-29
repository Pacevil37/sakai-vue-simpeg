<script setup>
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { useAuthStore } from '@/stores/useAuthStore';
import cutiService from '@/services/cutiService';

const authStore = useAuthStore();
const cutiList = ref([]);
const jenisOptions = ref([
  { label: 'Cuti Tahunan', value: 'tahunan' },
  { label: 'Cuti Sakit', value: 'sakit' },
  { label: 'Cuti Melahirkan', value: 'melahirkan' },
  { label: 'Cuti Alasan Penting', value: 'penting' }
]);
const form = ref({
  jenis_cuti: null,
  tanggal_mulai: '',
  tanggal_selesai: '',
  alasan: ''
});
const lampiran = ref(null);

onMounted(async () => {
  const data = await cutiService.getMyCuti();
  cutiList.value = data;
});

function onFileChange(e) {
  lampiran.value = e.target.files[0] || null;
}

async function ajukanCuti() {
  const fd = new FormData();
  fd.append('jenis_cuti', form.value.jenis_cuti?.value || form.value.jenis_cuti || '');
  fd.append('tanggal_mulai', form.value.tanggal_mulai || '');
  fd.append('tanggal_selesai', form.value.tanggal_selesai || '');
  fd.append('alasan', form.value.alasan || '');
  if (lampiran.value) fd.append('lampiran_file', lampiran.value);
  await cutiService.createMyCuti(fd);
  const data = await cutiService.getMyCuti();
  cutiList.value = data;
  form.value = { jenis_cuti: null, tanggal_mulai: '', tanggal_selesai: '', alasan: '' };
  lampiran.value = null;
}
</script>

<template>
  <div class="p-4 max-w-3xl mx-auto">
    <Card>
      <template #title>
        <i class="pi pi-calendar mr-2"></i>
        Pengajuan Cuti Saya
      </template>
      <template #content>
        <div class="space-y-6">
          <Card class="bg-blue-50">
            <template #title>
              <i class="pi pi-plus-circle mr-2"></i>
              Ajukan Cuti
            </template>
            <template #content>
              <form @submit.prevent="ajukanCuti" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block font-semibold mb-1">Jenis Cuti</label>
                  <Dropdown v-model="form.jenis_cuti" :options="jenisOptions" optionLabel="label" placeholder="Pilih jenis" class="w-full" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Tanggal Mulai</label>
                  <DatePicker v-model="form.tanggal_mulai" class="w-full" dateFormat="yy-mm-dd" />
                </div>
                <div>
                  <label class="block font-semibold mb-1">Tanggal Selesai</label>
                  <DatePicker v-model="form.tanggal_selesai" class="w-full" dateFormat="yy-mm-dd" />
                </div>
                <div class="md:col-span-2">
                  <label class="block font-semibold mb-1">Alasan</label>
                  <Textarea v-model="form.alasan" rows="3" class="w-full" />
                </div>
                <div class="md:col-span-2">
                  <label class="block font-semibold mb-1">Lampiran (opsional)</label>
                  <input type="file" @change="onFileChange" class="w-full" />
                </div>
                <div class="md:col-span-2 flex justify-end">
                  <Button label="Ajukan" icon="pi pi-send" class="w-full md:w-auto" />
                </div>
              </form>
            </template>
          </Card>

          <Card>
            <template #title>
              <i class="pi pi-list mr-2"></i>
              Riwayat Pengajuan
            </template>
            <template #content>
              <div v-if="cutiList.length > 0" class="space-y-3">
                <div v-for="item in cutiList" :key="item.id" class="p-4 bg-gray-50 rounded-lg border-l-4" :class="{
                  'border-yellow-500': item.status === 'pending',
                  'border-green-500': item.status === 'approved',
                  'border-red-500': item.status === 'rejected'
                }">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center mb-2">
                        <i class="pi pi-calendar-plus mr-2"></i>
                        <h4 class="font-semibold text-lg">{{ item.jenis_cuti }} ({{ item.jumlah_hari }} hari)</h4>
                      </div>
                      <div class="ml-6 space-y-1">
                        <p class="text-gray-600">
                          <i class="pi pi-clock mr-1"></i>
                          {{ item.tanggal_mulai }} s/d {{ item.tanggal_selesai }}
                        </p>
                        <p class="text-gray-600">
                          <i class="pi pi-file mr-1"></i>
                          Status: <strong class="capitalize">{{ item.status }}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <i class="pi pi-calendar text-4xl text-gray-400"></i>
                <p class="mt-2 text-gray-600">Belum ada pengajuan cuti</p>
              </div>
            </template>
          </Card>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
</style>
