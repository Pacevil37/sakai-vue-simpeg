<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

// Definisi menu items dengan visible menggunakan computed dari store
const model = ref([
    // Dashboard - All roles
    {
        label: 'Dashboard',
        items: [
            {
                label: 'Beranda',
                icon: 'pi pi-fw pi-home',
                to: '/',
                visible: computed(() => authStore.isAuthenticated)
            }
        ]
    },
    // Manajemen Pegawai - Admin, Operator, Superadmin
    {
        label: 'Manajemen Pegawai',
        items: [
            {
                label: 'Data Pegawai',
                icon: 'pi pi-fw pi-users',
                to: '/pegawai',
                visible: computed(() => authStore.canManageEmployees)
            },
            {
                label: 'Tambah Pegawai',
                icon: 'pi pi-fw pi-user-plus',
                to: '/pegawai/create',
                visible: computed(() => authStore.canManageEmployees)
            },
            {
                label: 'Master Posisi/Jabatan',
                icon: 'pi pi-fw pi-sitemap',
                to: '/admin/positions',
                visible: computed(() => authStore.isSuperAdmin)
            },
            {
                label: 'Master Unit Kerja',
                icon: 'pi pi-fw pi-building',
                to: '/admin/unit-kerja',
                visible: computed(() => authStore.isSuperAdmin)
            },
            {
                label: 'Riwayat Pendidikan',
                icon: 'pi pi-fw pi-book',
                to: '/admin/riwayat-pendidikan',
                visible: computed(() => authStore.canManageEmployees)
            },
            {
                label: 'Riwayat Diklat',
                icon: 'pi pi-fw pi-graduation-cap',
                to: '/admin/riwayat-diklat',
                visible: computed(() => authStore.canManageEmployees)
            }
        ]
    },
    // Administrasi Kepegawaian - Admin, Operator, Superadmin
    {
        label: 'Administrasi Kepegawaian',
        items: [
            {
                label: 'Mutasi',
                icon: 'pi pi-fw pi-refresh',
                to: '/admin/mutasi',
                visible: computed(() => authStore.canManageEmployees)
            },
            {
                label: 'KGB',
                icon: 'pi pi-fw pi-money-bill',
                to: '/admin/kgb',
                visible: computed(() => authStore.canManageEmployees)
            },
            {
                label: 'Penilaian Kinerja',
                icon: 'pi pi-fw pi-chart-line',
                to: '/admin/kinerja',
                visible: computed(() => authStore.canManageEmployees)
            },
            {
                label: 'Pensiun',
                icon: 'pi pi-fw pi-calendar-times',
                to: '/admin/pensiun',
                visible: computed(() => authStore.canManageEmployees)
            }
        ]
    },
    // Layanan Pegawai - Only pegawai role
    {
        label: 'Layanan Pegawai',
        items: [
            {
                label: 'Profil Saya',
                icon: 'pi pi-fw pi-user',
                to: '/pegawai/profil',
                visible: computed(() => authStore.isPegawai)
            },
            {
                label: 'Riwayat Pendidikan',
                icon: 'pi pi-fw pi-book',
                to: '/pegawai/riwayat-pendidikan',
                visible: computed(() => authStore.isPegawai)
            },
            {
                label: 'Riwayat Diklat',
                icon: 'pi pi-fw pi-graduation-cap',
                to: '/pegawai/riwayat-diklat',
                visible: computed(() => authStore.isPegawai)
            },
            {
                label: 'Data Mutasi',
                icon: 'pi pi-fw pi-refresh',
                to: '/pegawai/mutasi',
                visible: computed(() => authStore.isPegawai)
            },
            {
                label: 'Penilaian Kinerja',
                icon: 'pi pi-fw pi-star',
                to: '/pegawai/kinerja',
                visible: computed(() => authStore.isPegawai)
            },
            {
                label: 'KGB',
                icon: 'pi pi-fw pi-money-bill',
                to: '/pegawai/kgb',
                visible: computed(() => authStore.isPegawai)
            },
            {
                label: 'Pensiun',
                icon: 'pi pi-fw pi-calendar',
                to: '/pegawai/pensiun',
                visible: computed(() => authStore.isPegawai)
            }
        ]
    },
    // Laporan - Admin, Operator, Superadmin
    {
        label: 'Laporan',
        items: [
            {
                label: 'Laporan Pegawai',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/reports',
                visible: computed(() => authStore.canViewReports)
            }
        ]
    },
    // Administrasi Sistem - Only Superadmin
    {
        label: 'Administrasi Sistem',
        items: [
            {
                label: 'Manajemen User',
                icon: 'pi pi-fw pi-users',
                to: '/admin/users',
                visible: computed(() => authStore.isSuperAdmin)
            },
            {
                label: 'Konfigurasi Sistem',
                icon: 'pi pi-fw pi-cog',
                to: '/admin/settings',
                visible: computed(() => authStore.isSuperAdmin)
            },
            {
                label: 'Audit Log',
                icon: 'pi pi-fw pi-history',
                to: '/admin/audit',
                visible: computed(() => authStore.isSuperAdmin)
            }
        ]
    }
]);

// Menambahkan properti visible ke group level (opsional, tidak semua template menggunakannya)
// Namun untuk konsistensi, kita set juga
model.value.forEach(group => {
    if (group.label === 'Dashboard') group.visible = computed(() => authStore.isAuthenticated);
    if (group.label === 'Manajemen Pegawai') group.visible = computed(() => authStore.canManageEmployees);
    if (group.label === 'Administrasi Kepegawaian') group.visible = computed(() => authStore.canManageEmployees);
    if (group.label === 'Layanan Pegawai') group.visible = computed(() => authStore.isPegawai);
    if (group.label === 'Laporan') group.visible = computed(() => authStore.canViewReports);
    if (group.label === 'Administrasi Sistem') group.visible = computed(() => authStore.isSuperAdmin);
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item.label">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class=""></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>