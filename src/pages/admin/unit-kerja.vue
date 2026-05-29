<template>
  <div class="units-page">
    <!-- Header -->
    <div class="units-header">
      <div class="units-header-content">
        <div class="units-header-icon">
          <i class="pi pi-building"></i>
        </div>
        <div>
          <h1 class="units-title">Master Unit Kerja</h1>
          <p class="units-subtitle">Kelola data unit kerja dan bagian di lingkungan kantor</p>
        </div>
      </div>
      <div class="units-header-actions">
        <InputGroup class="search-input">
          <InputGroupAddon>
            <i class="pi pi-search"></i>
          </InputGroupAddon>
          <InputText v-model="searchQuery" placeholder="Cari unit kerja..." />
        </InputGroup>
        <Button icon="pi pi-refresh" severity="secondary" @click="loadData" :loading="loading" />
        <Button label="Tambah Unit" icon="pi pi-plus" @click="openCreate" class="btn-primary" />
      </div>
    </div>

    <!-- Data Table -->
    <div class="units-table-wrap">
      <DataTable
        :value="filteredItems"
        :loading="loading"
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} unit kerja"
        class="units-datatable"
      >
        <Column field="name" header="Nama Unit" sortable></Column>
        <Column field="description" header="Deskripsi"></Column>
        <Column field="created_at" header="Dibuat">
          <template #body="{ data }">
            {{ formatDate(data.created_at) }}
          </template>
        </Column>
        <Column header="Aksi" :exportable="false" style="min-width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button icon="pi pi-pencil" severity="warning" size="small" @click="openEdit(data)" v-tooltip.top="'Edit'" />
              <Button icon="pi pi-trash" severity="danger" size="small" @click="confirmDelete(data)" v-tooltip.top="'Hapus'" />
            </div>
          </template>
        </Column>
        <template #empty>
          <div class="text-center py-4 text-gray-500">Belum ada data unit kerja. Klik "Tambah Unit".</div>
        </template>
      </DataTable>
    </div>

    <!-- Dialog Tambah/Edit -->
    <Dialog
      v-model:visible="showDialog"
      :header="isEditing ? 'Edit Unit Kerja' : 'Tambah Unit Kerja'"
      :style="{ width: '450px' }"
      :modal="true"
    >
      <div class="field">
        <label for="name">Nama Unit <span class="text-red-500">*</span></label>
        <InputText id="name" v-model="form.name" :class="{ 'p-invalid': errors.name }" placeholder="Contoh: Sekretariat, Bidang Pendis" />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>
      <div class="field">
        <label for="description">Deskripsi (opsional)</label>
        <Textarea id="description" v-model="form.description" rows="3" placeholder="Deskripsi singkat tentang unit kerja ini" />
      </div>
      <template #footer>
        <Button label="Batal" severity="secondary" outlined @click="closeDialog" />
        <Button label="Simpan" @click="saveData" :loading="submitting" />
      </template>
    </Dialog>

    <!-- Dialog Konfirmasi Hapus -->
    <Dialog
      v-model:visible="deleteDialog"
      header="Konfirmasi Hapus"
      :style="{ width: '400px' }"
      :modal="true"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Yakin ingin menghapus unit <strong>{{ selectedItem?.name }}</strong>?</span>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" @click="deleteDialog = false" severity="secondary" />
        <Button label="Hapus" icon="pi pi-check" @click="deleteData" severity="danger" :loading="deleting" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';

const toast = useToast();

// State
const items = ref([]);
const loading = ref(false);
const submitting = ref(false);
const deleting = ref(false);
const showDialog = ref(false);
const deleteDialog = ref(false);
const isEditing = ref(false);
const selectedItem = ref(null);
const form = ref({ name: '', description: '' });
const errors = ref({});
const searchQuery = ref('');

// Computed untuk filter
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  const q = searchQuery.value.toLowerCase();
  return items.value.filter(item =>
    item.name.toLowerCase().includes(q) ||
    (item.description && item.description.toLowerCase().includes(q))
  );
});

// Helper
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

// Load data dari Supabase
const loadData = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    items.value = data || [];
  } catch (err) {
    console.error(err);
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message || 'Tidak dapat memuat data unit', life: 3000 });
  } finally {
    loading.value = false;
  }
};

// CRUD
const openCreate = () => {
  isEditing.value = false;
  form.value = { name: '', description: '' };
  errors.value = {};
  showDialog.value = true;
};

const openEdit = (row) => {
  isEditing.value = true;
  selectedItem.value = row;
  form.value = { name: row.name, description: row.description || '' };
  errors.value = {};
  showDialog.value = true;
};

const closeDialog = () => {
  showDialog.value = false;
  form.value = { name: '', description: '' };
  selectedItem.value = null;
};

const validate = () => {
  errors.value = {};
  if (!form.value.name || form.value.name.trim() === '') {
    errors.value.name = 'Nama unit wajib diisi';
  }
  return Object.keys(errors.value).length === 0;
};

const saveData = async () => {
  if (!validate()) return;
  submitting.value = true;
  try {
    const dataToSave = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || null,
      updated_at: new Date().toISOString()
    };
    if (isEditing.value) {
      const { error } = await supabase
        .from('units')
        .update(dataToSave)
        .eq('id', selectedItem.value.id);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Unit diperbarui', life: 3000 });
    } else {
      const { error } = await supabase
        .from('units')
        .insert([{ ...dataToSave, created_at: new Date().toISOString() }]);
      if (error) throw error;
      toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Unit ditambahkan', life: 3000 });
    }
    closeDialog();
    await loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (row) => {
  selectedItem.value = row;
  deleteDialog.value = true;
};

const deleteData = async () => {
  if (!selectedItem.value) return;
  deleting.value = true;
  try {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', selectedItem.value.id);
    if (error) throw error;
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Unit dihapus', life: 3000 });
    deleteDialog.value = false;
    await loadData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.message, life: 3000 });
  } finally {
    deleting.value = false;
    selectedItem.value = null;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* Gaya CSS yang sama seperti positions.vue, konsisten dengan halaman pegawai */
.units-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem 0;
}

.units-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: white;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
}

.units-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.units-header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.units-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.units-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.units-header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  min-width: 250px;
}

.btn-primary {
  font-weight: 600;
}

.units-table-wrap {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  padding: 1rem;
}

.units-datatable {
  width: 100%;
}

.units-datatable :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  font-weight: 600;
  font-size: 0.8125rem;
  padding: 0.75rem 1rem;
}

.units-datatable :deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}

.units-datatable :deep(.p-datatable-tbody > tr:hover) {
  background: #f8fafc;
}

.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: #334155;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
  display: block;
  margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .units-page {
    padding: 1rem;
  }
  .units-header {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    width: 100%;
  }
  .units-header-actions {
    justify-content: flex-start;
  }
}
</style>