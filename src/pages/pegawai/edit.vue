<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';

// PrimeVue 4 Core Components (Clean, Fast & Lightweight)
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const route = useRoute();
const toast = useToast();

// State Management
const loading = ref(true);
const submitting = ref(false);
const pegawaiId = ref(route.params.id);
const errors = ref({});

const form = ref({
    nip: '',
    nama: '',
    email: '',
    no_hp: '',
    tempat_lahir: '',
    tanggal_lahir: null,
    alamat: '',
    jabatan: '',
    golongan: null,
    unit_kerja_id: null,
    pendidikan: null,
    tmt_pangkat: null,
    status: 'aktif',
    jenis_kelamin: null
});

// Master Data Registry
const unitOptions = ref([]);
const golonganOptions = ref([
    'I/a', 'I/b', 'I/c', 'I/d',
    'II/a', 'II/b', 'II/c', 'II/d',
    'III/a', 'III/b', 'III/c', 'III/d',
    'IV/a', 'IV/b', 'IV/c', 'IV/d'
]);
const pendidikanOptions = ref(['SD', 'SMP', 'SMA', 'D3', 'D4', 'S1', 'S2', 'S3']);
const genderOptions = ref([
    { label: 'Laki-Laki', value: 'Laki-laki' },
    { label: 'Perempuan', value: 'Perempuan' }
]);
const statusOptions = ref([
    { label: 'Aktif Bekerja', value: 'aktif' },
    { label: 'Purna Bakti / Pensiun', value: 'pensiun' },
    { label: 'Mutasi Instansi', value: 'mutasi' }
]);

// Sinkronisasi Master Data Unit Kerja
const fetchUnits = async () => {
    try {
        const { data, error } = await supabase.from('units').select('id, name').order('name');
        if (error) throw error;
        unitOptions.value = data.map(u => ({ label: u.name, value: u.id }));
    } catch (err) {
        console.error('Infrastruktur Relasi Gagal:', err);
    }
};

// Ambil Data Existing Pegawai dari Repositori
const loadPegawai = async () => {
    try {
        const { data, error } = await supabase
            .from('pegawai')
            .select('*')
            .eq('id', pegawaiId.value)
            .single();

        if (error) throw error;
        if (!data) throw new Error('Entitas data tidak ditemukan.');

        form.value = {
            nip: data.nip || '',
            nama: data.nama || '',
            email: data.email || '',
            no_hp: data.no_hp || '',
            tempat_lahir: data.tempat_lahir || '',
            // Mengonversi string date dari PostgreSQL ke objek Date JavaScript secara aman
            tanggal_lahir: data.tanggal_lahir ? new Date(data.tanggal_lahir) : null,
            alamat: data.alamat || '',
            jabatan: data.jabatan || '',
            golongan: data.golongan || null,
            unit_kerja_id: data.unit_kerja_id || null,
            pendidikan: data.pendidikan || null,
            tmt_pangkat: data.tmt_pangkat ? new Date(data.tmt_pangkat) : null,
            status: data.status || 'aktif',
            jenis_kelamin: data.jenis_kelamin || null
        };
    } catch (err) {
        console.error('Data Fetch Error:', err);
        toast.add({ severity: 'error', summary: 'Gagal Memuat', detail: err.message || 'Profil aparatur gagal diunduh.', life: 4000 });
        router.push('/pegawai');
    } finally {
        loading.value = false;
    }
};

// Proteksi Pergeseran Hari Akibat Selisih UTC/Timezone Lokal
const formatLocalDate = (dateObj) => {
    if (!dateObj) return null;
    const offset = dateObj.getTimezoneOffset();
    const correctedDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
    return correctedDate.toISOString().split('T')[0];
};

