<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore'; // pastikan store ini sudah menggunakan Supabase
import { supabase } from '@/lib/supabase'; // untuk login Google
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
const googleLoading = ref(false); // loading state untuk tombol Google

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

// Login dengan Email/Password (menggunakan store Supabase)
const handleLogin = async () => {
    if (!validateForm()) return;

    try {
        isLoading.value = true;
        await authStore.login(form.value.email, form.value.password); // pastikan method login menerima email & password

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
    } finally {
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
        // Redirect akan ditangani oleh Supabase
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
    <div class="login-page">
        <!-- Background Elements -->
        <div class="login-bg-layer"></div>
        <div class="login-bg-pattern"></div>
        <div class="login-bg-glow"></div>

        <div class="login-container">
            <div class="login-card">
                <!-- Visual Side (Branding) -->
                <div class="login-visual">
                    <div class="visual-content">
                        <div class="logo-container">
                            <div class="logo-bg-glow"></div>
                            <img src="/kemenag-logo-freelogovectors.net_.png" alt="Logo Kemenag" class="app-logo" />
                        </div>
                        
                        <div class="text-content">
                            <h2 class="ministry-name">Kementerian Agama</h2>
                            <h1 class="region-name">Kabupaten Biak Numfor</h1>
                            <div class="divider"></div>
                            <p class="app-name">SIMPEG</p>
                            <p class="app-desc">Sistem Informasi Manajemen Kepegawaian</p>
                        </div>

                        <div class="visual-footer">
                            <div class="feature-pills">
                                <span class="pill"><i class="pi pi-check-circle"></i> Terintegrasi</span>
                                <span class="pill"><i class="pi pi-shield"></i> Aman</span>
                                <span class="pill"><i class="pi pi-bolt"></i> Cepat</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Decorative Circles -->
                    <div class="circle circle-1"></div>
                    <div class="circle circle-2"></div>
                    <div class="glass-overlay"></div>
                </div>

                <!-- Form Side -->
                <div class="login-form-wrapper">
                    <div class="form-header">
                        <h3>Selamat Datang</h3>
                        <p class="subtitle">Silakan masuk untuk melanjutkan</p>
                    </div>

                    <form class="login-form" @submit.prevent="handleLogin">
                        <div class="form-group">
                            <label for="email">Email / NIP</label>
                            <div class="input-wrapper">
                                <i class="pi pi-user input-icon"></i>
                                <InputText 
                                    id="email" 
                                    v-model="form.email" 
                                    placeholder="Masukkan Email atau NIP" 
                                    class="custom-input" 
                                    :class="{ 'p-invalid': errors.email }"
                                />
                            </div>
                            <small class="error-msg" v-if="errors.email">{{ errors.email }}</small>
                        </div>

                        <div class="form-group">
                            <label for="password">Kata Sandi</label>
                            <div class="input-wrapper">
                                <i class="pi pi-lock input-icon"></i>
                                <Password 
                                    id="password" 
                                    v-model="form.password" 
                                    placeholder="Masukkan kata sandi" 
                                    class="custom-password" 
                                    :class="{ 'p-invalid': errors.password }"
                                    :feedback="false" 
                                    toggleMask 
                                />
                            </div>
                            <small class="error-msg" v-if="errors.password">{{ errors.password }}</small>
                        </div>

                        <div class="form-actions">
                            <div class="remember-me">
                                <Checkbox v-model="form.remember" binary inputId="remember" />
                                <label for="remember">Ingat Saya</label>
                            </div>
                            <a href="#" class="forgot-pass">Lupa Sandi?</a>
                        </div>

                        <Button 
                            type="submit" 
                            label="Masuk Sekarang" 
                            class="submit-btn" 
                            :loading="isLoading" 
                            icon="pi pi-arrow-right" 
                            iconPos="right"
                        />
                    </form>

                    <!-- Tombol Login dengan Google -->


                    <div class="form-footer">
                        <p>Belum terdaftar? <a href="#" class="operator-link">Hubungi Operator</a></p>
                        <p class="copyright">&copy; {{ new Date().getFullYear() }} Kementerian Agama Kab. Biak Numfor</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.login-page {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: #f8fafc; /* White/Light gray background */
    font-family: 'Plus Jakarta Sans', sans-serif;
    overflow: hidden;
}

/* Background Effects */
.login-bg-layer {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%);
    z-index: 0;
}

.login-bg-pattern {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(#3f6212 1px, transparent 1px),
    linear-gradient(to right, #3f6212 1px, transparent 1px);
    background-size: 60px 60px;
    opacity: 0.03;
    z-index: 1;
}

.login-bg-glow {
    position: absolute;
    top: -30%;
    right: -10%;
    width: 70%;
    height: 70%;
    background: radial-gradient(circle, rgba(63, 98, 18, 0.15) 0%, transparent 70%); /* Lime-800 glow */
    filter: blur(100px);
    z-index: 1;
    animation: floatGlow 20s ease-in-out infinite alternate;
}

@keyframes floatGlow {
    0% { transform: translate(0, 0); }
    100% { transform: translate(-50px, 50px); }
}

/* Main Container */
.login-container {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 1100px;
    padding: 2rem;
}

.login-card {
    display: flex;
    background: rgba(255, 255, 255, 0.7); /* More transparent for glass effect */
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 24px;
    box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.05), 
        0 8px 10px -6px rgba(0, 0, 0, 0.01),
        0 0 0 1px rgba(255, 255, 255, 0.5); /* Subtle white border */
    overflow: hidden;
    min-height: 650px;
}

/* Visual Side (Left) */
.login-visual {
    flex: 1.2;
    background: linear-gradient(135deg, #15803d 0%, #3f6212 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: white;
    overflow: hidden;
}

.visual-content {
    position: relative;
    z-index: 5;
    text-align: center;
    width: 100%;
    max-width: 400px;
}

.logo-container {
    position: relative;
    margin-bottom: 2.5rem;
    display: inline-block;
}

.app-logo {
    width: 140px;
    height: auto;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
    position: relative;
    z-index: 2;
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.logo-container:hover .app-logo {
    transform: scale(1.05);
}

.logo-bg-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
    filter: blur(20px);
    z-index: 1;
}

.text-content {
    margin-bottom: 3rem;
}

.ministry-name {
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0;
    opacity: 0.9;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.region-name {
    font-size: 2rem;
    font-weight: 800;
    margin: 0.5rem 0 1.5rem;
    background: linear-gradient(to right, #fcd34d, #fbbf24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.divider {
    height: 2px;
    width: 60px;
    background: rgba(255,255,255,0.3);
    margin: 0 auto 1.5rem;
    border-radius: 2px;
}

.app-name {
    font-size: 2.5rem;
    font-weight: 900;
    margin: 0;
    letter-spacing: 2px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.app-desc {
    font-size: 0.95rem;
    margin: 0.5rem 0 0;
    opacity: 0.8;
    font-weight: 300;
}

.feature-pills {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.pill {
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.2);
    padding: 0.5rem 1rem;
    border-radius: 50px;
    font-size: 0.85rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.pill:hover {
    background: rgba(255,255,255,0.2);
    transform: translateY(-2px);
}

/* Decorative Elements Left */
.circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
    border: 1px solid rgba(255,255,255,0.1);
}

.circle-1 {
    width: 300px;
    height: 300px;
    top: -100px;
    left: -100px;
}

.circle-2 {
    width: 200px;
    height: 200px;
    bottom: -50px;
    right: -50px;
}

.glass-overlay {
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    opacity: 0.4;
    mix-blend-mode: overlay;
    pointer-events: none;
}

/* Form Side (Right) */
.login-form-wrapper {
    flex: 1;
    background: white;
    padding: 4rem 3.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.form-header {
    margin-bottom: 2.5rem;
}

.form-header h3 {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.5px;
}

.subtitle {
    color: #64748b;
    font-size: 1rem;
    margin: 0;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #334155;
}

.input-wrapper {
    position: relative;
}

.input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    z-index: 2;
    font-size: 1.1rem;
}

:deep(.custom-input),
:deep(.custom-password .p-inputtext) {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 2.75rem !important;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-family: inherit;
    transition: all 0.2s ease;
}

:deep(.custom-input:hover),
:deep(.custom-password .p-inputtext:hover) {
    border-color: #cbd5e1;
    background: white;
}

:deep(.custom-input:focus),
:deep(.custom-password .p-inputtext:focus) {
    border-color: #15803d;
    background: white;
    box-shadow: 0 0 0 4px rgba(21, 128, 61, 0.1);
}

:deep(.p-password) {
    width: 100%;
}

.error-msg {
    color: #ef4444;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.5rem;
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.remember-me label {
    font-size: 0.9rem;
    color: #64748b;
    cursor: pointer;
    user-select: none;
}

.forgot-pass {
    font-size: 0.9rem;
    color: #15803d;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
}

.forgot-pass:hover {
    color: #3f6212;
    text-decoration: underline;
}

.submit-btn {
    margin-top: 1rem;
    background: linear-gradient(to right, #15803d, #3f6212) !important;
    border: none !important;
    padding: 1rem !important;
    border-radius: 12px !important;
    font-weight: 700 !important;
    font-size: 1rem !important;
    letter-spacing: 0.5px;
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(21, 128, 61, 0.3) !important;
}

.form-footer {
    margin-top: auto;
    text-align: center;
    padding-top: 2rem;
}

.form-footer p {
    color: #94a3b8;
    font-size: 0.85rem;
    margin: 0;
}

.operator-link {
    color: #15803d;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
}

.operator-link:hover {
    color: #3f6212;
    text-decoration: underline;
}

.copyright {
    margin-top: 0.5rem !important;
    font-size: 0.8rem !important;
    opacity: 0.8;
}

/* Tambahkan style untuk tombol Google dan divider */
.google-login-wrapper {
    margin-top: 1.5rem;
    text-align: center;
}

.divider-text {
    position: relative;
    margin: 1rem 0;
    font-size: 0.85rem;
    color: #94a3b8;
}
.divider-text::before,
.divider-text::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: #e2e8f0;
}
.divider-text::before {
    left: 0;
}
.divider-text::after {
    right: 0;
}

.google-btn {
    width: 100%;
    border-radius: 12px !important;
    background: white !important;
    border: 1px solid #e2e8f0 !important;
    color: #334155 !important;
    font-weight: 600 !important;
    transition: all 0.2s ease !important;
}
.google-btn:hover {
    background: #f8fafc !important;
    border-color: #cbd5e1 !important;
    transform: translateY(-1px);
}
/* pastikan tidak override style utama lainnya */

/* Responsive */
@media (max-width: 960px) {
    .login-card {
        flex-direction: column;
        min-height: auto;
        max-width: 500px;
        margin: 0 auto;
    }

    .login-visual {
        padding: 3rem 2rem;
    }

    .login-form-wrapper {
        padding: 2.5rem 2rem;
    }

    .feature-pills {
        display: none;
    }
}

@media (max-width: 480px) {
    .login-container {
        padding: 1rem;
    }

    .login-visual {
        padding: 2rem 1.5rem;
    }

    .app-logo {
        width: 100px;
    }

    .region-name {
        font-size: 1.5rem;
    }
}
</style>
