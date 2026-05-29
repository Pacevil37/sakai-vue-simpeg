<template>
    <div class="stats-grid">
        <div class="stats-card stats-card--blue">
            <div class="stats-card-header">
                <span class="stats-card-label">Total Pegawai</span>
                <div class="stats-card-icon">
                    <i class="pi pi-users"></i>
                </div>
            </div>
            <div class="stats-card-value">{{ stats.totalPegawai || 0 }}</div>
            <div class="stats-card-footer">
                <span class="stats-card-badge stats-card-badge--success">
                    <i class="pi pi-check-circle"></i>{{ stats.activePegawai || 0 }}
                </span>
                <span class="stats-card-meta">Pegawai Aktif</span>
            </div>
        </div>

        <div class="stats-card stats-card--cyan">
            <div class="stats-card-header">
                <span class="stats-card-label">Laki-Laki</span>
                <div class="stats-card-icon">
                    <i class="pi pi-user"></i>
                </div>
            </div>
            <div class="stats-card-value">{{ stats.lakiLaki || 0 }}</div>
            <div class="stats-card-footer">
                <span class="stats-card-badge stats-card-badge--cyan">{{ calculatePercentage(stats.lakiLaki, stats.totalPegawai) }}%</span>
                <span class="stats-card-meta">Dari Total</span>
            </div>
        </div>

        <div class="stats-card stats-card--pink">
            <div class="stats-card-header">
                <span class="stats-card-label">Perempuan</span>
                <div class="stats-card-icon">
                    <i class="pi pi-user"></i>
                </div>
            </div>
            <div class="stats-card-value">{{ stats.perempuan || 0 }}</div>
            <div class="stats-card-footer">
                <span class="stats-card-badge stats-card-badge--pink">{{ calculatePercentage(stats.perempuan, stats.totalPegawai) }}%</span>
                <span class="stats-card-meta">Dari Total</span>
            </div>
        </div>

        <div class="stats-card stats-card--orange">
            <div class="stats-card-header">
                <span class="stats-card-label">Pegawai Baru</span>
                <div class="stats-card-icon">
                    <i class="pi pi-bolt"></i>
                </div>
            </div>
            <div class="stats-card-value">{{ stats.newThisMonth || 0 }}</div>
            <div class="stats-card-footer">
                <span class="stats-card-badge stats-card-badge--orange">{{ stats.totalReports || 0 }}</span>
                <span class="stats-card-meta">Total Cuti</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';

const toast = useToast();
const stats = ref({
    totalPegawai: 0,
    activePegawai: 0,
    lakiLaki: 0,
    perempuan: 0,
    newThisMonth: 0,
    totalReports: 0,
});

const loading = ref(false);

const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

const loadStats = async () => {
    loading.value = true;
    try {
        // Total pegawai
        const { count: totalPegawai, error: errTotal } = await supabase
            .from('pegawai')
            .select('*', { count: 'exact', head: true });
        if (errTotal) throw errTotal;

        // Pegawai aktif
        const { count: activePegawai, error: errActive } = await supabase
            .from('pegawai')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
        if (errActive) throw errActive;

        // Laki-laki (jenis_kelamin = 'L' atau 'Laki-laki')
        const { count: lakiLaki, error: errLaki } = await supabase
            .from('pegawai')
            .select('*', { count: 'exact', head: true })
            .in('jenis_kelamin', ['L', 'Laki-laki']);
        if (errLaki) throw errLaki;

        // Perempuan
        const { count: perempuan, error: errPerempuan } = await supabase
            .from('pegawai')
            .select('*', { count: 'exact', head: true })
            .in('jenis_kelamin', ['P', 'Perempuan']);
        if (errPerempuan) throw errPerempuan;

        // Pegawai baru bulan ini (created_at >= awal bulan)
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { count: newThisMonth, error: errNew } = await supabase
            .from('pegawai')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', firstDay);
        if (errNew) throw errNew;

        // Total cuti
        const { count: totalCuti, error: errCuti } = await supabase
            .from('cuti')
            .select('*', { count: 'exact', head: true });
        if (errCuti) throw errCuti;

        stats.value = {
            totalPegawai: totalPegawai || 0,
            activePegawai: activePegawai || 0,
            lakiLaki: lakiLaki || 0,
            perempuan: perempuan || 0,
            newThisMonth: newThisMonth || 0,
            totalReports: totalCuti || 0,
        };
    } catch (error) {
        console.error('Error loading stats from Supabase:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal Memuat Statistik',
            detail: error.message,
            life: 3000,
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadStats();
});
</script>

<style scoped>
/* Salin seluruh style dari kode asli (tidak berubah) */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
}

@media (min-width: 576px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 992px) {
    .stats-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

.stats-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.stats-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
}

.stats-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.stats-card-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-color-secondary);
}

.stats-card-icon {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.stats-card-icon i {
    font-size: 1.25rem;
    color: #fff;
}

.stats-card--blue .stats-card-icon { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
.stats-card--cyan .stats-card-icon { background: linear-gradient(135deg, #0891b2, #06b6d4); }
.stats-card--pink .stats-card-icon { background: linear-gradient(135deg, #be185d, #ec4899); }
.stats-card--orange .stats-card-icon { background: linear-gradient(135deg, #c2410c, #f97316); }

.stats-card-value {
    font-size: 1.875rem;
    font-weight: 800;
    color: var(--text-color);
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin-bottom: 0.75rem;
}

.stats-card-footer {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.stats-card-badge {
    font-size: 0.875rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}

.stats-card-badge--success { color: #059669; }
.stats-card-badge--cyan { color: #0891b2; }
.stats-card-badge--pink { color: #be185d; }
.stats-card-badge--orange { color: #c2410c; }

.stats-card-meta {
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    font-weight: 500;
}
</style>