// Validasi Lapisan Klien (Selaras dengan Kekuatan SQL Database Constraints)
const validateForm = () => {
    errors.value = {};
    
    if (!form.value.nip) {
        errors.value.nip = 'Nomor Induk Pegawai (NIP) wajib dicantumkan.';
    } else if (!/^\d+$/.test(form.value.nip)) {
        errors.value.nip = 'NIP hanya boleh diisi karakter angka numerik.';
    } else if (form.value.nip.length < 9 || form.value.nip.length > 20) {
        errors.value.nip = 'Panjang NIP harus berada di rentang 9 sampai 20 digit.';
    }

    if (!form.value.nama) {
        errors.value.nama = 'Nama lengkap aparatur sipil wajib diisi.';
    } else if (form.value.nama.trim().length < 2) {
        errors.value.nama = 'Input nama tidak valid (minimal 2 karakter).';
    }
    
    if (!form.value.email) {
        errors.value.email = 'Alamat email korespondensi dinas wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = 'Format alamat email tidak dikenali.';
    }

    if (!form.value.jabatan) errors.value.jabatan = 'Klasifikasi jabatan struktural wajib ditentukan.';
    if (!form.value.golongan) errors.value.golongan = 'Golongan ruang pangkat aktif wajib dipilih.';
    if (!form.value.status) errors.value.status = 'Status hubungan kerja wajib ditentukan.';

    return Object.keys(errors.value).length === 0;
};

// Eksekusi Transaksi Pembaruan Data (Update Ledger)
const handleSubmit = async () => {
    if (!validateForm()) {
        toast.add({ severity: 'warn', summary: 'Aksi Ditolak', detail: 'Mohon periksa kembali kolom input yang bermasalah.', life: 4000 });
        return;
    }

    submitting.value = true;
    try {
        const payload = {
            nip: form.value.nip.trim(),
            nama: form.value.nama.trim(),
            email: form.value.email.trim().toLowerCase(),
            no_hp: form.value.no_hp?.trim() || null,
            tempat_lahir: form.value.tempat_lahir?.trim() || null,
            alamat: form.value.alamat?.trim() || null,
            jabatan: form.value.jabatan.trim(),
            golongan: form.value.golongan,
            unit_kerja_id: form.value.unit_kerja_id || null,
            pendidikan: form.value.pendidikan || null,
            status: form.value.status,
            jenis_kelamin: form.value.jenis_kelamin || null,
            tanggal_lahir: formatLocalDate(form.value.tanggal_lahir),
            tmt_pangkat: formatLocalDate(form.value.tmt_pangkat)
        };

        const { error } = await supabase
            .from('pegawai')
            .update(payload)
            .eq('id', pegawaiId.value);
        
        if (error) {
            // Intersepsi Pelanggaran Unique Constraint Database (PostgreSQL Error Code 23505)
            if (error.code === '23505') {
                if (error.message.includes('nip')) errors.value.nip = 'NIP ini telah terdaftar pada pegawai lain.';
                if (error.message.includes('email')) errors.value.email = 'Alamat email ini telah diklaim oleh pegawai lain.';
                throw new Error('Validasi data gagal karena mendeteksi konflik data unik.');
            }
            throw error;
        }

        toast.add({ severity: 'success', summary: 'Perubahan Disimpan', detail: 'Profil data aparatur berhasil diperbarui.', life: 3000 });
        router.push('/pegawai');
    } catch (err) {
        console.error('Transaction Aborted:', err);
        toast.add({ severity: 'error', summary: 'Gagal Memperbarui', detail: err.message || 'Pangkalan data menolak request modifikasi.', life: 4000 });
    } finally {
        submitting.value = false;
    }
};

const goBack = () => router.push('/pegawai');

onMounted(async () => {
    loading.value = true;
    // Menggunakan Promise.all untuk fetch paralel yang jauh lebih cepat
    await Promise.all([fetchUnits(), loadPegawai()]);
    loading.value = false;
});
</script>

