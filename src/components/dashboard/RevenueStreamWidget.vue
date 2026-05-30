<script setup>
import { onMounted, ref, watch } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import Chart from 'primevue/chart';

// Destrukturisasi reaktif canggih dari ekosistem layout PrimeVue
const { layoutConfig } = useLayout();

const chartData = ref({});
const chartOptions = ref({});

// Fungsi murni pemetaan data (Memisahkan logika data keras dari elemen warna DOM)
const initChartData = () => {
    return {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [
            {
                type: 'bar',
                label: 'Langganan Pegawai',
                backgroundColor: 'rgba(59, 130, 246, 0.85)', // Blue-500 dengan Opacity
                hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                data: [4000, 10000, 15000, 4000],
                barThickness: 24,
                maxBarThickness: 32
            },
            {
                type: 'bar',
                label: 'Kemitraan Instansi',
                backgroundColor: 'rgba(6, 182, 212, 0.85)', // Cyan-500
                hoverBackgroundColor: 'rgba(6, 182, 212, 1)',
                data: [2100, 8400, 2400, 7500],
                barThickness: 24,
                maxBarThickness: 32
            },
            {
                type: 'bar',
                label: 'Sponsor Sektoral',
                backgroundColor: 'rgba(139, 92, 246, 0.85)', // Purple-500
                hoverBackgroundColor: 'rgba(139, 92, 246, 1)',
                data: [4100, 5200, 3400, 7400],
                borderRadius: { topLeft: 6, topRight: 6 },
                borderSkipped: false,
                barThickness: 24,
                maxBarThickness: 32
            }
        ]
    };
};

// Fungsi dinamis untuk memperbarui palet warna grafik mengikuti siklus tema aplikasi
const updateChartOptions = () => {
    const isDark = layoutConfig.darkTheme.value;
    
    // Penentuan warna adaptif tanpa manipulasi DOM langsung
    const textColor = isDark ? '#f3f4f6' : '#374151';        // gray-100 vs gray-700
    const textMuted = isDark ? '#9ca3af' : '#6b7280';       // gray-400 vs gray-500
    const gridColor = isDark ? '#374151' : '#f3f4f6';       // gray-700 vs gray-100

    chartOptions.value = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: textColor,
                    font: { family: 'Inter, sans-serif', size: 11, weight: '600' },
                    boxWidth: 10,
                    boxHeight: 10,
                    usePointStyle: true,
                    pointStyle: 'circle'
                },
                position: 'bottom',
                align: 'start'
            },
            tooltip: {
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#111827',
                bodyColor: isDark ? '#d1d5db' : '#374151',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                boxPadding: 6,
                cornerRadius: 8,
                typography: { family: 'Inter, sans-serif' }
            }
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textMuted,
                    font: { family: 'Inter, sans-serif', weight: '500' }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                stacked: true,
                ticks: {
                    color: textMuted,
                    font: { family: 'JetBrains Mono, monospace', size: 10 },
                    callback: (value) => 'Rp ' + value.toLocaleString('id-ID')
                },
                grid: {
                    color: gridColor,
                    drawBorder: false,
                    drawTicks: false
                }
            }
        }
    };
};

// PERBAIKAN UTAMA: Mengamati konfigurasi tema secara reaktif dan aman
watch(
    () => layoutConfig.darkTheme.value,
    () => {
        updateChartOptions();
    }
);

onMounted(() => {
    chartData.value = initChartData();
    updateChartOptions();
});
</script>

<template>
    <div class="bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 shadow-sm transition-all duration-300 w-full flex flex-col justify-between">
        
        <div class="flex items-start justify-between gap-4 mb-6">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                    <h3 class="text-sm font-black text-surface-800 dark:text-surface-100 m-0 tracking-tight">Aliran Grafik Pendapatan</h3>
                </div>
                <p class="text-[11px] text-surface-400 dark:text-surface-500 font-medium m-0">Akumulasi laporan profit operasional per kuartal.</p>
            </div>
            
            <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                <i class="pi pi-arrow-up-right text-[10px]"></i>
                <span>12.4%</span>
            </div>
        </div>

        <div class="w-full h-72 relative">
            <Chart 
                type="bar" 
                :data="chartData" 
                :options="chartOptions" 
                class="w-full h-full" 
            />
        </div>

    </div>
</template>