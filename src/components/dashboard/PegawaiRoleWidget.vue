<template>
    <div class="role-widget">
        <div class="role-widget-toolbar">
            <div class="role-widget-tabs">
                <button type="button" class="role-tab" :class="{ 'role-tab--active': activeTab === 'unit' }" @click="activeTab = 'unit'">
                    Unit Kerja
                </button>
                <button type="button" class="role-tab" :class="{ 'role-tab--active': activeTab === 'jabatan' }" @click="activeTab = 'jabatan'">
                    Jabatan
                </button>
            </div>
            <Button icon="pi pi-refresh" severity="secondary" rounded text size="small" @click="loadStats" :loading="loading" class="role-refresh-btn" />
        </div>

        <Message v-if="errorMessage" severity="warn" :closable="false" class="role-message">{{ errorMessage }}</Message>

        <div class="role-grid">
            <div v-for="(item, index) in currentStats" :key="index" class="role-card" :class="getTheme(index).bg">
                <div class="role-card-inner">
                    <div class="role-card-header">
                        <div class="role-card-icon" :class="getTheme(index).iconBg">
                            <i :class="activeTab === 'unit' ? 'pi pi-building' : 'pi pi-briefcase'"></i>
                        </div>
                        <div class="role-card-count">
                            <span class="role-card-number">{{ item.count }}</span>
                            <span class="role-card-unit-label">Pegawai</span>
                        </div>
                    </div>
                    <h3 class="role-card-title" :title="item.name">{{ item.name }}</h3>
                    <div class="role-card-progress">
                        <div class="role-card-progress-meta">
                            <span class="role-card-progress-label">Persentase</span>
                            <span class="role-card-progress-value" :class="getTheme(index).text">{{ calculatePercentage(item.count) }}%</span>
                        </div>
                        <div class="role-card-progress-bar">
                            <div class="role-card-progress-fill" :class="getTheme(index).iconBg" :style="{ width: calculatePercentage(item.count) + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="currentStats.length === 0 && !loading" class="role-empty">
            <div class="role-empty-icon"><i class="pi pi-inbox"></i></div>
            <h6 class="role-empty-title">Data Belum Tersedia</h6>
            <p class="role-empty-desc">Data statistik akan muncul setelah data pegawai diinput ke dalam sistem.</p>
        </div>

        <div v-if="loading && currentStats.length === 0" class="role-skeleton">
            <div v-for="i in 6" :key="i" class="role-skeleton-card"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '@/lib/supabase';
import Button from 'primevue/button';
import Message from 'primevue/message';

const unitStats = ref([]);
const jabatanStats = ref([]);
const loading = ref(false);
const errorMessage = ref(null);
const activeTab = ref('unit');

const totalEmployeesUnit = computed(() => unitStats.value.reduce((acc, curr) => acc + curr.count, 0));
const totalEmployeesJabatan = computed(() => jabatanStats.value.reduce((acc, curr) => acc + curr.count, 0));
const currentStats = computed(() => activeTab.value === 'unit' ? unitStats.value : jabatanStats.value);
const currentTotal = computed(() => activeTab.value === 'unit' ? totalEmployeesUnit.value : totalEmployeesJabatan.value);

const themeList = [
    { bg: 'role-card--blue', iconBg: 'role-icon--blue', text: 'role-text--blue' },
    { bg: 'role-card--purple', iconBg: 'role-icon--purple', text: 'role-text--purple' },
    { bg: 'role-card--teal', iconBg: 'role-icon--teal', text: 'role-text--teal' },
    { bg: 'role-card--orange', iconBg: 'role-icon--orange', text: 'role-text--orange' },
    { bg: 'role-card--pink', iconBg: 'role-icon--pink', text: 'role-text--pink' },
    { bg: 'role-card--indigo', iconBg: 'role-icon--indigo', text: 'role-text--indigo' },
    { bg: 'role-card--cyan', iconBg: 'role-icon--cyan', text: 'role-text--cyan' }
];

