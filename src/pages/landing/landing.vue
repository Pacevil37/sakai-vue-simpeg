<template>
  <div class="min-h-screen bg-[#fafafa] text-slate-800 font-sans selection:bg-emerald-500 selection:text-white antialiased">
    
    <!-- Navbar Modern & Glassmorphism -->
    <header 
      :class="[
        'fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b',
        isScrolled 
          ? 'bg-white/70 backdrop-blur-xl shadow-sm border-slate-200/40 py-3' 
          : 'bg-transparent border-transparent py-5'
      ]"
    >
      <div class="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">
        <!-- Logo Kementerian Agama -->
        <div class="flex items-center gap-3 group cursor-pointer" @click="$router.push('/landing')">
          <div class="w-11 h-11 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200/60 p-1.5 flex items-center justify-center shadow-md shadow-slate-100 group-hover:scale-105 transition-transform duration-300">
            <img src="/kemenag-logo-freelogovectors.net_.png" alt="Logo Kemenag" class="w-full h-full object-contain filter drop-shadow-xs" />
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-lg tracking-tight text-slate-900 leading-none">SIMPEG</span>
            <span class="text-[10px] text-emerald-600 font-bold tracking-widest uppercase mt-1">Biak Numfor</span>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1 bg-slate-900/[0.04] p-1 rounded-full border border-slate-900/[0.02] backdrop-blur-sm">
          <a href="#hero" class="px-5 py-2 text-xs font-semibold rounded-full text-slate-600 hover:text-slate-900 transition-colors">Beranda</a>
          <a href="#features" class="px-5 py-2 text-xs font-semibold rounded-full text-slate-600 hover:text-slate-900 transition-colors">Fitur</a>
          <a href="#stats" class="px-5 py-2 text-xs font-semibold rounded-full text-slate-600 hover:text-slate-900 transition-colors">Statistik</a>
          <a href="#modules" class="px-5 py-2 text-xs font-semibold rounded-full text-slate-600 hover:text-slate-900 transition-colors">Modul</a>
          <a href="#contact" class="px-5 py-2 text-xs font-semibold rounded-full text-slate-600 hover:text-slate-900 transition-colors">Kontak</a>
        </nav>

        <!-- Actions Desktop -->
        <div class="hidden md:flex items-center gap-3">
          <Button label="Masuk" class="!bg-slate-950 hover:!bg-emerald-600 !border-none !rounded-xl !px-5 !py-2.5 !text-xs !font-semibold !transition-all !duration-300 !shadow-sm" @click="$router.push('/auth/login')" />
        </div>

        <!-- Mobile Hamburger Menu Button -->
        <div class="flex md:hidden items-center">
          <button 
            @click="toggleMobileMenu" 
            type="button"
            class="text-slate-700 hover:text-emerald-600 p-2 rounded-xl bg-slate-900/[0.04] border border-slate-900/[0.02] transition-all focus:outline-hidden"
            aria-label="Toggle Menu"
          >
            <i :class="['pi', mobileMenuOpen ? 'pi-times' : 'pi-bars', 'text-lg transition-transform duration-300']"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <transition name="slide-fade">
        <div v-if="mobileMenuOpen" class="absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-slate-200 p-6 flex flex-col gap-4 shadow-xl md:hidden z-50">
          <a href="#hero" @click="closeMobileMenu" class="font-semibold text-sm text-slate-600 hover:text-emerald-600 py-2 border-b border-slate-100/60 transition-colors">Beranda</a>
          <a href="#features" @click="closeMobileMenu" class="font-semibold text-sm text-slate-600 hover:text-emerald-600 py-2 border-b border-slate-100/60 transition-colors">Fitur</a>
          <a href="#stats" @click="closeMobileMenu" class="font-semibold text-sm text-slate-600 hover:text-emerald-600 py-2 border-b border-slate-100/60 transition-colors">Statistik</a>
          <a href="#modules" @click="closeMobileMenu" class="font-semibold text-sm text-slate-600 hover:text-emerald-600 py-2 border-b border-slate-100/60 transition-colors">Modul</a>
          <a href="#contact" @click="closeMobileMenu" class="font-semibold text-sm text-slate-600 hover:text-emerald-600 py-2 border-b border-slate-100/60 transition-colors">Kontak</a>
          <div class="flex flex-col gap-2.5 mt-2">
            <Button label="Akses Login Aplikasi" class="w-full !bg-slate-950 hover:!bg-emerald-600 !border-none !py-3 !rounded-xl !text-xs !font-bold !transition-colors" @click="() => { closeMobileMenu(); $router.push('/auth/login'); }" />
          </div>
        </div>
      </transition>
    </header>

    <!-- Hero Section – Advance SaaS Dashboard Preview Layout -->
    <section id="hero" class="pt-32 pb-24 lg:pt-48 lg:pb-36 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.50),white)] relative overflow-hidden">
      <!-- Grid Background Overlay -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-16 items-center relative z-10">
        <!-- Hero Left Side -->
        <div class="lg:col-span-6 space-y-8 text-center lg:text-left">
          <div class="inline-flex items-center gap-2 bg-white border border-slate-200/80 shadow-sm text-slate-800 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mx-auto lg:mx-0">
            <span class="flex h-2 w-2 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Kementerian Agama Kabupaten Biak Numfor
          </div>
          
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.1]">
            Evolusi Digital <br class="hidden sm:inline" />
            <span class="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">Tata Kelola ASN</span>
          </h1>
          
          <p class="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Satu ekosistem pintar terintegrasi untuk memanajemen data profil, pelaporan kinerja, akselerasi cuti, hingga pelacakan pensiun secara presisi dan transparan.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
            <Button label="Akses Sistem" icon="pi pi-shield" class="!bg-emerald-600 hover:!bg-emerald-700 !border-none !rounded-2xl !px-7 !py-4 !text-xs !font-bold !shadow-xl !shadow-emerald-600/20 !transition-all" @click="$router.push('/auth/login')" />
            <Button label="Eksplorasi Fitur" icon="pi pi-compass" iconPos="right" class="p-button-outlined !border-slate-200 !text-slate-700 hover:!bg-slate-50 hover:!border-slate-300 !rounded-2xl !px-7 !py-4 !text-xs !font-bold !bg-white" @click="scrollToFeatures" />
          </div>

          <!-- Mini Badges Informasi Kompatibilitas -->
          <div class="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium border-t border-slate-200/60 max-w-md mx-auto lg:mx-0">
            <span class="flex items-center gap-1.5"><i class="pi pi-desktop text-emerald-500"></i> Desktop Responsive</span>
            <span class="flex items-center gap-1.5"><i class="pi pi-mobile text-emerald-500"></i> Mobile Optimized</span>
            <span class="flex items-center gap-1.5"><i class="pi pi-verified text-emerald-500"></i> Satu Data ASN</span>
          </div>
        </div>

        <!-- Hero Right Side: Advance Dashboard UI Preview Components -->
        <div class="lg:col-span-6 relative">
          <!-- Main Frame Mockup -->
          <div class="bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 relative z-10 space-y-6 max-w-lg mx-auto transform hover:scale-[1.01] transition-transform duration-500">
            <!-- Window Top Controls Mockup -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div class="flex gap-1.5">
                <span class="w-3 h-3 rounded-full bg-slate-200"></span>
                <span class="w-3 h-3 rounded-full bg-slate-200"></span>
                <span class="w-3 h-3 rounded-full bg-slate-200"></span>
              </div>
              <span class="text-[11px] font-mono text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-md">simpeg.biak.go.id/live</span>
            </div>

            <!-- Inside Mockup: Real-time Stats Grid Mockup -->
            <div class="grid grid-cols-2 gap-4">
              <div v-for="(stat, idx) in heroStats" :key="idx" class="p-4 rounded-2xl bg-slate-50 border border-slate-100/70 flex flex-col justify-between">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ stat.label }}</span>
                <div class="flex items-baseline gap-1 mt-2">
                  <span class="text-2xl font-extrabold text-slate-900 tracking-tight">{{ animatedStats[stat.key] || 0 }}</span>
                  <span class="text-[10px] font-bold text-emerald-600">+Ready</span>
                </div>
              </div>
            </div>

            <!-- Inside Mockup: Simulation Activity Feed -->
            <div class="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                <span>Aktivitas Sistem Terakhir</span>
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <div class="space-y-2.5">
                <div class="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl shadow-xs border border-slate-100">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px]"><i class="pi pi-file"></i></div>
                    <span class="font-semibold text-slate-700 text-[11px]">Pengajuan Cuti Tahunan</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-medium">Baru Saja</span>
                </div>
                <div class="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl shadow-xs border border-slate-100">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]"><i class="pi pi-sync"></i></div>
                    <span class="font-semibold text-slate-700 text-[11px]">Sinkronisasi Data BKN</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-medium">2 Menit Lalu</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Decorative Blur Behind Mockup -->
          <div class="absolute top-12 left-12 right-0 bottom-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl opacity-10 blur-2xl -z-10 transform translate-x-4 translate-y-4"></div>
        </div>
      </div>
    </section>

    <!-- Fitur Unggulan – Premium Card Grid -->
    <section id="features" class="py-24 bg-white relative">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Fitur Unggulan</span>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Solusi Modern Manajemen ASN</h2>
          <p class="text-slate-500 text-sm sm:text-base">Ekosistem digital komprehensif guna menyederhanakan birokrasi dan meningkatkan akurasi data.</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="(feature, i) in features" 
            :key="i" 
            class="group bg-slate-50 hover:bg-white border border-slate-200/60 p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-slate-100 hover:-translate-y-1"
          >
            <div class="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
              <i :class="[feature.icon, 'text-xl']"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900 mt-6 mb-2 tracking-tight group-hover:text-emerald-700 transition-colors">{{ feature.title }}</h3>
            <p class="text-slate-500 text-sm leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistik & Grafik Dashboard -->
    <section id="stats" class="py-24 bg-slate-50 border-y border-slate-200/50">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Metrik & Data</span>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Transparansi Data Kepegawaian</h2>
          <p class="text-slate-500 text-sm">Informasi konsolidasi aktual skala makro institusi pada platform SIMPEG.</p>
        </div>

        <!-- Quick Counters Row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div v-for="(s, idx) in quickStats" :key="idx" class="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs flex items-center justify-between group hover:border-emerald-300 transition-colors">
            <div>
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ s.label }}</p>
              <h4 class="text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight group-hover:text-emerald-600 transition-colors">{{ s.value }}</h4>
            </div>
            <div class="w-11 h-11 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
              <i :class="s.icon"></i>
            </div>
          </div>
        </div>

        <!-- Chart Container -->
        <div class="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <h3 class="text-lg font-bold text-slate-900 tracking-tight">Distribusi Golongan Pegawai</h3>
              <p class="text-xs text-slate-400 mt-0.5">Visualisasi komposisi tingkat kepangkatan ASN aktif</p>
            </div>
            <div class="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/40">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Simulated Dashboard Data
            </div>
          </div>
          <div class="h-[350px] relative">
            <Chart type="bar" :data="golonganChart" :options="chartOptions" />
          </div>
        </div>
      </div>
    </section>

    <!-- Modul Sistem – Clean List / Grid Layout -->
    <section id="modules" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Arsitektur Modul</span>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Modul Ekosistem Terintegrasi</h2>
          <p class="text-slate-500 text-sm">Every administrative requirement is handled by robust micro-modules.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="(mod, idx) in modules" 
            :key="idx" 
            class="flex items-start gap-4 bg-slate-50/60 border border-slate-100 p-5 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <i :class="[mod.icon, 'text-sm']"></i>
            </div>
            <div class="space-y-1">
              <h4 class="font-bold text-sm text-slate-900 tracking-tight">{{ mod.title }}</h4>
              <p class="text-xs text-slate-500 leading-relaxed">{{ mod.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Teknologi yang Digunakan -->
    <section class="py-16 bg-slate-950 text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 opacity-50"></div>
      <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
        <p class="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Tech Stack Kinerja Tinggi</p>
        <h2 class="text-2xl font-bold tracking-tight text-white mb-10">Didukung oleh Teknologi Modern</h2>
        
        <div class="flex flex-wrap justify-center items-center gap-3 max-w-4xl mx-auto">
          <div v-for="tech in ['Vue 3', 'PrimeVue', 'Tailwind CSS', 'Supabase', 'Pinia', 'Vite']" :key="tech" class="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> {{ tech }}
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Modern & Elegan -->
    <footer id="contact" class="bg-slate-950 text-slate-400 pt-20 pb-8 border-t border-slate-900">
      <div class="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-900">
        <!-- Brand Info -->
        <div class="lg:col-span-5 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-600/10">
              <i class="pi pi-id-card"></i>
            </div>
            <span class="font-bold text-lg tracking-tight text-white">SIMPEG Biak Numfor</span>
          </div>
          <p class="text-sm leading-relaxed text-slate-400 max-w-sm">
            Sistem Informasi Manajemen Kepegawaian Kantor Kementerian Agama Kabupaten Biak Numfor.
          </p>
          <div class="space-y-2 pt-2 text-xs">
            <p class="flex items-center gap-3"><i class="pi pi-map-marker text-emerald-500"></i> Jl. Cendrawasih No. 10, Biak</p>
            <p class="flex items-center gap-3"><i class="pi pi-phone text-emerald-500"></i> (0981) 12345</p>
            <p class="flex items-center gap-3"><i class="pi pi-envelope text-emerald-500"></i> info@kemenagbiak.go.id</p>
          </div>
        </div>

        <!-- Links Grid -->
        <div class="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-white uppercase tracking-widest">Aplikasi</h4>
            <ul class="space-y-2.5 text-sm">
              <li><a href="#features" class="hover:text-white transition-colors">Fitur Unggulan</a></li>
              <li><a href="#modules" class="hover:text-white transition-colors">Modul Sistem</a></li>
              <li><a href="#stats" class="hover:text-white transition-colors">Statistik Real-time</a></li>
            </ul>
          </div>
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-white uppercase tracking-widest">Bantuan</h4>
            <ul class="space-y-2.5 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Dokumentasi</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Panduan Sistem</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Hubungi Admin</a></li>
            </ul>
          </div>
          <div class="space-y-4 col-span-2 sm:col-span-1">
            <h4 class="text-xs font-bold text-white uppercase tracking-widest">Legalitas</h4>
            <ul class="space-y-2.5 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Footer Bottom -->
      <div class="max-w-7xl mx-auto px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <p>&copy; 2026 SIMPEG Kemenag Biak Numfor. All rights reserved.</p>
        <p class="text-slate-600">Precision design for digital governance.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';
import Chart from 'primevue/chart';

// State untuk navbar
const isScrolled = ref(false);
const mobileMenuOpen = ref(false);

// Hero stats targets
const heroStats = ref([
  { key: 'totalPegawai', label: 'Total Pegawai ASN' },
  { key: 'cutiPending', label: 'Cuti Diproses' },
  { key: 'unitKerja', label: 'Unit Kerja/Satker' },
  { key: 'jabatan', label: 'Ragam Jabatan' }
]);

const animatedStats = ref({
  totalPegawai: 0,
  cutiPending: 0,
  unitKerja: 0,
  jabatan: 0
});

// Quick stats
const quickStats = ref([
  { label: 'Total Pegawai', value: '346 Orang', icon: 'pi pi-users' },
  { label: 'Cuti Disetujui', value: '42 Berkas', icon: 'pi pi-check-circle' },
  { label: 'Golongan IV', value: '89 ASN', icon: 'pi pi-star' },
  { label: 'Unit Kerja', value: '14 Satker', icon: 'pi pi-building' }
]);

// Data chart golongan
const golonganChart = ref({
  labels: ['Golongan I', 'Golongan II', 'Golongan III', 'Golongan IV'],
  datasets: [{
    label: 'Jumlah Pegawai',
    data: [24, 78, 155, 89],
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    hoverBackgroundColor: 'rgba(5, 150, 105, 1)',
    borderRadius: 8,
    borderSkipped: false,
    barThickness: 40
  }]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { display: false },
    tooltip: {
      padding: 12,
      backgroundColor: '#0f172a',
      titleFont: { size: 12, weight: 'bold' },
      bodyFont: { size: 12 },
      cornerRadius: 8
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11, weight: '600' } } },
    y: { border: { dash: [4, 4] }, grid: { color: '#f1f5f9' }, ticks: { color: '#64748b', font: { size: 11 } } }
  }
});

