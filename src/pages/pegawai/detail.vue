<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Tag from 'primevue/tag';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();

// Data
const loading = ref(true);
const pegawai = ref(null);
const pegawaiId = ref(route.params.id);
const photoLoadFailed = ref(false);

// Riwayat dari tabel terkait
const riwayatPangkat = ref([]);
const riwayatJabatan = ref([]);
const penilaianKinerja = ref([]);
const mutasi = ref([]);
const cuti = ref([]);

// Fetch data pegawai
const loadPegawai = async () => {
  try {
    const { data, error } = await supabase
      .from('pegawai')
      .select('*')
      .eq('id', pegawaiId.value)
      .single();
    if (error) throw error;
    pegawai.value = data;
    photoLoadFailed.value = false;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Gagal memuat data pegawai',
      life: 3000
    });
    pegawai.value = null;
  }
};

// Fetch riwayat pangkat
const loadRiwayatPangkat = async () => {
  const { data, error } = await supabase
    .from('riwayat_pangkat')
    .select('*')
    .eq('pegawai_id', pegawaiId.value)
    .order('tmt_sk', { ascending: false });
  if (!error) riwayatPangkat.value = data || [];
};

// Fetch riwayat jabatan
const loadRiwayatJabatan = async () => {
  const { data, error } = await supabase
    .from('riwayat_jabatan')
    .select('*')
    .eq('pegawai_id', pegawaiId.value)
    .order('tmt', { ascending: false });
  if (!error) riwayatJabatan.value = data || [];
};

// Fetch penilaian kinerja
const loadPenilaianKinerja = async () => {
  const { data, error } = await supabase
    .from('penilaian_kinerja')
    .select('*')
    .eq('pegawai_id', pegawaiId.value)
    .order('tahun', { ascending: false });
  if (!error) penilaianKinerja.value = data || [];
};

// Fetch mutasi
const loadMutasi = async () => {
  const { data, error } = await supabase
    .from('mutasi')
    .select('*')
    .eq('pegawai_id', pegawaiId.value)
    .order('tanggal_mutasi', { ascending: false });
  if (!error) mutasi.value = data || [];
};

// Fetch cuti (opsional)
const loadCuti = async () => {
  const { data, error } = await supabase
    .from('cuti')
    .select('*')
    .eq('pegawai_id', pegawaiId.value)
    .order('tanggal_mulai', { ascending: false });
  if (!error) cuti.value = data || [];
};

const editPegawai = () => {
  router.push(`/pegawai/${pegawaiId.value}/edit`);
};

const goBack = () => {
  router.push('/pegawai');
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID');
};

const formatCurrency = (amount) => {
  if (!amount) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};

const calculateWorkDuration = (hireDate) => {
  if (!hireDate) return '-';
  const start = new Date(hireDate);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  if (years > 0) return `${years} tahun ${months} bulan`;
  else return `${months} bulan`;
};

const getStatusSeverity = (status) => {
  switch (status) {
    case 'aktif': return 'success';
    case 'pensiun': return 'danger';
    case 'mutasi': return 'warning';
    default: return 'info';
  }
};

const getPositionSeverity = (position) => {
  if (!position) return 'info';
  const pos = position.toLowerCase();
  if (pos.includes('kepala')) return 'success';
  if (pos.includes('manager')) return 'success';
  if (pos.includes('supervisor')) return 'info';
  if (pos.includes('staff')) return 'secondary';
  return 'info';
};

const getRatingSeverity = (rating) => {
  if (!rating) return 'secondary';
  if (rating >= 85) return 'success';
  if (rating >= 70) return 'info';
  if (rating >= 50) return 'warning';
  return 'danger';
};

const getMutationTypeSeverity = (type) => {
  if (!type) return 'secondary';
  const t = type.toLowerCase();
  if (t.includes('promosi')) return 'success';
  if (t.includes('mutasi')) return 'info';
  if (t.includes('demosi')) return 'danger';
  return 'secondary';
};