const getTheme = (index) => themeList[index % themeList.length];
const calculatePercentage = (count) => (currentTotal.value === 0 ? 0 : Math.round((count / currentTotal.value) * 100));

// Ambil data unit kerja (bergantung pada tabel units)
const fetchUnitStats = async () => {
    try {
        // 1. Ambil semua pegawai yang memiliki unit_kerja_id
        const { data: pegawai, error: errPegawai } = await supabase
            .from('pegawai')
            .select('unit_kerja_id')
            .not('unit_kerja_id', 'is', null);
        if (errPegawai) throw errPegawai;
        if (!pegawai.length) return [];

        // 2. Ambil semua unit yang terlibat
        const unitIds = [...new Set(pegawai.map(p => p.unit_kerja_id))];
        const { data: units, error: errUnits } = await supabase
            .from('units')
            .select('id, name')
            .in('id', unitIds);
        if (errUnits) throw errUnits;

        // 3. Mapping id -> name
        const unitMap = Object.fromEntries(units.map(u => [u.id, u.name]));

        // 4. Hitung jumlah per unit
        const counts = {};
        pegawai.forEach(p => {
            const name = unitMap[p.unit_kerja_id] || 'Unit Tidak Dikenal';
            counts[name] = (counts[name] || 0) + 1;
        });

        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    } catch (err) {
        console.error('Error fetching unit stats:', err);
        throw err;
    }
};

