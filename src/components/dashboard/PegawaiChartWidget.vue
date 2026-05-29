<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import Chart from 'primevue/chart';
import Button from 'primevue/button';

const toast = useToast();
const chartData = ref(null);
const loading = ref(false);

const chartOptions = computed(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    return {
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: { weight: 600 }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'var(--surface-overlay)',
                titleFont: { weight: 600 },
                padding: 12
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: { size: 12, weight: 500 }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary,
                    font: { size: 12 }
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };
});

const loadChartData = async () => {
    loading.value = true;
    try {
        // Ambil data golongan dari tabel pegawai
        const { data, error } = await supabase
            .from('pegawai')
            .select('golongan');

        if (error) throw error;

        if (data && data.length > 0) {
            // Hitung frekuensi tiap golongan
            const counts = {};
            data.forEach(peg => {
                const gol = peg.golongan || 'Tidak Diketahui';
                counts[gol] = (counts[gol] || 0) + 1;
            });

            // Urutkan golongan secara descending (IV/a, III/d, dst.) atau sesuai kebutuhan
            const sortedLabels = Object.keys(counts).sort((a, b) => {
                // Urutkan berdasarkan angka romawi dan huruf
                const aVal = a.replace(/[^IVX]/gi, '');
                const bVal = b.replace(/[^IVX]/gi, '');
                if (aVal !== bVal) return bVal.length - aVal.length;
                return a.localeCompare(b);
            });
            const sortedData = sortedLabels.map(label => counts[label]);

            const documentStyle = getComputedStyle(document.documentElement);
            const primaryColor = documentStyle.getPropertyValue('--primary-500') || '#0d5c2e';

            chartData.value = {
                labels: sortedLabels,
                datasets: [
                    {
                        label: 'Jumlah Pegawai',
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        data: sortedData,
                        borderRadius: 8,
                        borderSkipped: false
                    }
                ]
            };
        } else {
            // Data kosong, tampilkan placeholder
            chartData.value = null;
            toast.add({
                severity: 'info',
                summary: 'Info',
                detail: 'Belum ada data pegawai untuk ditampilkan.',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error loading chart data:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal Memuat Grafik',
            detail: error.message || 'Terjadi kesalahan saat mengambil data.',
            life: 4000
        });
        chartData.value = null;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadChartData();
});
</script>

<template>
    <div class="chart-card">
        <div class="chart-card-toolbar">
            <Button
                icon="pi pi-refresh"
                severity="secondary"
                rounded
                text
                size="small"
                @click="loadChartData"
                :loading="loading"
                class="chart-refresh-btn"
            />
        </div>

        <div v-if="chartData" class="chart-container">
            <Chart type="bar" :data="chartData" :options="chartOptions" class="chart-canvas" />
        </div>

        <div v-else-if="loading" class="chart-empty chart-empty--loading">
            <i class="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
            <span class="text-sm font-medium text-color-secondary">Memproses data grafik...</span>
        </div>

        <div v-else class="chart-empty">
            <div class="chart-empty-icon">
                <i class="pi pi-chart-bar"></i>
            </div>
            <h6 class="chart-empty-title">Data Tidak Tersedia</h6>
            <p class="chart-empty-desc">Belum ada data pegawai untuk ditampilkan.</p>
        </div>
    </div>
</template>

<style scoped>
.chart-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    position: relative;
    transition: all 0.2s ease;
}

.chart-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.chart-card-toolbar {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 2;
}

.chart-refresh-btn {
    opacity: 0.8;
}

.chart-refresh-btn:hover {
    opacity: 1;
}

.chart-container {
    position: relative;
    height: 20rem;
    margin-top: 0.5rem;
}

.chart-canvas {
    width: 100% !important;
    height: 100% !important;
}

.chart-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 18rem;
    padding: 2rem;
    background: var(--surface-ground);
    border-radius: 0.75rem;
    border: 1px dashed var(--surface-border);
}

.chart-empty--loading {
    border-style: solid;
}

.chart-empty-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: var(--surface-200);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.chart-empty-icon i {
    font-size: 1.75rem;
    color: var(--text-color-secondary);
    opacity: 0.7;
}

.chart-empty-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0 0 0.35rem 0;
}

.chart-empty-desc {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin: 0;
}
</style>