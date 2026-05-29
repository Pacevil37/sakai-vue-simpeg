<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import PendidikanFormModal from '@/components/PendidikanFormModal.vue';
import educationService from '@/services/educationService';

// Composables
const toast = useToast();

// Reactive data
const activeTab = ref(0);
const riwayatPendidikan = ref([]);
const riwayatDiklat = ref([]);
const loading = ref(false);
const deleting = ref(false);
const formModalVisible = ref(false);
const deleteDialogVisible = ref(false);
const selectedPendidikan = ref(null);
const isEditing = ref(false);
const itemToDelete = ref(null);
const isDeletingDiklat = ref(false);

const filtersPendidikan = ref({
    search: '',
    jenjang: '',
    page: 1,
    limit: 10
});

const filtersDiklat = ref({
    search: '',
    tahun: null,
    page: 1,
    limit: 10
});

const paginationPendidikan = ref({
    first: 0,
    page: 1,
    limit: 10
});

const paginationDiklat = ref({
    first: 0,
    page: 1,
    limit: 10
});

// Computed
const totalPendidikan = ref(0);
const totalDiklat = ref(0);

const jenjangOptions = ref(['SD', 'SMP', 'SMA', 'SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3']);

// Methods
const loadRiwayatPendidikan = async () => {
    try {
        loading.value = true;
        const response = await educationService.getRiwayatPendidikan({
            ...filtersPendidikan.value,
            page: paginationPendidikan.value.page,
            limit: paginationPendidikan.value.limit
        });

        riwayatPendidikan.value = response.data || [];
        totalPendidikan.value = response.data?.total || 0;
    } catch (error) {
        console.error('Error loading riwayat pendidikan:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data riwayat pendidikan',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const loadRiwayatDiklat = async () => {
    try {
        loading.value = true;
        const response = await educationService.getRiwayatDiklat({
            ...filtersDiklat.value,
            page: paginationDiklat.value.page,
            limit: paginationDiklat.value.limit
        });

        riwayatDiklat.value = response.data || [];
        totalDiklat.value = response.data?.total || 0;
    } catch (error) {
        console.error('Error loading riwayat diklat:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data riwayat diklat',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const resetFiltersPendidikan = () => {
    filtersPendidikan.value = {
        search: '',
        jenjang: '',
        page: 1,
        limit: 10
    };
    paginationPendidikan.value = {
        first: 0,
        page: 1,
        limit: 10
    };
    loadRiwayatPendidikan();
};

const resetFiltersDiklat = () => {
    filtersDiklat.value = {
        search: '',
        tahun: null,
        page: 1,
        limit: 10
    };
    paginationDiklat.value = {
        first: 0,
        page: 1,
        limit: 10
    };
    loadRiwayatDiklat();
};

const onPageChangePendidikan = (event) => {
    paginationPendidikan.value.first = event.first;
    paginationPendidikan.value.page = event.page + 1;
    paginationPendidikan.value.limit = event.rows;
    loadRiwayatPendidikan();
};

const onPageChangeDiklat = (event) => {
    paginationDiklat.value.first = event.first;
    paginationDiklat.value.page = event.page + 1;
    paginationDiklat.value.limit = event.rows;
    loadRiwayatDiklat();
};

const openCreateModal = () => {
    selectedPendidikan.value = null;
    isEditing.value = false;
    formModalVisible.value = true;
};

const editRiwayatPendidikan = (pendidikan) => {
    selectedPendidikan.value = pendidikan;
    isEditing.value = true;
    formModalVisible.value = true;
};

const viewRiwayatPendidikan = (pendidikan) => {
    selectedPendidikan.value = pendidikan;
    isEditing.value = false;
    formModalVisible.value = true;
};

const editRiwayatDiklat = (diklat) => {
    selectedPendidikan.value = diklat;
    isEditing.value = true;
    formModalVisible.value = true;
};

const viewRiwayatDiklat = (diklat) => {
    selectedPendidikan.value = diklat;
    isEditing.value = false;
    formModalVisible.value = true;
};

const closeFormModal = () => {
    formModalVisible.value = false;
    selectedPendidikan.value = null;
};

const onPendidikanSaved = () => {
    closeFormModal();
    if (activeTab.value === 0) {
        loadRiwayatPendidikan();
    } else {
        loadRiwayatDiklat();
    }
    toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: isEditing.value ? 'Data berhasil diperbarui' : 'Data baru berhasil ditambahkan',
        life: 3000
    });
};

const confirmDeletePendidikan = (pendidikan) => {
    itemToDelete.value = pendidikan;
    isDeletingDiklat.value = false;
    deleteDialogVisible.value = true;
};

const confirmDeleteDiklat = (diklat) => {
    itemToDelete.value = diklat;
    isDeletingDiklat.value = true;
    deleteDialogVisible.value = true;
};

const deleteItem = async () => {
    try {
        deleting.value = true;

        if (isDeletingDiklat.value) {
            await educationService.deleteRiwayatDiklat(itemToDelete.value.id);
        } else {
            await educationService.deleteRiwayatPendidikan(itemToDelete.value.id);
        }

        deleteDialogVisible.value = false;
        itemToDelete.value = null;

        if (isDeletingDiklat.value) {
            loadRiwayatDiklat();
        } else {
            loadRiwayatPendidikan();
        }

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Data berhasil dihapus',
            life: 3000
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal menghapus data',
            life: 3000
        });
    } finally {
        deleting.value = false;
    }
};

// Lifecycle
onMounted(() => {
    loadRiwayatPendidikan();
    loadRiwayatDiklat();
});
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <div class="flex justify-content-between align-items-center mb-4">
                    <h5>Manajemen Pendidikan</h5>
                    <div class="flex gap-2">
                        <Button :label="activeTab === 0 ? 'Tambah Riwayat Pendidikan' : 'Tambah Riwayat Diklat'" icon="pi pi-plus" class="p-button-primary" @click="openCreateModal" />
                    </div>
                </div>

                <!-- Tab View -->
                <TabView v-model:activeIndex="activeTab" class="mb-4">
                    <TabPanel header="Riwayat Pendidikan">
                        <!-- Filters for Pendidikan -->
                        <div class="grid mb-4">
                            <div class="col-12 md:col-4">
                                <label class="block font-medium mb-2">Cari</label>
                                <InputText v-model="filtersPendidikan.search" placeholder="Cari nama pegawai, jenjang..." class="w-full" @keyup.enter="loadRiwayatPendidikan" />
                            </div>
                            <div class="col-12 md:col-4">
                                <label class="block font-medium mb-2">Jenjang</label>
                                <Dropdown v-model="filtersPendidikan.jenjang" :options="jenjangOptions" placeholder="Pilih jenjang" class="w-full" show-clear @change="loadRiwayatPendidikan" />
                            </div>
                            <div class="col-12 md:col-4">
                                <label class="block font-medium mb-2">&nbsp;</label>
                                <div class="flex gap-2">
                                    <Button label="Cari" icon="pi pi-search" class="p-button-primary" @click="loadRiwayatPendidikan" />
                                    <Button label="Reset" icon="pi pi-times" class="p-button-secondary" @click="resetFiltersPendidikan" />
                                </div>
                            </div>
                        </div>

                        <!-- Riwayat Pendidikan Table -->
                        <DataTable
                            :value="riwayatPendidikan"
                            :loading="loading"
                            :paginator="true"
                            :rows="10"
                            :rowsPerPageOptions="[5, 10, 25, 50]"
                            :totalRecords="totalPendidikan"
                            :first="paginationPendidikan.first"
                            tableStyle="min-width: 50rem"
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} to {last} of {totalRecords} riwayat pendidikan"
                            responsiveLayout="scroll"
                            @page="onPageChangePendidikan"
                        >
                            <template #empty>
                                <div class="text-center py-4">
                                    <i class="pi pi-info-circle text-4xl text-gray-400 mb-3"></i>
                                    <p class="text-gray-500">Tidak ada data riwayat pendidikan ditemukan</p>
                                </div>
                            </template>

                            <Column field="nama_lengkap" header="Nama Pegawai" style="width: 20%">
                                <template #body="slotProps">
                                    <div class="font-medium">{{ slotProps.data.nama_lengkap }}</div>
                                    <small class="text-gray-500">{{ slotProps.data.nip }}</small>
                                </template>
                            </Column>

                            <Column field="jenjang" header="Jenjang" style="width: 15%">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.jenjang }}</span>
                                </template>
                            </Column>

                            <Column field="institusi" header="Institusi" style="width: 25%">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.institusi }}</span>
                                </template>
                            </Column>

                            <Column field="tahun_lulus" header="Tahun Lulus" style="width: 15%">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.tahun_lulus }}</span>
                                </template>
                            </Column>

                            <Column header="Aksi" style="width: 25%">
                                <template #body="slotProps">
                                    <div class="flex gap-2">
                                        <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-info p-button-sm" @click="viewRiwayatPendidikan(slotProps.data)" v-tooltip.top="'Lihat Detail'" />
                                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-warning p-button-sm" @click="editRiwayatPendidikan(slotProps.data)" v-tooltip.top="'Edit'" />
                                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="confirmDeletePendidikan(slotProps.data)" v-tooltip.top="'Hapus'" />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </TabPanel>

                    <TabPanel header="Riwayat Diklat">
                        <!-- Filters for Diklat -->
                        <div class="grid mb-4">
                            <div class="col-12 md:col-4">
                                <label class="block font-medium mb-2">Cari</label>
                                <InputText v-model="filtersDiklat.search" placeholder="Cari nama pegawai, diklat..." class="w-full" @keyup.enter="loadRiwayatDiklat" />
                            </div>
                            <div class="col-12 md:col-4">
                                <label class="block font-medium mb-2">Tahun</label>
                                <InputNumber v-model="filtersDiklat.tahun" placeholder="Tahun diklat" class="w-full" :use-grouping="false" @keyup.enter="loadRiwayatDiklat" />
                            </div>
                            <div class="col-12 md:col-4">
                                <label class="block font-medium mb-2">&nbsp;</label>
                                <div class="flex gap-2">
                                    <Button label="Cari" icon="pi pi-search" class="p-button-primary" @click="loadRiwayatDiklat" />
                                    <Button label="Reset" icon="pi pi-times" class="p-button-secondary" @click="resetFiltersDiklat" />
                                </div>
                            </div>
                        </div>

                        <!-- Riwayat Diklat Table -->
                        <DataTable
                            :value="riwayatDiklat"
                            :loading="loading"
                            :paginator="true"
                            :rows="10"
                            :rowsPerPageOptions="[5, 10, 25, 50]"
                            :totalRecords="totalDiklat"
                            :first="paginationDiklat.first"
                            tableStyle="min-width: 50rem"
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} to {last} of {totalRecords} riwayat diklat"
                            responsiveLayout="scroll"
                            @page="onPageChangeDiklat"
                        >
                            <template #empty>
                                <div class="text-center py-4">
                                    <i class="pi pi-info-circle text-4xl text-gray-400 mb-3"></i>
                                    <p class="text-gray-500">Tidak ada data riwayat diklat ditemukan</p>
                                </div>
                            </template>

                            <Column field="nama_lengkap" header="Nama Pegawai" style="width: 20%">
                                <template #body="slotProps">
                                    <div class="font-medium">{{ slotProps.data.nama_lengkap }}</div>
                                    <small class="text-gray-500">{{ slotProps.data.nip }}</small>
                                </template>
                            </Column>

                            <Column field="nama_diklat" header="Nama Diklat" style="width: 25%">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.nama_diklat }}</span>
                                </template>
                            </Column>

                            <Column field="penyelenggara" header="Penyelenggara" style="width: 20%">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.penyelenggara }}</span>
                                </template>
                            </Column>

                            <Column field="tahun" header="Tahun" style="width: 15%">
                                <template #body="slotProps">
                                    <span>{{ slotProps.data.tahun }}</span>
                                </template>
                            </Column>

                            <Column header="Aksi" style="width: 20%">
                                <template #body="slotProps">
                                    <div class="flex gap-2">
                                        <Button icon="pi pi-eye" class="p-button-rounded p-button-text p-button-info p-button-sm" @click="viewRiwayatDiklat(slotProps.data)" v-tooltip.top="'Lihat Detail'" />
                                        <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-warning p-button-sm" @click="editRiwayatDiklat(slotProps.data)" v-tooltip.top="'Edit'" />
                                        <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger p-button-sm" @click="confirmDeleteDiklat(slotProps.data)" v-tooltip.top="'Hapus'" />
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>

    <!-- Pendidikan Form Modal -->
    <PendidikanFormModal :visible="formModalVisible" :pendidikan="selectedPendidikan" :isEditing="isEditing" :isDiklat="activeTab === 1" @hide="closeFormModal" @saved="onPendidikanSaved" />

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="deleteDialogVisible" header="Konfirmasi Hapus" :modal="true" :closable="true" class="p-fluid" style="width: 400px">
        <div class="text-center">
            <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
            <p class="mb-3">Apakah Anda yakin ingin menghapus data ini?</p>
            <p class="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
        </div>

        <template #footer>
            <Button label="Batal" icon="pi pi-times" class="p-button-text" @click="deleteDialogVisible = false" />
            <Button label="Hapus" icon="pi pi-trash" class="p-button-danger" :loading="deleting" @click="deleteItem" />
        </template>
    </Dialog>

    <!-- Toast -->
    <Toast />
</template>

<style scoped>
.card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.p-button-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
}

.font-mono {
    font-family: 'Courier New', monospace;
}
</style>
