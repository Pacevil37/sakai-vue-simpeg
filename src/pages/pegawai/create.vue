<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';

// PrimeVue 4 Core Components
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

const router = useRouter();
const toast = useToast();

// ==================== CORE STATE (FULL LOGIC RETAINED) ====================
const loading = ref(false);
const submitting = ref(false);
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

// Master Data
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
    { label: 'Aktif Kerja', value: 'aktif' },
    { label: 'Non-Aktif', value: 'pensiun' },
    { label: 'Mutasi Tugas', value: 'mutasi' }
]);

// ==================== PASSTHROUGH (DESIGN CONSISTENCY) ====================
const inputPT = {
    root: ({ props, context }) => ({
        class: [
            'w-full text-xs font-medium rounded-lg border shadow-sm transition-all duration-200',
            'bg-white dark:bg-zinc-950 px-3 py-2',
            context.filled ? 'border-zinc-300 dark:border-zinc-700' : 'border-zinc-200 dark:border-zinc-800',
            'focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-0 text-zinc-800 dark:text-zinc-200'
        ]
    })
};

const selectPT = {
    root: { class: 'w-full text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm' },
    label: { class: 'p-2 px-3 text-zinc-700 dark:text-zinc-300' },
    item: { class: 'text-xs p-2 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors' }
};

// ==================== DATABASE & LOGIC HANDLERS ====================
const fetchUnits = async () => {
    try {
        const { data, error } = await supabase.from('units').select('id, name').order('name');
        if (error) throw error;
        unitOptions.value = data.map(u => ({ label: u.name, value: u.id }));
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Sinkronisasi Gagal', detail: 'Gagal memuat master data unit kerja.', life: 4000 });
    }
};

const formatLocalDate = (dateObj) => {
    if (!dateObj) return null;
    const offset = dateObj.getTimezoneOffset();
    const correctedDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
    return correctedDate.toISOString().split('T')[0];
};

const validateForm = () => {
    errors.value = {};
    
    if (!form.value.nip) {
        errors.value.nip = 'Nomor Induk Pegawai (NIP) wajib diisi.';
    } else if (!/^\d+$/.test(form.value.nip)) {
        errors.value.nip = 'NIP hanya boleh menggunakan karakter angka numerik.';
    } else if (form.value.nip.length < 9 || form.value.nip.length > 20) {
        errors.value.nip = 'Panjang identitas harus berukuran antara 9 hingga 20 digit.';
    }

    if (!form.value.nama) {
        errors.value.nama = 'Nama lengkap aparatur sipil negara wajib diisi.';
    } else if (form.value.nama.trim().length < 2) {
        errors.value.nama = 'Nama aparatur tidak valid (minimal 2 karakter).';
    }
    
    if (!form.value.email) {
        errors.value.email = 'Alamat email korespondensi dinas wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
        errors.value.email = 'Format penulisan alamat email tidak valid.';
    }

    if (!form.value.jabatan) errors.value.jabatan = 'Klasifikasi jabatan struktural wajib ditentukan.';
    if (!form.value.golongan) errors.value.golongan = 'Golongan ruang pangkat aktif wajib dipilih.';
    if (!form.value.status) errors.value.status = 'Status hubungan kerja wajib ditentukan.';

    return Object.keys(errors.value).length === 0;
};

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

        const { error } = await supabase.from('pegawai').insert([payload]);
        
        if (error) {
            if (error.code === '23505') {
                if (error.message.includes('nip')) errors.value.nip = 'NIP sudah terdaftar di sistem.';
                if (error.message.includes('email')) errors.value.email = 'Email sudah digunakan.';
                throw new Error('Validasi database menolak pengiriman karena data duplikat.');
            }
            throw error;
        }

        toast.add({ severity: 'success', summary: 'Transaksi Berhasil', detail: 'Profil data aparatur baru berhasil diarsipkan.', life: 3000 });
        router.push('/pegawai');
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal Menyimpan', detail: err.message || 'Sistem menolak modifikasi pangkalan data root.', life: 4000 });
    } finally {
        submitting.value = false;
    }
};

const goBack = () => router.push('/pegawai');

onMounted(async () => {
    loading.value = true;
    await fetchUnits();
    loading.value = false;
});
</script>

