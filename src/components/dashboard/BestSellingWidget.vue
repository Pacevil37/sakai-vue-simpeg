<template>
  <div class="grid">
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card">
        <div class="text-center">
          <i class="pi pi-users text-4xl text-primary mb-2"></i>
          <h2>Total Pegawai</h2>
          <p class="text-3xl font-bold">{{ stats.total_pegawai || 0 }}</p>
        </div>
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card">
        <div class="text-center">
          <i class="pi pi-calendar text-4xl text-warning mb-2"></i>
          <h2>Cuti Pending</h2>
          <p class="text-3xl font-bold">{{ stats.cuti_pending || 0 }}</p>
        </div>
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card">
        <div class="text-center">
          <i class="pi pi-check-circle text-4xl text-success mb-2"></i>
          <h2>Cuti Disetujui</h2>
          <p class="text-3xl font-bold">{{ stats.cuti_setuju || 0 }}</p>
        </div>
      </div>
    </div>
    <div class="col-12 lg:col-6 xl:col-3">
      <div class="card">
        <div class="text-center">
          <i class="pi pi-star text-4xl text-info mb-2"></i>
          <h2>Golongan IV</h2>
          <p class="text-3xl font-bold">{{ stats.golongan_iv || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';

const stats = ref({});

const fetchStats = async () => {
  try {
    const { count: total_pegawai } = await supabase
      .from('pegawai')
      .select('*', { count: 'exact', head: true });
    const { count: cuti_pending } = await supabase
      .from('cuti')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    const { count: cuti_setuju } = await supabase
      .from('cuti')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'disetujui');
    const { count: golongan_iv } = await supabase
      .from('pegawai')
      .select('*', { count: 'exact', head: true })
      .ilike('golongan', 'IV%');

    stats.value = {
      total_pegawai: total_pegawai || 0,
      cuti_pending: cuti_pending || 0,
      cuti_setuju: cuti_setuju || 0,
      golongan_iv: golongan_iv || 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

onMounted(() => {
  fetchStats();
});
</script>