// Data statis fitur & modul
const features = [
  { icon: 'pi pi-users', title: 'Data Pegawai', desc: 'Manajemen lengkap profil personal, NIP, kepangkatan jabatan, golongan, serta instansi unit kerja.' },
  { icon: 'pi pi-calendar', title: 'Manajemen Cuti', desc: 'Pengajuan cuti online terintegrasi, workflow approval berjenjang, riwayat & notifikasi instan.' },
  { icon: 'pi pi-chart-line', title: 'Penilaian Kinerja', desc: 'Evaluasi periodik pencapaian kinerja, unggah berkas portofolio, dan rekapitulasi riwayat nilai.' },
  { icon: 'pi pi-graduation-cap', title: 'Pendidikan & Diklat', desc: 'Pencatatan riwayat jenjang pendidikan formal serta kepesertaan pelatihan kedinasan (diklat).' },
  { icon: 'pi pi-money-bill', title: 'KGB & Pensiun', desc: 'Monitoring otomatis Kenaikan Gaji Berkala (KGB), tracking masa pensiun, dan arsip digital berkas SK.' },
  { icon: 'pi pi-chart-bar', title: 'Laporan & Statistik', desc: 'Generate dokumen laporan secara instan ke format Excel/PDF dilengkapi preview data yang informatif.' }
];

