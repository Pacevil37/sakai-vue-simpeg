<!-- File: src/pages/dashboards/PegawaiDashboard.vue -->
<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';

// PrimeVue 4 Components
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Tag from 'primevue/tag';
import ProgressBar from 'primevue/progressbar';

const authStore = useAuthStore();
const router = useRouter();
const isLoading = ref(true);
const pegawaiData = ref(null);
const trackingCuti = ref(null);

// Smart KPI Metrics (Data Fungsional untuk Tampilan Pintar)
const sisaCutiTahunan = ref(12);
const kgbProgress = ref(65);

const userName = computed(() => authStore.user?.name || 'Aparatur Sipil Negara');
const userInitial = computed(() => userName.value.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase());

async function fetchCompletePremiumData() {
    try {
        isLoading.value = true;
        const userEmail = authStore.user?.email;
        if (!userEmail) return;

        // 1. Fetch Profil Pegawai Lengkap beserta Relasi
        const { data: profile, error: pError } = await supabase
            .from('pegawai')
            .select('*, positions(name), units(name)')
            .eq('email', userEmail)
            .maybeSingle();

        if (pError) throw pError;
        pegawaiData.value = profile;

        // 2. Fetch 1 Data Cuti Terakhir untuk Sistem Pelacak Prosedur
        if (profile) {
            const { data: cuti, error: cError } = await supabase
                .from('cuti')
                .select('*')
                .eq('pegawai_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (!cError) trackingCuti.value = cuti;
        }
    } catch (err) {
        console.error('Premium Dashboard Fetch Error:', err);
    } finally {
        isLoading.value = false;
    }
}

const getStepColor = (currentStatus, step) => {
    if (currentStatus === 'ditolak') return 'bg-rose-500 border-rose-500 text-white';
    const statusMap = { 'pending': 1, 'diverifikasi': 2, 'disetujui': 3 };
    const currentStep = statusMap[currentStatus] || 1;
    
    if (currentStep >= step) return 'bg-emerald-500 border-emerald-500 text-white';
    return 'bg-surface-100 dark:bg-surface-800 border-surface-300 dark:border-surface-700 text-surface-400';
};

onMounted(() => {
    fetchCompletePremiumData();
});

const menuItems = [
    { label: 'PROFIL', icon: 'pi pi-user', to: '/pegawai/profil', color: 'bg-blue-500/10 text-blue-600' },
    { label: 'PENDIDIKAN', icon: 'pi pi-book', to: '/pegawai/riwayat-pendidikan', color: 'bg-purple-500/10 text-purple-600' },
    { label: 'DIKLAT', icon: 'pi pi-graduation-cap', to: '/pegawai/riwayat-diklat', color: 'bg-orange-500/10 text-orange-600' },
    { label: 'MUTASI', icon: 'pi pi-refresh', to: '/pegawai/mutasi', color: 'bg-emerald-500/10 text-emerald-600' },
    { label: 'KINERJA', icon: 'pi pi-star', to: '/pegawai/kinerja', color: 'bg-amber-500/10 text-amber-600' },
    { label: 'KGB', icon: 'pi pi-money-bill', to: '/pegawai/kgb', color: 'bg-rose-500/10 text-rose-600' },
    { label: 'PENSIUN', icon: 'pi pi-calendar', to: '/pegawai/pensiun', color: 'bg-slate-500/10 text-slate-600' },
];
</script>

<template>
    <div class="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8 transition-all duration-300">
        
        <!-- ==================== PREMIUM ADAPTIVE HERO BANNER ==================== -->
        <header class="relative overflow-hidden rounded-2xl border transition-all duration-300
            bg-surface-0 border-surface-200 shadow-sm text-surface-900 
            dark:bg-gradient-to-br dark:from-emerald-950 dark:to-surface-950 dark:border-emerald-900/30 dark:shadow-emerald-950/20 dark:text-white
            p-6 md:p-8 lg:p-10">
            
            <div class="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div class="flex items-center gap-6">
                    <div class="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-surface-200 dark:border-emerald-500/30 shadow-md bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                        <img v-if="pegawaiData?.foto_url" :src="pegawaiData.foto_url" class="w-full h-full object-cover" />
                        <span v-else class="text-2xl font-black text-surface-400 dark:text-surface-500">{{ userInitial }}</span>
                    </div>

                    <div>
                        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 border
                            bg-emerald-50 border-emerald-200 text-emerald-700
                            dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            STATUS: ASN AKTIF
                        </div>
                        <h1 class="text-2xl md:text-3xl font-black tracking-tight leading-tight m-0 text-surface-900 dark:text-white">
                            Selamat Datang, <span class="text-emerald-600 dark:text-emerald-400">{{ userName }}</span>
                        </h1>
                        <p class="text-sm md:text-base font-medium text-surface-500 dark:text-white/70 m-0 mt-1" v-if="pegawaiData">
                            {{ pegawaiData.jabatan || 'Fungsional Umum' }} &bull; {{ pegawaiData.golongan || 'III/a' }}
                        </p>
                        <Skeleton v-else width="180px" height="18px" class="mt-2"></Skeleton>
                    </div>
                </div>

                <div class="flex flex-wrap gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-surface-100 dark:border-surface-800">
                    <Button label="Edit Profil" icon="pi pi-user-edit" severity="secondary" outlined class="!rounded-xl flex-1 md:flex-none" @click="router.push('/pegawai/profil')" />
                    <Button label="Ajukan Cuti" icon="pi pi-calendar-plus" class="!bg-emerald-600 hover:!bg-emerald-700 !border-none !rounded-xl flex-1 md:flex-none shadow-md text-white font-bold" @click="router.push('/pegawai/cuti')" />
                </div>
            </div>
        </header>

        <!-- ==================== PREMIUM MINIMALIST METRICS HUB (SISA CUTI & KGB) ==================== -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Sisa Cuti -->
            <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div class="space-y-1">
                    <span class="text-xs font-bold text-surface-400 uppercase tracking-wider block">Sisa Kuota Cuti Tahunan</span>
                    <h3 class="text-2xl md:text-3xl font-black text-surface-900 dark:text-white m-0">{{ sisaCutiTahunan }} <span class="text-xs font-medium text-surface-400">Hari Kerja</span></h3>
                </div>
                <div class="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shadow-sm"><i class="pi pi-calendar"></i></div>
            </div>
            
            <!-- Predikat SKP Kinerja -->
            <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div class="space-y-1">
                    <span class="text-xs font-bold text-surface-400 uppercase tracking-wider block">Evaluasi Kinerja (SKP)</span>
                    <h3 class="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 m-0">SANGAT BAIK</h3>
                </div>
                <div class="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-sm"><i class="pi pi-star-fill"></i></div>
            </div>

            <!-- KGB Progress Linear Tracker -->
            <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 flex flex-col justify-center gap-3 shadow-sm">
                <div class="flex justify-between items-center w-full">
                    <span class="text-xs font-bold text-surface-400 uppercase tracking-wider">Berkala Gaji (KGB) Berikutnya</span>
                    <span class="text-xs font-black text-rose-500 dark:text-rose-400">{{ kgbProgress }}%</span>
                </div>
                <ProgressBar :value="kgbProgress" :showValue="false" class="!h-2 !bg-surface-100 dark:bg-surface-800 [&>div]:!bg-rose-500 dark:[&>div]:!bg-rose-400" />
            </div>
        </section>

        <!-- ==================== BENTO MENU NAVIGATOR ==================== -->
        <section class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
                <div class="w-1.5 h-5 bg-emerald-600 dark:bg-emerald-400 rounded-full"></div>
                <h2 class="text-base font-bold tracking-tight text-surface-900 dark:text-surface-0">Riwayat & Administrasi Mandiri</h2>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                <router-link v-for="item in menuItems" :key="item.label" :to="item.to" 
                    class="group flex flex-col items-center justify-center p-5 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-md">
                    <div :class="['w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-3 transition-all group-hover:scale-110 shadow-sm', item.color]">
                        <i :class="item.icon"></i>
                    </div>
                    <span class="text-xs font-extrabold text-center tracking-wider text-surface-700 dark:text-surface-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{{ item.label }}</span>
                </router-link>
            </div>
        </section>

        <!-- ==================== TWO-COLUMN CONTEXT WORKSPACE ==================== -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            <!-- LEFT: CORE PROFILE INFO (2 COLUMNS WIDE) -->
            <div class="lg:col-span-2 bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-4 mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><i class="pi pi-id-card"></i></div>
                        <h3 class="text-base font-bold text-surface-900 dark:text-surface-0 m-0">Informasi Pokok Kepegawaian</h3>
                    </div>
                    <Tag v-if="pegawaiData" :value="'NIP. ' + pegawaiData.nip" severity="secondary" class="!px-3 !py-1 !text-xs !font-mono tracking-wide"></Tag>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8" v-if="pegawaiData">
                    <div v-for="(val, lbl) in filteredProfileInfo" :key="lbl" class="flex flex-col gap-1 border-l-2 border-surface-200 dark:border-surface-700 pl-4 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-surface-400">{{ lbl }}</span>
                        <span class="text-sm font-semibold text-surface-700 dark:text-surface-200">{{ val || '-' }}</span>
                    </div>
                </div>
                <div v-else class="grid grid-cols-2 gap-4">
                    <Skeleton v-for="i in 6" :key="i" height="45px" borderRadius="12px"></Skeleton>
                </div>
            </div>

            <!-- RIGHT: CLEAN LEAVE PROGRESS TRACKER & PENEMPATAN (1 COLUMN) -->
            <div class="flex flex-col gap-6 w-full">
                <!-- Advanced Clean Leave Progress Tracker -->
                <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    <div class="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center"><i class="pi pi-map-marker"></i></div>
                            <h3 class="text-sm font-bold text-surface-900 dark:text-surface-0 m-0">Pelacak Berkas Cuti</h3>
                        </div>
                        <Tag v-if="trackingCuti" :value="trackingCuti.jenis_cuti" severity="secondary" class="!text-[9px] !px-2"></Tag>
                    </div>

                    <!-- Clean Horizontal Workflow Timeline (Sleek Styling) -->
                    <div v-if="trackingCuti" class="py-2 px-1">
                        <div class="relative flex justify-between items-center w-full">
                            <!-- Background Connective Rail -->
                            <div class="absolute left-0 right-0 h-0.5 bg-surface-200 dark:bg-surface-800 z-0 pointer-events-none"></div>
                            
                            <!-- Node 1: Submit -->
                            <div class="relative z-10 flex flex-col items-center gap-1.5">
                                <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-colors shadow-sm" :class="getStepColor(trackingCuti.status, 1)">1</div>
                                <span class="text-[10px] font-bold text-surface-500 dark:text-surface-400">Diajukan</span>
                            </div>

                            <!-- Node 2: Verification -->
                            <div class="relative z-10 flex flex-col items-center gap-1.5">
                                <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-colors shadow-sm" :class="getStepColor(trackingCuti.status, 2)">2</div>
                                <span class="text-[10px] font-bold text-surface-500 dark:text-surface-400">Verifikasi</span>
                            </div>

                            <!-- Node 3: Approved / Rejected Decision -->
                            <div class="relative z-10 flex flex-col items-center gap-1.5">
                                <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-bold transition-colors shadow-sm" :class="getStepColor(trackingCuti.status, 3)">3</div>
                                <span class="text-[10px] font-bold uppercase tracking-wider" :class="trackingCuti.status === 'disetujui' ? 'text-emerald-500' : trackingCuti.status === 'ditolak' ? 'text-rose-500' : 'text-surface-400'">{{ trackingCuti.status }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-else class="text-center py-6 border border-dashed border-surface-200 dark:border-surface-800 rounded-xl opacity-50">
                        <i class="pi pi-folder-open text-2xl mb-1 block"></i>
                        <p class="text-xs m-0">Tidak ada pengajuan berkas aktif</p>
                    </div>
                </div>

                <!-- Unit Kerja Highlight -->
                <div class="bg-gradient-to-br from-surface-800 to-surface-950 rounded-2xl p-5 shadow-sm text-white">
                    <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 block">Unit Penempatan</span>
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><i class="pi pi-building text-base"></i></div>
                        <div>
                            <h4 class="text-xs font-bold m-0 leading-snug">{{ pegawaiData?.units?.name || 'Kantor Kemenag Kabupaten Biak Numfor' }}</h4>
                            <p class="text-[11px] text-white/50 m-0 mt-1">Pastikan akurasi data penempatan instansi Anda.</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
export default {
    computed: {
        filteredProfileInfo() {
            if (!this.pegawaiData) return {};
            return {
                'Tempat Lahir': this.pegawaiData.tempat_lahir,
                'Tanggal Lahir': this.pegawaiData.tanggal_lahir,
                'Jenis Kelamin': this.pegawaiData.jenis_kelamin,
                'Pendidikan Terakhir': this.pegawaiData.pendidikan,
                'Email Kerja': this.pegawaiData.email,
                'No. WhatsApp': this.pegawaiData.no_hp,
                'Unit Kerja': this.pegawaiData.units?.name,
                'Jabatan': this.pegawaiData.jabatan
            }
        }
    }
}
</script>

<style scoped>
.router-link-active {
    pointer-events: none;
}
</style>