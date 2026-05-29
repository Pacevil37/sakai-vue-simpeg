<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import DefaultDashboard from '@/views/Dashboard.vue';

const auth = useAuthStore();
const role = computed(() => auth.userRole);
</script>

<template>
  <!-- Semua role menggunakan Dashboard.vue yang sudah modern dan role-aware -->
  <DefaultDashboard />
</template>