const modules = [
  { icon: 'pi pi-id-card', title: 'Data Pegawai', desc: 'CRUD terstruktur, upload foto profil, fitur pencarian & penyaringan mutakhir.' },
  { icon: 'pi pi-calendar', title: 'Cuti Mandiri', desc: 'Pengajuan, lembar persetujuan atasan, riwayat log, serta notifikasi push.' },
  { icon: 'pi pi-chart-line', title: 'Penilaian Kinerja', desc: 'Input nilai berkala, manajemen dokumen pendukung, dan rekap historis.' },
  { icon: 'pi pi-graduation-cap', title: 'Pendidikan & Diklat', desc: 'Manajemen data institusi, tahun kelulusan, dan digitalisasi ijazah/sertifikat.' },
  { icon: 'pi pi-arrow-right-arrow-left', title: 'Mutasi Jabatan', desc: 'Riwayat penugasan, perpindahan unit kerja wilayah, beserta pengarsipan berkas SK.' },
  { icon: 'pi pi-money-bill', title: 'KGB & Pensiun', desc: 'Sistem kalkulasi kenaikan berkala berkala beserta pendataan batas usia pensiun.' },
  { icon: 'pi pi-users', title: 'Manajemen Akses', desc: 'Kontrol hak akses berbasis peran (Super Admin, Pengelola Kepegawaian, Pegawai).' },
  { icon: 'pi pi-chart-bar', title: 'Laporan Eksportir', desc: 'Ekspor komparatif dalam format Excel, PDF, CSV dengan pemrosesan cepat.' }
];

// Fungsi animasi konter angka untuk Hero
const runSimulatedCounters = () => {
  animateNumber('totalPegawai', 346);
  animateNumber('cutiPending', 8);
  animateNumber('unitKerja', 14);
  animateNumber('jabatan', 42);
};

const animateNumber = (key, target) => {
  let start = 0;
  const duration = 1200;
  const step = Math.ceil(target / (duration / 16));
  const interval = setInterval(() => {
    start += step;
    if (start >= target) {
      animatedStats.value[key] = target;
      clearInterval(interval);
    } else {
      animatedStats.value[key] = start;
    }
  }, 16);
};

const handleScroll = () => { isScrolled.value = window.scrollY > 30; };
const toggleMobileMenu = () => { mobileMenuOpen.value = !mobileMenuOpen.value; };
const closeMobileMenu = () => { mobileMenuOpen.value = false; };
const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  runSimulatedCounters();
});
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}
html {
  scroll-behavior: smooth;
}
</style>