onMounted(async () => {
  await loadPegawai();
  if (pegawai.value) {
    await Promise.all([
      loadRiwayatPangkat(),
      loadRiwayatJabatan(),
      loadPenilaianKinerja(),
      loadMutasi(),
      loadCuti()
    ]);
  }
  loading.value = false;
});
</script>

<template>
  <div class="pegawai-detail-page">
    <div class="pegawai-detail-header">
      <button type="button" class="pegawai-detail-back-link" @click="goBack" aria-label="Kembali">
        <i class="pi pi-arrow-left"></i>
        <span>Kembali ke Daftar Pegawai</span>
      </button>
      <div class="pegawai-detail-header-actions">
        <Button label="Edit" icon="pi pi-pencil" severity="warning" @click="editPegawai" v-if="authStore.canEditPegawai" class="pegawai-detail-btn" />
        <Button label="Kembali" icon="pi pi-arrow-left" severity="secondary" @click="goBack" class="pegawai-detail-btn" />
      </div>
    </div>

    <div v-if="loading" class="pegawai-detail-loading">
      <ProgressSpinner />
      <p class="pegawai-detail-loading-text">Memuat data pegawai...</p>
    </div>

    <div v-else-if="pegawai" class="pegawai-detail-content">
      <!-- Profile Hero Section -->
      <div class="pegawai-detail-hero">
        <div class="pegawai-detail-hero-inner">
          <div class="pegawai-detail-hero-photo-section">
            <div class="pegawai-detail-photo-wrapper">
              <img
                v-if="pegawai.foto_url && !photoLoadFailed"
                :src="pegawai.foto_url"
                alt="Foto Profil"
                class="pegawai-detail-photo"
                @error="photoLoadFailed = true"
              />
              <Avatar
                v-else
                :label="pegawai.nama?.charAt(0) || '?'"
                shape="circle"
                size="xlarge"
                class="pegawai-detail-avatar-fallback"
              />
            </div>
            <h1 class="pegawai-detail-hero-name">{{ pegawai.nama }}</h1>
            <p class="pegawai-detail-hero-nip">{{ pegawai.nip }}</p>
            <div class="pegawai-detail-hero-status">
              <Tag :value="pegawai.status === 'aktif' ? 'Aktif' : (pegawai.status === 'pensiun' ? 'Pensiun' : 'Mutasi')" :severity="getStatusSeverity(pegawai.status)" />
            </div>
            <div class="pegawai-detail-hero-contact">
              <p class="pegawai-detail-hero-contact-item"><i class="pi pi-envelope"></i>{{ pegawai.email || '-' }}</p>
              <p v-if="pegawai.no_hp" class="pegawai-detail-hero-contact-item"><i class="pi pi-phone"></i>{{ pegawai.no_hp }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Informasi Cards -->
      <div class="pegawai-detail-cards">
        <!-- Personal Information -->
        <div class="pegawai-detail-card">
          <div class="pegawai-detail-card-header pegawai-detail-card-header--blue">
            <div class="pegawai-detail-card-icon pegawai-detail-card-icon--blue">
              <i class="pi pi-user"></i>
            </div>
            <h3 class="pegawai-detail-card-title">Informasi Pribadi</h3>
          </div>
          <div class="pegawai-detail-card-body">
            <div class="pegawai-detail-grid">
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">NIP</label>
                <p class="pegawai-detail-field-value">{{ pegawai.nip }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Nama Lengkap</label>
                <p class="pegawai-detail-field-value">{{ pegawai.nama }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Email</label>
                <p class="pegawai-detail-field-value">{{ pegawai.email || '-' }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">No. Telepon</label>
                <p class="pegawai-detail-field-value">{{ pegawai.no_hp || '-' }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Tempat Lahir</label>
                <p class="pegawai-detail-field-value">{{ pegawai.tempat_lahir || '-' }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Tanggal Lahir</label>
                <p class="pegawai-detail-field-value">{{ formatDate(pegawai.tanggal_lahir) }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Jenis Kelamin</label>
                <p class="pegawai-detail-field-value">{{ pegawai.jenis_kelamin || '-' }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--12">
                <label class="pegawai-detail-field-label">Alamat</label>
                <p class="pegawai-detail-field-value">{{ pegawai.alamat || '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Work Information -->
        <div class="pegawai-detail-card">
          <div class="pegawai-detail-card-header pegawai-detail-card-header--green">
            <div class="pegawai-detail-card-icon pegawai-detail-card-icon--green">
              <i class="pi pi-briefcase"></i>
            </div>
            <h3 class="pegawai-detail-card-title">Informasi Pekerjaan</h3>
          </div>
          <div class="pegawai-detail-card-body">
            <div class="pegawai-detail-grid">
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Jabatan</label>
                <p class="pegawai-detail-field-value">
                  <Tag :value="pegawai.jabatan || '-'" :severity="getPositionSeverity(pegawai.jabatan)" />
                </p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Golongan</label>
                <p class="pegawai-detail-field-value">{{ pegawai.golongan || '-' }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">TMT Pangkat</label>
                <p class="pegawai-detail-field-value">{{ formatDate(pegawai.tmt_pangkat) }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Pendidikan</label>
                <p class="pegawai-detail-field-value">{{ pegawai.pendidikan || '-' }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Tanggal Masuk</label>
                <p class="pegawai-detail-field-value">{{ formatDate(pegawai.created_at) }}</p>
              </div>
              <div class="pegawai-detail-field pegawai-detail-field--6">
                <label class="pegawai-detail-field-label">Lama Bekerja</label>
                <p class="pegawai-detail-field-value">{{ calculateWorkDuration(pegawai.created_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Riwayat Pangkat -->
        <div class="pegawai-detail-card pegawai-detail-card--table">
          <div class="pegawai-detail-card-header pegawai-detail-card-header--purple">
            <div class="pegawai-detail-card-icon pegawai-detail-card-icon--purple">
              <i class="pi pi-chart-line"></i>
            </div>
            <h3 class="pegawai-detail-card-title">Riwayat Pangkat</h3>
          </div>
          <div v-if="riwayatPangkat.length > 0" class="pegawai-detail-table-wrap">
            <DataTable
              :value="riwayatPangkat"
              :rows="5"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} riwayat"
              class="pegawai-detail-datatable"
            >
              <Column field="golongan_lama" header="Golongan Lama"></Column>
              <Column field="golongan_baru" header="Golongan Baru"></Column>
              <Column field="tmt_sk" header="TMT SK">
                <template #body="{ data }">{{ formatDate(data.tmt_sk) }}</template>
              </Column>
              <Column field="no_sk" header="No. SK"></Column>
            </DataTable>
          </div>
          <div v-else class="pegawai-detail-empty">
            <i class="pi pi-info-circle pegawai-detail-empty-icon"></i>
            <p class="pegawai-detail-empty-text">Belum ada data riwayat pangkat</p>
          </div>
        </div>

        <!-- Riwayat Jabatan -->
        <div class="pegawai-detail-card pegawai-detail-card--table">
          <div class="pegawai-detail-card-header pegawai-detail-card-header--purple">
            <div class="pegawai-detail-card-icon pegawai-detail-card-icon--purple">
              <i class="pi pi-briefcase"></i>
            </div>
            <h3 class="pegawai-detail-card-title">Riwayat Jabatan</h3>
          </div>
          <div v-if="riwayatJabatan.length > 0" class="pegawai-detail-table-wrap">
            <DataTable
              :value="riwayatJabatan"
              :rows="5"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} riwayat"
              class="pegawai-detail-datatable"
            >
              <Column field="jabatan_lama" header="Jabatan Lama"></Column>
              <Column field="jabatan_baru" header="Jabatan Baru"></Column>
              <Column field="tmt" header="TMT">
                <template #body="{ data }">{{ formatDate(data.tmt) }}</template>
              </Column>
              <Column field="no_sk" header="No. SK"></Column>
            </DataTable>
          </div>
          <div v-else class="pegawai-detail-empty">
            <i class="pi pi-info-circle pegawai-detail-empty-icon"></i>
            <p class="pegawai-detail-empty-text">Belum ada data riwayat jabatan</p>
          </div>
        </div>

        <!-- Penilaian Kinerja -->
        <div class="pegawai-detail-card pegawai-detail-card--table">
          <div class="pegawai-detail-card-header pegawai-detail-card-header--chart">
            <div class="pegawai-detail-card-icon pegawai-detail-card-icon--chart">
              <i class="pi pi-chart-line"></i>
            </div>
            <h3 class="pegawai-detail-card-title">Penilaian Kinerja</h3>
          </div>
          <div v-if="penilaianKinerja.length > 0" class="pegawai-detail-table-wrap">
            <DataTable
              :value="penilaianKinerja"
              :rows="5"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} penilaian"
              class="pegawai-detail-datatable"
            >
              <Column field="tahun" header="Tahun"></Column>
              <Column field="nilai" header="Nilai">
                <template #body="{ data }">
                  <Tag :value="data.nilai" :severity="getRatingSeverity(data.nilai)" />
                </template>
              </Column>
              <Column field="periode" header="Periode"></Column>
              <Column field="penilai" header="Penilai"></Column>
              <Column field="komentar" header="Komentar"></Column>
            </DataTable>
          </div>
          <div v-else class="pegawai-detail-empty">
            <i class="pi pi-info-circle pegawai-detail-empty-icon"></i>
            <p class="pegawai-detail-empty-text">Belum ada data penilaian kinerja</p>
          </div>
        </div>

        <!-- Mutasi -->
        <div class="pegawai-detail-card pegawai-detail-card--table">
          <div class="pegawai-detail-card-header pegawai-detail-card-header--sync">
            <div class="pegawai-detail-card-icon pegawai-detail-card-icon--sync">
              <i class="pi pi-sync"></i>
            </div>
            <h3 class="pegawai-detail-card-title">Riwayat Mutasi</h3>
          </div>
          <div v-if="mutasi.length > 0" class="pegawai-detail-table-wrap">
            <DataTable
              :value="mutasi"
              :rows="5"
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} mutasi"
              class="pegawai-detail-datatable"
            >
              <Column field="dari_unit" header="Dari Unit"></Column>
              <Column field="ke_unit" header="Ke Unit"></Column>
              <Column field="tanggal_mutasi" header="Tanggal Mutasi">
                <template #body="{ data }">{{ formatDate(data.tanggal_mutasi) }}</template>
              </Column>
              <Column field="surat_sk_file" header="SK">
                <template #body="{ data }">
                  <a v-if="data.surat_sk_file" :href="data.surat_sk_file" target="_blank" class="pegawai-detail-link">Lihat SK</a>
                  <span v-else>-</span>
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else class="pegawai-detail-empty">
            <i class="pi pi-info-circle pegawai-detail-empty-icon"></i>
            <p class="pegawai-detail-empty-text">Belum ada data mutasi</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="pegawai-detail-not-found">
      <i class="pi pi-exclamation-triangle pegawai-detail-not-found-icon"></i>
      <h3 class="pegawai-detail-not-found-title">Data Pegawai Tidak Ditemukan</h3>
      <p class="pegawai-detail-not-found-desc">Pegawai dengan ID tersebut tidak ditemukan atau telah dihapus.</p>
      <Button label="Kembali ke Daftar Pegawai" icon="pi pi-arrow-left" @click="goBack" />
    </div>
  </div>
</template>


<style scoped>
/* Semua style dari kode asli tetap dipertahankan – tidak diubah */
.pegawai-detail-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 1.5rem 0;
}

.pegawai-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.pegawai-detail-back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    background: none;
    border: none;
    color: #64748b;
    font-size: 0.875rem;
    cursor: pointer;
    transition: color 0.2s;
}

.pegawai-detail-back-link:hover {
    color: #3b82f6;
}

.pegawai-detail-header-actions {
    display: flex;
    gap: 0.5rem;
}

.pegawai-detail-loading {
    text-align: center;
    padding: 3rem 1rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.pegawai-detail-loading-text {
    margin-top: 0.75rem;
    color: #64748b;
    font-size: 0.875rem;
}

/* Hero */
.pegawai-detail-hero {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
    border-radius: 1rem;
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.pegawai-detail-hero-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.pegawai-detail-hero-photo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.pegawai-detail-photo-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

.pegawai-detail-photo {
    width: 8.75rem;
    height: 8.75rem;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255,255,255,0.9);
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.pegawai-detail-avatar-fallback {
    flex-shrink: 0;
    border: 4px solid rgba(255,255,255,0.9);
    background: rgba(255,255,255,0.2) !important;
    color: white !important;
}

.pegawai-detail-hero-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.pegawai-detail-hero-nip {
    font-size: 0.9375rem;
    color: rgba(255,255,255,0.9);
    margin: 0;
}

.pegawai-detail-hero-status {
    margin: 0.25rem 0;
}

.pegawai-detail-hero-contact {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-top: 0.5rem;
}

.pegawai-detail-hero-contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255,255,255,0.95);
}

.pegawai-detail-hero-contact-item i {
    opacity: 0.9;
}

/* Content layout */
.pegawai-detail-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.pegawai-detail-cards {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Cards */
.pegawai-detail-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    border: 1px solid #e2e8f0;
    overflow: hidden;
}

.pegawai-detail-card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
}

.pegawai-detail-card-header--blue { background: #f8fafc; }
.pegawai-detail-card-header--green { background: #f0fdf4; }
.pegawai-detail-card-header--purple { background: #faf5ff; }
.pegawai-detail-card-header--chart { background: #eff6ff; }
.pegawai-detail-card-header--sync { background: #fefce8; }

.pegawai-detail-card-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.pegawai-detail-card-icon--blue { background: #dbeafe; color: #2563eb; }
.pegawai-detail-card-icon--green { background: #dcfce7; color: #16a34a; }
.pegawai-detail-card-icon--purple { background: #ede9fe; color: #7c3aed; }
.pegawai-detail-card-icon--chart { background: #bfdbfe; color: #1d4ed8; }
.pegawai-detail-card-icon--sync { background: #fef08a; color: #ca8a04; }

.pegawai-detail-card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
}

.pegawai-detail-card-body {
    padding: 1.5rem;
}

.pegawai-detail-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.25rem;
}

@media (min-width: 768px) {
    .pegawai-detail-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.pegawai-detail-field--12 {
    grid-column: 1 / -1;
}

.pegawai-detail-field-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #64748b;
    margin-bottom: 0.25rem;
}

.pegawai-detail-field-value {
    font-size: 0.9375rem;
    color: #0f172a;
    margin: 0;
    font-weight: 500;
}

/* DataTable */
.pegawai-detail-table-wrap {
    padding: 0 1.5rem 1.5rem;
}

.pegawai-detail-datatable :deep(.p-datatable-thead > tr > th) {
    background: #f8fafc;
    font-weight: 600;
    font-size: 0.8125rem;
}

.pegawai-detail-datatable :deep(.p-datatable-tbody > tr:hover) {
    background: #f8fafc;
}

.pegawai-detail-table-bold {
    font-weight: 500;
}

.pegawai-detail-table-muted {
    font-size: 0.875rem;
    color: #64748b;
}

/* Empty state */
.pegawai-detail-empty {
    text-align: center;
    padding: 2rem 1rem;
    color: #94a3b8;
}

.pegawai-detail-empty-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 0.5rem;
}

.pegawai-detail-empty-text {
    margin: 0;
    font-size: 0.875rem;
}

/* Not found */
.pegawai-detail-not-found {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.pegawai-detail-not-found-icon {
    font-size: 2.5rem;
    color: #f59e0b;
    display: block;
    margin-bottom: 0.75rem;
}

.pegawai-detail-not-found-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 0.5rem 0;
}

.pegawai-detail-not-found-desc {
    color: #64748b;
    font-size: 0.875rem;
    margin: 0 0 1rem 0;
}
</style>