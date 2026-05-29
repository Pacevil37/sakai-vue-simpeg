<template>
    <div class="activities-card">
        <div class="activities-toolbar">
            <Button
                icon="pi pi-refresh"
                severity="secondary"
                rounded
                text
                size="small"
                @click="loadRecentActivities"
                :loading="loading"
                class="activities-refresh-btn"
            />
        </div>

        <div v-if="activities && activities.length > 0" class="activities-list-wrap">
            <ul class="activities-list">
                <li
                    v-for="activity in activities"
                    :key="activity.id"
                    class="activities-item"
                >
                    <div
                        class="activities-item-icon"
                        :class="getActivityBgClass(activity.type)"
                    >
                        <i :class="[getActivityIcon(activity.type), 'activities-item-icon-i']"></i>
                    </div>
                    <div class="activities-item-body">
                        <span class="activities-item-desc">{{ activity.description }}</span>
                        <div class="activities-item-meta">
                            <span class="activities-item-user">
                                <i class="pi pi-user"></i>
                                {{ activity.user }}
                            </span>
                            <span class="activities-item-time">
                                <i class="pi pi-clock"></i>
                                {{ formatTimeAgo(activity.createdAt) }}
                            </span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        <div v-else-if="loading" class="activities-empty activities-empty--loading">
            <i class="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
            <span class="text-sm font-medium text-color-secondary">Memuat aktivitas...</span>
        </div>

        <div v-else class="activities-empty">
            <div class="activities-empty-icon">
                <i class="pi pi-clock"></i>
            </div>
            <h6 class="activities-empty-title">Tidak Ada Aktivitas</h6>
            <p class="activities-empty-desc">Belum ada riwayat aktivitas terbaru yang tercatat.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import dashboardService from '@/services/dashboardService';
import Button from 'primevue/button';

const toast = useToast();
const activities = ref([]);
const loading = ref(false);

const loadRecentActivities = async () => {
    try {
        loading.value = true;
        const response = await dashboardService.getRecentActivities();
        activities.value = response.data || response;
    } catch (error) {
        console.warn('API error, using mock data:', error);
        activities.value = [
            { id: 1, type: 'create', description: 'Menambahkan pegawai baru: Budi Santoso', user: 'Admin User', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
            { id: 2, type: 'update', description: 'Memperbarui data pegawai: Siti Aminah', user: 'Super Admin', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
            { id: 3, type: 'login', description: 'User login ke sistem', user: 'Operator 1', createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
            { id: 4, type: 'report', description: 'Mencetak laporan bulanan', user: 'Admin User', createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() }
        ];
    } finally {
        loading.value = false;
    }
};

const getActivityIcon = (type) => {
    const icons = {
        login: 'pi pi-sign-in',
        logout: 'pi pi-sign-out',
        create: 'pi pi-plus',
        update: 'pi pi-pencil',
        delete: 'pi pi-trash',
        report: 'pi pi-file-pdf'
    };
    return icons[type] || 'pi pi-info-circle';
};

const getActivityBgClass = (type) => {
    const classes = {
        login: 'activities-icon--green',
        logout: 'activities-icon--red',
        create: 'activities-icon--blue',
        update: 'activities-icon--orange',
        delete: 'activities-icon--red',
        report: 'activities-icon--purple'
    };
    return classes[type] || 'activities-icon--gray';
};

const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' thn lalu';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' bln lalu';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' hr lalu';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' jam lalu';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' mnt lalu';
    return 'Baru saja';
};

onMounted(() => {
    loadRecentActivities();
});
</script>

<style scoped>
.activities-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    min-height: 20rem;
    position: relative;
    transition: all 0.2s ease;
}

.activities-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.activities-toolbar {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 2;
}

.activities-refresh-btn {
    opacity: 0.85;
}

.activities-list-wrap {
    max-height: 22rem;
    overflow-y: auto;
    padding-right: 0.25rem;
    margin-top: 0.5rem;
}

.activities-list-wrap::-webkit-scrollbar {
    width: 6px;
}

.activities-list-wrap::-webkit-scrollbar-track {
    background: transparent;
}

.activities-list-wrap::-webkit-scrollbar-thumb {
    background: var(--surface-border);
    border-radius: 10px;
}

.activities-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.activities-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.75rem;
    transition: background 0.2s ease;
    border-bottom: 1px solid var(--surface-border);
}

.activities-item:last-child {
    border-bottom: none;
}

.activities-item:hover {
    background: var(--surface-50);
}

.activities-item-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.activities-item-icon-i {
    font-size: 1.1rem;
    font-weight: 700;
}

.activities-icon--green { background: rgba(13, 92, 46, 0.12); color: #0d5c2e; }
.activities-icon--red { background: rgba(220, 38, 38, 0.12); color: #dc2626; }
.activities-icon--blue { background: rgba(59, 130, 246, 0.12); color: #2563eb; }
.activities-icon--orange { background: rgba(249, 115, 22, 0.12); color: #ea580c; }
.activities-icon--purple { background: rgba(139, 92, 246, 0.12); color: #7c3aed; }
.activities-icon--gray { background: var(--surface-200); color: var(--text-color-secondary); }

.activities-item-body {
    flex: 1;
    min-width: 0;
}

.activities-item-desc {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
    line-height: 1.4;
    margin-bottom: 0.35rem;
}

.activities-item-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
    font-weight: 500;
}

.activities-item-user i,
.activities-item-time i {
    font-size: 0.7rem;
    margin-right: 0.25rem;
    opacity: 0.8;
}

.activities-item-time {
    background: var(--surface-100);
    padding: 0.2rem 0.5rem;
    border-radius: 0.5rem;
}

.activities-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 18rem;
    padding: 2rem;
    text-align: center;
}

.activities-empty--loading {
    border: 1px dashed var(--surface-border);
    border-radius: 0.75rem;
    background: var(--surface-ground);
}

.activities-empty-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    background: var(--surface-200);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.activities-empty-icon i {
    font-size: 1.75rem;
    color: var(--text-color-secondary);
    opacity: 0.6;
}

.activities-empty-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-color);
    margin: 0 0 0.35rem 0;
}

.activities-empty-desc {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin: 0;
}
</style>
