import AppLayout from '@/layout/AppLayout.vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // ==================== ROUTE AUTHENTICATION ====================
        {
            path: '/auth/callback',
            name: 'auth-callback',
            component: () => import('@/pages/auth/callback.vue'),
            meta: { requiresGuest: true }
        },
        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/pages/auth/login.vue'),
            meta: { requiresGuest: true }
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        },

        // ==================== ROUTE UTAMA (DENGAN LAYOUT) ====================
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },

                // ---------- Manajemen Pegawai ----------
                {
                    path: '/pegawai',
                    name: 'pegawai',
                    component: () => import('@/pages/pegawai/index.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/pegawai/create',
                    name: 'pegawai-create',
                    component: () => import('@/pages/pegawai/create.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/pegawai/:id',
                    name: 'pegawai-detail',
                    component: () => import('@/pages/pegawai/detail.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/pegawai/:id/edit',
                    name: 'pegawai-edit',
                    component: () => import('@/pages/pegawai/edit.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/pegawai/profil',
                    name: 'pegawai-profil',
                    component: () => import('@/pages/pegawai/ProfilPegawai.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai'] }
                },
                {
                    path: '/pegawai/register',
                    name: 'pegawai-register',
                    component: () => import('@/pages/pegawai/register.vue'),
                    meta: { requiresGuest: true }
                },

                // ---------- Riwayat Pegawai (untuk pegawai sendiri) ----------
                {
                    path: '/pegawai/riwayat-pendidikan',
                    name: 'pegawai-riwayat-pendidikan',
                    component: () => import('@/pages/pegawai/RiwayatPendidikan.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai', 'super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/pegawai/riwayat-diklat',
                    name: 'pegawai-riwayat-diklat',
                    component: () => import('@/pages/pegawai/RiwayatDiklat.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai', 'super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/pegawai/mutasi',
                    name: 'pegawai-mutasi',
                    component: () => import('@/pages/pegawai/MutasiPegawai.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai', 'super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/pegawai/kinerja',
                    name: 'pegawai-kinerja',
                    component: () => import('@/pages/pegawai/KinerjaPegawai.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai'] }
                },
                {
                    path: '/pegawai/kgb',
                    name: 'pegawai-kgb',
                    component: () => import('@/pages/pegawai/KgbPegawai.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai', 'super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/pegawai/pensiun',
                    name: 'pegawai-pensiun',
                    component: () => import('@/pages/pegawai/PensiunPegawai.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai', 'super_admin', 'admin_kepegawaian'] }
                },

                // ---------- Admin: Master Data ----------
                {
                    path: '/admin/positions',
                    name: 'admin-positions',
                    component: () => import('@/pages/admin/positions.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] }
                },
                {
                    path: '/admin/unit-kerja',
                    name: 'admin-unit-kerja',
                    component: () => import('@/pages/admin/unit-kerja.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] }
                },
                {
                    path: '/admin/riwayat-pendidikan',
                    name: 'admin-riwayat-pendidikan',
                    component: () => import('@/pages/admin/riwayat-pendidikan.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/admin/riwayat-diklat',
                    name: 'admin-riwayat-diklat',
                    component: () => import('@/pages/admin/riwayat-diklat.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },

                // ---------- Admin: Administrasi Kepegawaian ----------
                {
                    path: '/admin/mutasi',
                    name: 'admin-mutasi',
                    component: () => import('@/pages/admin/mutasi.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/admin/kgb',
                    name: 'admin-kgb',
                    component: () => import('@/pages/admin/kgb.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/admin/kinerja',
                    name: 'admin-kinerja',
                    component: () => import('@/pages/admin/kinerja.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/admin/pensiun',
                    name: 'admin-pensiun',
                    component: () => import('@/pages/admin/pensiun.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },

                // ---------- Laporan ----------
                {
                    path: '/reports',
                    name: 'reports',
                    component: () => import('@/pages/reports/index.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/reports/mutasi',
                    name: 'reports-mutasi',
                    component: () => import('@/pages/reports/index.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },
                {
                    path: '/reports/kinerja',
                    name: 'reports-kinerja',
                    component: () => import('@/pages/reports/index.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin', 'admin_kepegawaian'] }
                },

                // ---------- Admin: Sistem (Super Admin only) ----------
                {
                    path: '/admin/users',
                    name: 'admin-users',
                    component: () => import('@/pages/admin/users.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] }
                },
                {
                    path: '/admin/settings',
                    name: 'admin-settings',
                    component: () => import('@/pages/admin/settings.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] }
                },
                {
                    path: '/admin/audit',
                    name: 'admin-audit',
                    component: () => import('@/pages/admin/audit.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] }
                }
            ]
        },

        // ==================== ROUTE TAMBAHAN (tanpa layout) ====================
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        // Redirect 404
        {
            path: '/:pathMatch(.*)*',
            redirect: '/pages/notfound'
        }
    ]
});

// Route guard
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Pastikan store sudah diinisialisasi (dipanggil di main.js)
    if (!authStore.isInitialized) {
        await authStore.init();
    }

    if (to.meta.requiresAuth) {
        if (!authStore.isAuthenticated) {
            next({ name: 'login', query: { redirect: to.fullPath } });
            return;
        }

        if (to.meta.roles && to.meta.roles.length > 0) {
            const userRole = authStore.userRole;
            if (!to.meta.roles.includes(userRole)) {
                next({ name: 'accessDenied' });
                return;
            }
        }
    }

    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next({ name: 'dashboard' });
        return;
    }

    next();
});

export default router;