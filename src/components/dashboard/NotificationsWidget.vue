<template>
    <div class="card">
        <div class="flex items-center justify-between mb-6">
            <div class="font-semibold text-xl">Notifikasi Cuti</div>
            <div>
                <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu.toggle($event)"></Button>
                <Menu ref="menu" popup :model="menuItems" class="!min-w-40"></Menu>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center py-4">
            <i class="pi pi-spin pi-spinner"></i> Memuat...
        </div>
        <div v-else-if="pendingCuti.length === 0" class="text-center py-4 text-gray-500">
            Tidak ada notifikasi
        </div>
        <div v-else>
            <span class="block text-muted-color font-medium mb-4">HARI INI</span>
            <ul class="p-0 mx-0 mt-0 mb-6 list-none">
                <li v-for="cuti in pendingCuti" :key="cuti.id" class="flex items-center py-2 border-b border-surface">
                    <div class="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-full mr-4 shrink-0">
                        <i class="pi pi-calendar !text-xl text-orange-500"></i>
                    </div>
                    <span class="text-surface-900 dark:text-surface-0 leading-normal">
                        {{ cuti.pegawai?.nama || 'Pegawai' }}
                        <span class="text-surface-700 dark:text-surface-100"> mengajukan cuti <span class="text-primary font-bold">{{ cuti.jenis_cuti }}</span> pada {{ formatDate(cuti.tanggal_mulai) }}</span>
                    </span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/lib/supabase';
import Button from 'primevue/button';
import Menu from 'primevue/menu';

const pendingCuti = ref([]);
const loading = ref(false);
const menu = ref(null);
const menuItems = ref([
    { label: 'Refresh', icon: 'pi pi-refresh', command: () => fetchNotifications() },
    { label: 'Lihat Semua', icon: 'pi pi-arrow-right', to: '/cuti' }
]);

const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const fetchNotifications = async () => {
    loading.value = true;
    try {
        const { data, error } = await supabase
            .from('cuti')
            .select('id, jenis_cuti, tanggal_mulai, status, pegawai(nama)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);
        if (error) throw error;
        pendingCuti.value = data || [];
    } catch (err) {
        console.error('Gagal mengambil notifikasi:', err);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchNotifications();
});
</script>