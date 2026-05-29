<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

const model = ref([
    {
        label: 'Home',
        items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
    },
    {
        label: 'SIMPEG',
        items: [
            {
                label: 'Data Pegawai',
                icon: 'pi pi-fw pi-users',
                to: '/pegawai',
                visible: computed(() => authStore.isAuthenticated && (authStore.isAdmin || authStore.isOperator || authStore.isSuperAdmin))
            },
            {
                label: 'Laporan',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/reports',
                visible: computed(() => authStore.isAuthenticated && (authStore.isAdmin || authStore.isOperator || authStore.isSuperAdmin))
            }
        ]
    },
    {
        label: 'Pegawai Saya',
        items: [
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-id-card',
                to: '/pegawai/dashboard',
                visible: computed(() => authStore.isAuthenticated && authStore.userRole === 'pegawai')
            },
            {
                label: 'Profil',
                icon: 'pi pi-fw pi-user',
                to: '/pegawai/profil',
                visible: computed(() => authStore.isAuthenticated && authStore.userRole === 'pegawai')
            },
            {
                label: 'Riwayat Pendidikan',
                icon: 'pi pi-fw pi-book',
                to: '/pegawai/riwayat-pendidikan',
                visible: computed(() => authStore.isAuthenticated && authStore.userRole === 'pegawai')
            },
            {
                label: 'Riwayat Diklat',
                icon: 'pi pi-fw pi-briefcase',
                to: '/pegawai/riwayat-diklat',
                visible: computed(() => authStore.isAuthenticated && authStore.userRole === 'pegawai')
            },
            {
                label: 'Mutasi',
                icon: 'pi pi-fw pi-refresh',
                to: '/pegawai/mutasi',
                visible: computed(() => authStore.isAuthenticated && authStore.userRole === 'pegawai')
            },
            {
                label: 'Kinerja',
                icon: 'pi pi-fw pi-star',
                to: '/pegawai/kinerja',
                visible: computed(() => authStore.isAuthenticated && authStore.userRole === 'pegawai')
            },
            {
                label: 'KGB',
                icon: 'pi pi-fw pi-money-bill',
                to: '/pegawai/kgb',
                visible: computed(() => authStore.isAuthenticated && authStore.userRole === 'pegawai')
            },
            {
                label: 'Pensiun',
                icon: 'pi pi-fw pi-calendar',
                to: '/pegawai/pensiun',
                visible: computed(() => authStore.isAuthenticated && authStore.userRole === 'pegawai')
            }
        ]
    },
    {
        label: 'Pengaturan',
        items: [
            {
                label: 'Manajemen User',
                icon: 'pi pi-fw pi-users',
                to: '/admin/users',
                visible: computed(() => authStore.isAuthenticated && (authStore.isAdmin || authStore.isSuperAdmin))
            },
            {
                label: 'Konfigurasi Sistem',
                icon: 'pi pi-fw pi-cog',
                to: '/admin/settings',
                visible: computed(() => authStore.isAuthenticated && (authStore.isAdmin || authStore.isSuperAdmin))
            }
        ]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
