<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img src="/kemenag-logo-freelogovectors.net_.png" alt="Logo Kemenag" style="height: 3rem;" />
            </router-link>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>

            <!-- Profile dengan dropdown manual (tanpa komponen PrimeVue) -->
            <div v-if="authStore.isAuthenticated" class="layout-topbar-profile" ref="profileContainer">
                <button class="profile-trigger" @click.stop="toggleDropdown">
                    <div class="profile-avatar">
                        <img 
                            v-if="userAvatar && !avatarLoadError" 
                            :src="userAvatar" 
                            class="avatar-img" 
                            @error="avatarLoadError = true"
                        />
                        <span v-else class="avatar-initial">{{ userName.charAt(0).toUpperCase() }}</span>
                    </div>
                </button>
                <div v-if="dropdownVisible" class="profile-dropdown">
                    <div class="dropdown-item" @click="goToProfile">
                        <i class="pi pi-user"></i> Profil Saya
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" @click="handleLogout">
                        <i class="pi pi-sign-out"></i> Logout
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';
import { supabase } from '@/lib/supabase';

const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();
const authStore = useAuthStore();
const router = useRouter();

// State
const userAvatar = ref('');
const userName = ref('');
const avatarLoadError = ref(false);
const dropdownVisible = ref(false);
const profileContainer = ref(null);

// Ambil data pegawai
const fetchUserProfile = async () => {
    const userEmail = authStore.user?.email;
    if (!userEmail) return;
    try {
        const { data, error } = await supabase
            .from('pegawai')
            .select('nama, foto_url')
            .eq('email', userEmail)
            .maybeSingle();
        if (error) throw error;
        if (data) {
            userName.value = data.nama || userEmail.split('@')[0];
            userAvatar.value = data.foto_url || '';
        } else {
            userName.value = userEmail.split('@')[0];
        }
        avatarLoadError.value = false;
    } catch (err) {
        console.error('Gagal fetch profil:', err);
        userName.value = authStore.user?.email?.split('@')[0] || 'User';
    }
};

// Toggle dropdown
const toggleDropdown = (event) => {
    event?.stopPropagation();
    dropdownVisible.value = !dropdownVisible.value;
};

// Tutup dropdown saat klik di luar
const handleClickOutside = (event) => {
    if (profileContainer.value && !profileContainer.value.contains(event.target)) {
        dropdownVisible.value = false;
    }
};

const goToProfile = () => {
    dropdownVisible.value = false;
    router.push('/pegawai/profil');
};

const handleLogout = async () => {
    dropdownVisible.value = false;
    await authStore.logout();
    router.push('/auth/login');
};

onMounted(() => {
    fetchUserProfile();
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

watch(() => authStore.user, () => {
    fetchUserProfile();
});
</script>

<style scoped>
.layout-topbar-profile {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 0.5rem;
}

.profile-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 2rem;
    transition: background-color 0.2s;
}

.profile-trigger:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.profile-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-color);
}

.profile-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-initial {
    font-size: 1rem;
    font-weight: 600;
    color: white;
}

.profile-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: var(--surface-card);
    border-radius: 0.75rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--surface-border);
    min-width: 180px;
    z-index: 1000;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
    color: var(--text-color);
}

.dropdown-item:hover {
    background: var(--surface-hover);
}

.dropdown-divider {
    height: 1px;
    background: var(--surface-border);
    margin: 0.25rem 0;
}
</style>