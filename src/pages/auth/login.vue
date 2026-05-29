<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore'; 
import { supabase } from '@/lib/supabase'; 
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// Form data
const form = ref({
    email: '',
    password: '',
    remember: false
});

// Form validation
const errors = ref({});
const isLoading = ref(false);
const googleLoading = ref(false); 

// Computed
const isFormValid = computed(() => {
    return form.value.email && form.value.password && !errors.value.email && !errors.value.password;
});

// Methods
const validateForm = () => {
    errors.value = {};

    if (!form.value.email) {
        errors.value.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
        errors.value.email = 'Format email tidak valid';
    }

    if (!form.value.password) {
        errors.value.password = 'Password harus diisi';
    } else if (form.value.password.length < 6) {
        errors.value.password = 'Password minimal 6 karakter';
    }

    return Object.keys(errors.value).length === 0;
};

// Login dengan Email/Password
const handleLogin = async () => {
    if (!validateForm()) return;

    try {
        isLoading.value = true;
        await authStore.login(form.value.email, form.value.password); 

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Login berhasil! Selamat datang.',
            life: 2000
        });

        router.push('/');
    } catch (error) {
        let errorMessage = 'Terjadi kesalahan saat login';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        toast.add({
            severity: 'error',
            summary: 'Login Gagal',
            detail: errorMessage,
            life: 3500
        });

        form.value.password = '';
    } finally { // <--- Sudah diperbaiki menjadi finally
        isLoading.value = false;
    }
};

// Login dengan Google
const handleGoogleLogin = async () => {
    googleLoading.value = true;
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
        if (error) throw error;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Login Google Gagal',
            detail: error.message || 'Terjadi kesalahan, coba lagi.',
            life: 3500
        });
        googleLoading.value = false;
    }
};

onMounted(() => {
    if (authStore.isAuthenticated) {
        router.push('/');
    }
});
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center relative bg-[#fafafa] font-sans antialiased overflow-hidden p-4 sm:p-6 lg:p-8">
    
    <div class="absolute inset-0 bg-[radial-gradient(50rem_50rem_at_center,theme(colors.emerald.50),white)] z-0"></div>
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] z-0"></div>
    
    <div class="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/30 rounded-full blur-3xl animate-pulse z-0"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-200/20 rounded-full blur-3xl z-0"></div>

    <div class="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[32px] shadow-2xl shadow-slate-200/50 flex flex-col md:flex-row overflow-hidden min-h-[680px] z-10">
      
      <div class="flex-1 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 p-8 lg:p-12 relative flex flex-col justify-between overflow-hidden text-white">
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div class="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl"></div>

        <div class="relative z-10 text-center md:text-left space-y-6 my-auto md:my-0">
          <div class="inline-flex p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-xl">
            <img src="/kemenag-logo-freelogovectors.net_.png" alt="Logo Kemenag" class="w-20 h-auto filter drop-shadow-md object-contain" />
          </div>
          
          <div class="space-y-2">
            <p class="text-xs font-bold text-emerald-400 uppercase tracking-widest">Kementerian Agama</p>
            <h1 class="text-2xl lg:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Kabupaten Biak Numfor
            </h1>
            <div class="w-12 h-[3px] bg-emerald-500 rounded-full mx-auto md:mx-0 mt-4"></div>
          </div>

          <div class="pt-4">
            <h2 class="text-4xl font-extrabold tracking-wider text-white">SIMPEG</h2>
            <p class="text-xs text-slate-400 font-medium tracking-wide mt-1">Sistem Informasi Manajemen Kepegawaian</p>
          </div>
        </div>

        <div class="relative z-10 hidden lg:block pt-8 border-t border-white/5">
          <div class="flex flex-wrap gap-2.5">
            <span class="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2">
              <i class="pi pi-check-circle text-emerald-400"></i> Terintegrasi
            </span>
            <span class="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2">
              <i class="pi pi-shield text-emerald-400"></i> Proteksi Aman
            </span>
            <span class="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2">
              <i class="pi pi-bolt text-emerald-400"></i> Akses Cepat
            </span>
          </div>
        </div>
      </div>

      <div class="flex-1 bg-white p-8 lg:p-12 flex flex-col justify-between">
        
        <div class="space-y-2 mb-8 md:mb-0">
          <h3 class="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">Selamat Datang</h3>
          <p class="text-sm text-slate-500 font-medium">Silakan autentikasi akun Anda untuk masuk ke sistem</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5 my-auto py-4">
          
          <div class="space-y-1.5">
            <label for="email" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Email / NIP</label>
            <div class="relative">
              <i class="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm z-10"></i>
              <InputText 
                id="email" 
                v-model="form.email" 
                placeholder="Masukkan Email atau NIP" 
                class="w-full !pl-11 !pr-4 !py-3.5 !rounded-xl !border-slate-200 !bg-slate-50/50 focus:!bg-white focus:!border-emerald-600 focus:!shadow-[0_0_0_4px_rgba(16,185,129,0.1)] !transition-all !duration-200 !text-sm !font-medium"
                :class="{ 'p-invalid !border-red-400': errors.email }"
              />
            </div>
            <p v-if="errors.email" class="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1">
              <i class="pi pi-exclamation-circle"></i> {{ errors.email }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label for="password" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Kata Sandi</label>
            <div class="relative">
              <i class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm z-10"></i>
              <Password 
                id="password" 
                v-model="form.password" 
                placeholder="Masukkan kata sandi" 
                class="w-full"
                inputClass="w-full !pl-11 !pr-10 !py-3.5 !rounded-xl !border-slate-200 !bg-slate-50/50 focus:!bg-white focus:!border-emerald-600 focus:!shadow-[0_0_0_4px_rgba(16,185,129,0.1)] !transition-all !duration-200 !text-sm !font-medium"
                :class="{ 'p-invalid !border-red-400': errors.password }"
                :feedback="false" 
                toggleMask 
              />
            </div>
            <p v-if="errors.password" class="text-xs text-red-500 font-medium flex items-center gap-1.5 mt-1">
              <i class="pi pi-exclamation-circle"></i> {{ errors.password }}
            </p>
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <div class="flex items-center gap-2">
              <Checkbox v-model="form.remember" binary inputId="remember" class="!rounded-md" />
              <label for="remember" class="text-slate-600 font-semibold cursor-pointer select-none">Remember Me</label>
            </div>
            <a href="#" class="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-colors">Lupa Sandi?</a>
          </div>

          <Button 
            type="submit" 
            label="Masuk Aplikasi" 
            class="w-full !bg-slate-950 hover:!bg-emerald-600 !border-none !py-3.5 !rounded-xl !font-bold !text-sm !transition-all !duration-300 !shadow-sm hover:!shadow-lg hover:!shadow-emerald-600/10" 
            :loading="isLoading" 
            icon="pi pi-arrow-right" 
            iconPos="right"
          />


        </form>

        <div class="text-center pt-6 border-t border-slate-100/80 md:pt-0 md:border-none space-y-2">
          <p class="text-xs text-slate-400 font-medium">
            Belum terdaftar? <a href="#" class="text-emerald-600 hover:text-emerald-700 font-bold hover:underline transition-colors">Hubungi Administrator</a>
          </p>
          <p class="text-[10px] text-slate-400 font-medium">
            &copy; 2026 Kementerian Agama Kab. Biak Numfor
          </p>
        </div>

      </div>
    </div>
  </div>
</template>