<template>
    <div class="p-6 md:p-12 max-w-[1300px] mx-auto w-full flex flex-col gap-8 bg-white dark:bg-zinc-950 min-h-screen antialiased text-zinc-900 dark:text-zinc-50">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-900">
            <div>
                <div class="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mb-1.5 flex items-center gap-2">
                    <i class="pi pi-user-edit text-[10px] text-amber-500"></i> Mode Modifikasi Data
                </div>
                <h1 class="text-xl font-semibold tracking-tight m-0 text-zinc-900 dark:text-white">Perbarui Profil Pegawai</h1>
                <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-1">Lakukan perubahan pada data administrasi atau struktural pegawai di bawah ini.</p>
            </div>
            <Button 
                label="Kembali" 
                icon="pi pi-arrow-left" 
                class="font-semibold text-xs text-zinc-600 dark:text-zinc-400 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 px-3.5 transition-all self-start sm:self-center" 
                @click="goBack" 
            />
        </div>

        <div v-if="loading" class="flex justify-center items-center py-24">
            <ProgressSpinner strokeWidth="3" class="w-8 h-8" />
        </div>

        <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-8">
            
            <div class="bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800/60 rounded-xl p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                
                <div class="col-span-1 md:col-span-2 mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-900 flex items-center gap-2 text-zinc-400">
                    <i class="pi pi-id-card text-xs"></i>
                    <span class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Berkas Identitas Otentik</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">NIP <span class="text-red-500">*</span></label>
                    <InputText v-model="form.nip" placeholder="Contoh: 19940212..." class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 focus:border-zinc-400 dark:focus:border-zinc-700 shadow-sm transition-all" :class="{ '!border-red-400 focus:!ring-0': errors.nip }" />
                    <span v-if="errors.nip" class="text-[11px] text-red-500 font-medium tracking-tight mt-0.5 flex items-center gap-1"><i class="pi pi-info-circle text-[10px]"></i>{{ errors.nip }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Nama Lengkap <span class="text-red-500">*</span></label>
                    <InputText v-model="form.nama" placeholder="Tulis nama lengkap tanpa gelar" class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 focus:border-zinc-400 dark:focus:border-zinc-700 shadow-sm transition-all" :class="{ '!border-red-400 focus:!ring-0': errors.nama }" />
                    <span v-if="errors.nama" class="text-[11px] text-red-500 font-medium tracking-tight mt-0.5 flex items-center gap-1"><i class="pi pi-info-circle text-[10px]"></i>{{ errors.nama }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Email Korespondensi <span class="text-red-500">*</span></label>
                    <InputText v-model="form.email" type="email" placeholder="alamat@instansi.go.id" class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 focus:border-zinc-400 dark:focus:border-zinc-700 shadow-sm transition-all" :class="{ '!border-red-400 focus:!ring-0': errors.email }" />
                    <span v-if="errors.email" class="text-[11px] text-red-500 font-medium tracking-tight mt-0.5 flex items-center gap-1"><i class="pi pi-info-circle text-[10px]"></i>{{ errors.email }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">No. Kontak Handphone</label>
                    <InputText v-model="form.no_hp" placeholder="+62..." class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 shadow-sm" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tempat Lahir</label>
                    <InputText v-model="form.tempat_lahir" placeholder="Kota / Kabupaten tempat lahir" class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 shadow-sm" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tanggal Lahir</label>
                    <DatePicker v-model="form.tanggal_lahir" dateFormat="yy-mm-dd" placeholder="Pilih tanggal lahir" class="w-full text-xs rounded-lg border-zinc-200 dark:border-zinc-800 shadow-sm" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Jenis Kelamin</label>
                    <Select v-model="form.jenis_kelamin" :options="genderOptions" optionLabel="label" optionValue="value" placeholder="Pilih jenis gender" class="w-full text-xs rounded-lg border-zinc-200 dark:border-zinc-800 shadow-sm" />
                </div>

                <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Alamat Tinggal Domisili</label>
                    <Textarea v-model="form.alamat" rows="2" placeholder="Tulis alamat rumah domisili lengkap saat ini..." class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 shadow-sm" />
                </div>

                <div class="col-span-1 md:col-span-2 mt-4 mb-2 pb-2 border-b border-zinc-100 dark:border-zinc-900 flex items-center gap-2 text-zinc-400">
                    <i class="pi pi-briefcase text-xs"></i>
                    <span class="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Atribut Struktural & Penugasan</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Jabatan Struktural <span class="text-red-500">*</span></label>
                    <InputText v-model="form.jabatan" placeholder="Contoh: Pranata Komputer Ahli Muda" class="w-full text-xs font-medium rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 focus:border-zinc-400 dark:focus:border-zinc-700 shadow-sm transition-all" :class="{ '!border-red-400 focus:!ring-0': errors.jabatan }" />
                    <span v-if="errors.jabatan" class="text-[11px] text-red-500 font-medium tracking-tight mt-0.5 flex items-center gap-1"><i class="pi pi-info-circle text-[10px]"></i>{{ errors.jabatan }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Golongan Ruang <span class="text-red-500">*</span></label>
                    <Select v-model="form.golongan" :options="golonganOptions" placeholder="Pilih tingkat pangkat/golongan" class="w-full text-xs rounded-lg border-zinc-200 dark:border-zinc-800 shadow-sm" :class="{ '!border-red-400': errors.golongan }" />
                    <span v-if="errors.golongan" class="text-[11px] text-red-500 font-medium tracking-tight mt-0.5 flex items-center gap-1"><i class="pi pi-info-circle text-[10px]"></i>{{ errors.golongan }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Unit Kerja / Divisi</label>
                    <Select v-model="form.unit_kerja_id" :options="unitOptions" optionLabel="label" optionValue="value" placeholder="Pilih unit kerja penugasan" class="w-full text-xs rounded-lg border-zinc-200 dark:border-zinc-800 shadow-sm" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Pendidikan Terakhir</label>
                    <Select v-model="form.pendidikan" :options="pendidikanOptions" placeholder="Pilih jenjang kelulusan terakhir" class="w-full text-xs rounded-lg border-zinc-200 dark:border-zinc-800 shadow-sm" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">TMT Mulai Pangkat</label>
                    <DatePicker v-model="form.tmt_pangkat" dateFormat="yy-mm-dd" placeholder="Pilih tanggal mulai tugas pangkat" class="w-full text-xs rounded-lg border-zinc-200 dark:border-zinc-800 shadow-sm" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Status Hubungan Kerja <span class="text-red-500">*</span></label>
                    <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" placeholder="Pilih status saat ini" class="w-full text-xs rounded-lg border-zinc-200 dark:border-zinc-800 shadow-sm" :class="{ '!border-red-400': errors.status }" />
                    <span v-if="errors.status" class="text-[11px] text-red-500 font-medium tracking-tight mt-0.5 flex items-center gap-1"><i class="pi pi-info-circle text-[10px]"></i>{{ errors.status }}</span>
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
                <Button 
                    label="Batalkan" 
                    class="font-semibold text-xs bg-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-0 p-2.5 px-4 rounded-lg transition-all" 
                    :disabled="submitting" 
                    @click="goBack" 
                />
                <Button 
                    label="Simpan Perubahan" 
                    type="submit" 
                    class="font-semibold text-xs bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 border-0 p-2.5 px-5 rounded-lg shadow-sm transition-all" 
                    :loading="submitting" 
                />
            </div>
        </form>
    </div>
</template>

<style scoped>
/* Reset global custom styling lawas untuk menjaga konsistensi Linear UI Look */
:deep(.p-select), :deep(.p-datepicker-input) {
    font-size: 0.75rem !important;
    font-weight: 500 !important;
    background-color: transparent !important;
}
:deep(.p-select-label) {
    padding: 0.5rem 0.75rem !important;
}
</style>