// Ambil data jabatan (langsung dari kolom jabatan)
const fetchJabatanStats = async () => {
    try {
        const { data, error } = await supabase
            .from('pegawai')
            .select('jabatan')
            .not('jabatan', 'is', null);
        if (error) throw error;

        const counts = {};
        data.forEach(p => {
            const jab = p.jabatan;
            counts[jab] = (counts[jab] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    } catch (err) {
        console.error('Error fetching jabatan stats:', err);
        throw err;
    }
};

const loadStats = async () => {
    loading.value = true;
    errorMessage.value = null;
    try {
        const [unit, jabatan] = await Promise.all([fetchUnitStats(), fetchJabatanStats()]);
        unitStats.value = unit;
        jabatanStats.value = jabatan;
    } catch (err) {
        errorMessage.value = 'Gagal mengambil data dari database. Menampilkan data simulasi.';
        // Fallback data agar widget tetap terlihat
        unitStats.value = [
            { name: 'Sekretariat', count: 45 },
            { name: 'Pendidikan Islam', count: 82 },
            { name: 'Haji & Umrah', count: 28 },
            { name: 'Bimas Islam', count: 56 },
            { name: 'Bimas Kristen', count: 34 }
        ];
        jabatanStats.value = [
            { name: 'Guru', count: 120 },
            { name: 'Penyuluh', count: 45 },
            { name: 'Pranata Komputer', count: 15 },
            { name: 'Analyst', count: 25 },
            { name: 'Staf Administrasi', count: 60 }
        ];
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadStats();
});
</script>

<style scoped>
/* (semua style tetap sama seperti yang Anda miliki) */
.role-widget {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.role-widget:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.role-widget-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.role-widget-tabs {
    display: flex;
    align-items: center;
    background: var(--surface-100);
    padding: 0.25rem;
    border-radius: 0.75rem;
    gap: 0.15rem;
}

.role-tab {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    background: transparent;
    cursor: pointer;
    transition: all 0.2s ease;
}

.role-tab:hover {
    color: var(--text-color);
}

.role-tab--active {
    background: var(--surface-card);
    color: var(--primary-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.role-refresh-btn {
    opacity: 0.85;
}

.role-message {
    margin-bottom: 1rem;
}

.role-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
}

.role-card {
    border-radius: 1rem;
    padding: 1.25rem;
    border: 1px solid transparent;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
}

.role-card::before {
    content: '';
    position: absolute;
    top: -1.5rem;
    right: -1.5rem;
    width: 6rem;
    height: 6rem;
    border-radius: 50%;
    opacity: 0.08;
}

.role-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.role-card--blue { background: rgba(59, 130, 246, 0.06); border-color: rgba(59, 130, 246, 0.2); }
.role-card--blue::before { background: #3b82f6; }
.role-card--purple { background: rgba(139, 92, 246, 0.06); border-color: rgba(139, 92, 246, 0.2); }
.role-card--purple::before { background: #8b5cf6; }
.role-card--teal { background: rgba(20, 184, 166, 0.06); border-color: rgba(20, 184, 166, 0.2); }
.role-card--teal::before { background: #14b8a6; }
.role-card--orange { background: rgba(249, 115, 22, 0.06); border-color: rgba(249, 115, 22, 0.2); }
.role-card--orange::before { background: #f97316; }
.role-card--pink { background: rgba(236, 72, 153, 0.06); border-color: rgba(236, 72, 153, 0.2); }
.role-card--pink::before { background: #ec4899; }
.role-card--indigo { background: rgba(99, 102, 241, 0.06); border-color: rgba(99, 102, 241, 0.2); }
.role-card--indigo::before { background: #6366f1; }
.role-card--cyan { background: rgba(6, 182, 212, 0.06); border-color: rgba(6, 182, 212, 0.2); }
.role-card--cyan::before { background: #06b6d4; }

.role-card-inner {
    position: relative;
    z-index: 1;
}

.role-card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.role-card-icon {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}

.role-card-icon i {
    font-size: 1.2rem;
}

.role-icon--blue { background: linear-gradient(135deg, #2563eb, #3b82f6); }
.role-icon--purple { background: linear-gradient(135deg, #7c3aed, #8b5cf6); }
.role-icon--teal { background: linear-gradient(135deg, #0d9488, #14b8a6); }
.role-icon--orange { background: linear-gradient(135deg, #ea580c, #f97316); }
.role-icon--pink { background: linear-gradient(135deg, #be185d, #ec4899); }
.role-icon--indigo { background: linear-gradient(135deg, #4f46e5, #6366f1); }
.role-icon--cyan { background: linear-gradient(135deg, #0891b2, #06b6d4); }

.role-card-count {
    text-align: right;
}

.role-card-number {
    display: block;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--text-color);
    letter-spacing: -0.02em;
}

.role-card-unit-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.6;
}

.role-card-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0 0 1rem 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 2.8em;
}

.role-card-progress-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.role-card-progress-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.role-card-progress-value {
    font-size: 0.875rem;
    font-weight: 800;
}

.role-text--blue { color: #2563eb; }
.role-text--purple { color: #7c3aed; }
.role-text--teal { color: #0d9488; }
.role-text--orange { color: #ea580c; }
.role-text--pink { color: #be185d; }
.role-text--indigo { color: #4f46e5; }
.role-text--cyan { color: #0891b2; }

.role-card-progress-bar {
    height: 6px;
    background: var(--surface-200);
    border-radius: 9999px;
    overflow: hidden;
}

.role-card-progress-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.6s ease;
}

.role-empty {
    text-align: center;
    padding: 2.5rem 1.5rem;
}

.role-empty-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    background: var(--surface-100);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
}

.role-empty-icon i {
    font-size: 2rem;
    color: var(--text-color-secondary);
    opacity: 0.6;
}

.role-empty-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0 0 0.35rem 0;
}

.role-empty-desc {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin: 0;
    max-width: 20rem;
    margin-left: auto;
    margin-right: auto;
}

.role-skeleton {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
}

.role-skeleton-card {
    height: 10rem;
    background: var(--surface-100);
    border-radius: 1rem;
    animation: role-pulse 1.5s ease-in-out infinite;
}

@keyframes role-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}
</style>