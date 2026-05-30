<!-- File: src/views/dashboard/Dashboard.vue -->
<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

// 1. Import sub-dashboard khusus yang sudah dipisah
import AdminDashboard from './AdminDashboard.vue';
import PegawaiDashboard from './PegawaiDashboard.vue';

const authStore = useAuthStore();

onMounted(() => {
    // Log ini untuk memastikan role user terbaca dengan benar saat halaman dimuat
    console.log("Current User Role:", authStore.userRole);
});
</script>

<template>
    <div class="main-dashboard-wrapper">
        
        <!-- JIKA ROLE: Super Admin, Admin Kepegawaian, atau Operator -->
        <AdminDashboard 
            v-if="authStore.isSuperAdmin || authStore.isAdmin || authStore.isOperator" 
        />
        
        <!-- JIKA ROLE: Pegawai biasa -->
        <PegawaiDashboard 
            v-else-if="authStore.isPegawai" 
        />
        
        <!-- FALLBACK: Jika role belum selesai dimuat dari AuthStore -->
        <div v-else class="loading-state">
            <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
            <p>Memverifikasi Hak Akses...</p>
        </div>
        
    </div>
</template>

<style scoped>
.main-dashboard-wrapper {
    min-height: 100vh;
    background-color: var(--surface-ground);
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    gap: 1rem;
    color: var(--text-color-secondary);
}
</style>