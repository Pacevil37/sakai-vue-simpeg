<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { supabase } from '@/lib/supabase';
import Chart from 'primevue/chart';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';

const toast = useToast();
const chartData = ref(null);
const isLoading = ref(false);

// Konfigurasi Chart Options untuk Horizontal Style Kelas Dunia
const chartOptions = computed(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return {
        indexAxis: 'y', // KUNCI UTAMA: Mengubah orientasi menjadi Horizontal
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                titleColor: isDarkMode ? '#ffffff' : '#0f172a',
                bodyColor: isDarkMode ? '#cbd5e1' : '#334155',
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                titleFont: { size: 13, weight: 700 },
                bodyFont: { size: 12, weight: 500 }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    font: { size: 11 },
                    stepSize: 1
                },
                grid: {
                    color: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: isDarkMode ? '#cbd5e1' : '#1e293b', // Warna label golongan lebih kontras
                    font: { size: 12, weight: 700 }, // Font dipertegas agar mudah dibaca di kiri
                },
                grid: {
                    display: false, // Hilangkan garis vertikal agar clean
                    drawBorder: false
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };
});

const loadChartData = async () => {
    isLoading.value = true;
    try {
        const { data, error } = await supabase
            .from('pegawai')
            .select('golongan');

        if (error) throw error;

        if (data && data.length > 0) {
            const counts = {};
            data.forEach(peg => {
                const gol = peg.golongan || 'N/A';
                counts[gol] = (counts[gol] || 0) + 1;
            });

            // Urutkan Golongan dari Tingkat Tertinggi ke Terendah
            const sortedLabels = Object.keys(counts).sort((a, b) => {
                const aVal = a.replace(/[^IVX]/gi, '');
                const bVal = b.replace(/[^IVX]/gi, '');
                if (aVal !== bVal) return bVal.length - aVal.length;
                return a.localeCompare(b);
            });
            const sortedData = sortedLabels.map(label => counts[label]);

            // Membuat Efek Gradasi Horizontal Menggunakan Canvas Context
            chartData.value = {
                labels: sortedLabels,
                datasets: [
                    {
                        label: 'Jumlah Aparatur',
                        // Menggunakan fungsi callback untuk render gradasi CSS murni ke Chart.js
                        backgroundColor: (context) => {
                            const chart = context.chart;
                            const { ctx, chartArea } = chart;
                            if (!chartArea) return null;
                            
                            // Buat gradasi linear dari kiri ke kanan (X0 ke X1)
                            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                            gradient.addColorStop(0, '#10b981'); // Emerald 500 (Kiri)
                            gradient.addColorStop(1, '#06b6d4'); // Teal/Cyan 500 (Kanan)
                            return gradient;
                        },
                        hoverBackgroundColor: '#059669',
                        data: sortedData,
                        borderRadius: 20, // Rounded kapsul penuh yang super modern
                        borderSkipped: false,
                        maxBarThickness: 16 // Batang dibuat ramping dan elegan
                    }
                ]
            };
        } else {
            chartData.value = null;
        }
    } catch (error) {
        console.error('Error loading chart data:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal Sinkronisasi Grafik',
            detail: error.message || 'Terjadi gangguan jaringan database.',
            life: 4000
        });
        chartData.value = null;
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    loadChartData();
});
</script>

<template>
    <div class="relative w-full transition-all duration-300">
        
        <div class="absolute -top-12 right-0 z-20">
            <Button
                icon="pi pi-refresh"
                severity="secondary"
                rounded
                text
                size="small"
                @click="loadChartData"
                :loading="isLoading"
            />
        </div>

        <div v-if="chartData && !isLoading" class="h-80 w-full mt-2">
            <Chart type="bar" :data="chartData" :options="chartOptions" class="w-full h-full" />
        </div>

        <div v-else-if="isLoading" class="h-80 w-full flex flex-col justify-between py-4 px-2">
            <div v-for="i in 5" :key="i" class="flex items-center gap-4 w-full">
                <Skeleton width="40px" height="14px" class="shrink-0"></Skeleton>
                <Skeleton :width="Math.floor(Math.random() * (85 - 40 + 1)) + 40 + '%'" height="14px" borderRadius="20px"></Skeleton>
            </div>
        </div>

        <div v-else class="h-80 border border-dashed border-surface-200 dark:border-surface-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <div class="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800/50 flex items-center justify-center text-surface-400 mb-3">
                <i class="pi pi-chart-bar text-xl"></i>
            </div>
            <h4 class="text-sm font-bold text-surface-900 dark:text-white m-0">Matriks Distribusi Kosong</h4>
            <p class="text-xs text-surface-400 max-w-xs m-0 mt-1">Belum ada record golongan yang terekam.</p>
        </div>

    </div>
</template>