<template>
    <div class="p-6 md:p-10 max-w-[1700px] mx-auto w-full flex flex-col gap-6 dark:bg-zinc-950 min-h-screen antialiased text-zinc-900 dark:text-zinc-50">
        
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-4 rounded-xl shadow-sm dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-900">
            <div>
                <div class="flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mb-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Identity Ledger Entry
                </div>
                <h1 class="text-xl font-semibold tracking-tight m-0 text-zinc-900 dark:text-zinc-100">Registrasi Personel Baru</h1>
                <p class="text-xs text-zinc-400 dark:text-zinc-500 m-0 mt-1 max-w-2xl leading-relaxed">
                    Sistem input data terpusat untuk pendaftaran aparatur sipil ke dalam database repositori nasional.
                </p>
            </div>
            
            <Button 
                label="Kembali" 
                icon="pi pi-arrow-left" 
                class="font-semibold text-xs rounded-lg bg-transparent hover:bg-zinc-50 text-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800 p-2 border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm"
                @click="goBack" 
            />
        </div>

        <div v-if="loading" class="flex justify-center py-20">
            <ProgressSpinner strokeWidth="3" class="w-8 h-8" />
        </div>

        <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-8">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white dark:bg-zinc-900 p-6 md:p-10 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
                
                <div class="col-span-full pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                    <i class="pi pi-id-card text-xs text-zinc-400"></i>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Berkas Identitas Otentik</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">NIP <span class="text-red-500">*</span></label>
                    <InputText v-model="form.nip" :pt="inputPT" :class="{'!border-red-500/50': errors.nip}" placeholder="Contoh: 19940212..." />
                    <span v-if="errors.nip" class="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1"><i class="pi pi-info-circle text-[9px]"></i>{{ errors.nip }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Nama Lengkap <span class="text-red-500">*</span></label>
                    <InputText v-model="form.nama" :pt="inputPT" :class="{'!border-red-500/50': errors.nama}" placeholder="Tulis nama lengkap tanpa gelar" />
                    <span v-if="errors.nama" class="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1"><i class="pi pi-info-circle text-[9px]"></i>{{ errors.nama }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Email Korespondensi <span class="text-red-500">*</span></label>
                    <InputText v-model="form.email" type="email" :pt="inputPT" :class="{'!border-red-500/50': errors.email}" placeholder="alamat@instansi.go.id" />
                    <span v-if="errors.email" class="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1"><i class="pi pi-info-circle text-[9px]"></i>{{ errors.email }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">No. Kontak Handphone</label>
                    <InputText v-model="form.no_hp" :pt="inputPT" placeholder="+62..." />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Tempat Lahir</label>
                    <InputText v-model="form.tempat_lahir" :pt="inputPT" placeholder="Kota / Kabupaten" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Tanggal Lahir</label>
                    <DatePicker v-model="form.tanggal_lahir" dateFormat="yy-mm-dd" placeholder="Pilih tanggal" class="w-full" :pt="{ input: inputPT.root }" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Jenis Kelamin</label>
                    <Select v-model="form.jenis_kelamin" :options="genderOptions" optionLabel="label" optionValue="value" :pt="selectPT" placeholder="Pilih Gender" />
                </div>

                <div class="flex flex-col gap-1.5 md:col-span-2">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Alamat Tinggal Domisili</label>
                    <Textarea v-model="form.alamat" rows="2" class="w-full text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-0 shadow-sm" placeholder="Alamat lengkap sesuai domisili..." />
                </div>

                <div class="col-span-full mt-4 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                    <i class="pi pi-briefcase text-xs text-zinc-400"></i>
                    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Atribut Struktural & Penugasan</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Jabatan Struktural <span class="text-red-500">*</span></label>
                    <InputText v-model="form.jabatan" :pt="inputPT" :class="{'!border-red-500/50': errors.jabatan}" placeholder="E.g. Pranata Komputer" />
                    <span v-if="errors.jabatan" class="text-[10px] text-red-500 font-medium mt-1">{{ errors.jabatan }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Golongan Ruang <span class="text-red-500">*</span></label>
                    <Select v-model="form.golongan" :options="golonganOptions" :pt="selectPT" placeholder="Pilih Golongan" :class="{'!border-red-500/50': errors.golongan}" />
                    <span v-if="errors.golongan" class="text-[10px] text-red-500 font-medium mt-1">{{ errors.golongan }}</span>
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Unit Kerja / Divisi</label>
                    <Select v-model="form.unit_kerja_id" :options="unitOptions" optionLabel="label" optionValue="value" :pt="selectPT" placeholder="Pilih Unit Penugasan" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Pendidikan Terakhir</label>
                    <Select v-model="form.pendidikan" :options="pendidikanOptions" :pt="selectPT" placeholder="Pilih Jenjang" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">TMT Mulai Pangkat</label>
                    <DatePicker v-model="form.tmt_pangkat" dateFormat="yy-mm-dd" placeholder="Pilih TMT" class="w-full" :pt="{ input: inputPT.root }" />
                </div>

                <div class="flex flex-col gap-1.5">
                    <label class="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Status Hubungan Kerja <span class="text-red-500">*</span></label>
                    <Select v-model="form.status" :options="statusOptions" optionLabel="label" optionValue="value" :pt="selectPT" :class="{'!border-red-500/50': errors.status}" />
                    <span v-if="errors.status" class="text-[10px] text-red-500 font-medium mt-1">{{ errors.status }}</span>
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 pb-12">
                <Button 
                    label="Batalkan" 
                    class="text-xs font-semibold text-zinc-500 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 p-2.5 px-6 rounded-lg border-0 transition-all"
                    :disabled="submitting"
                    @click="goBack"
                />
                <Button 
                    label="Simpan Record Data" 
                    type="submit" 
                    class="text-xs font-bold tracking-tight bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 hover:opacity-90 p-2.5 px-8 rounded-lg shadow-lg shadow-zinc-500/10 border-0 transition-all"
                    :loading="submitting"
                />
            </div>
        </form>
    </div>
</template>