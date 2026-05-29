import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '/',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/pegawai',
                    name: 'pegawai',
                    component: () => import('@/pages/pegawai/index.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'operator'] }
                },
                // Route khusus pegawai
                {
                    path: '/pegawai/dashboard',
                    name: 'pegawai-dashboard',
                    component: () => import('@/pages/pegawai/DashboardPegawai.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai'] }
                },
                {
                    path: '/pegawai/profil',
                    name: 'pegawai-profil',
                    component: () => import('@/pages/pegawai/ProfilPegawai.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai'] }
                },
                {
                    path: '/pegawai/riwayat-pendidikan',
                    name: 'pegawai-riwayat-pendidikan',
                    component: () => import('@/pages/pegawai/RiwayatPendidikan.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai'] }
                },
                {
                    path: '/pegawai/riwayat-diklat',
                    name: 'pegawai-riwayat-diklat',
                    component: () => import('@/pages/pegawai/RiwayatDiklat.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai'] }
                },
                {
                    path: '/pegawai/mutasi',
                    name: 'pegawai-mutasi',
                    component: () => import('@/pages/pegawai/MutasiPegawai.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai'] }
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
                    meta: { requiresAuth: true, roles: ['pegawai'] }
                },
                {
                    path: '/pegawai/pensiun',
                    name: 'pegawai-pensiun',
                    component: () => import('@/pages/pegawai/PensiunPegawai.vue'),
                    meta: { requiresAuth: true, roles: ['pegawai'] }
                },
                {
                    path: '/pegawai/create',
                    name: 'pegawai-create',
                    component: () => import('@/pages/pegawai/create.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'operator'] }
                },
                {
                    path: '/pegawai/:id/edit',
                    name: 'pegawai-edit',
                    component: () => import('@/pages/pegawai/edit.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'operator'] }
                },
                {
                    path: '/pegawai/:id',
                    name: 'pegawai-detail',
                    component: () => import('@/pages/pegawai/detail.vue'),
                    meta: { requiresAuth: true, roles: ['admin', 'operator'] }
                },
                {
                    path: '/reports',
                    name: 'reports',
                    component: () => import('@/pages/reports/index.vue'),
                    meta: { requiresAuth: true }
                },
                {
                    path: '/admin/users',
                    name: 'admin-users',
                    component: () => import('@/pages/admin/users.vue'),
                    meta: { requiresAuth: true, roles: ['superadmin'] }
                },
                {
                    path: '/admin/users/create',
                    name: 'admin-users-create',
                    component: () => import('@/pages/admin/users.vue'),
                    meta: { requiresAuth: true, roles: ['superadmin'] }
                },
                {
                    path: '/admin/users/:id/edit',
                    name: 'admin-users-edit',
                    component: () => import('@/pages/admin/users.vue'),
                    meta: { requiresAuth: true, roles: ['superadmin'] }
                },
                {
                    path: '/admin/settings',
                    name: 'admin-settings',
                    component: () => import('@/pages/admin/settings.vue'),
                    meta: { requiresAuth: true, roles: ['superadmin'] }
                }
            ]
        },
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
        }
    ]
});

// Route guards
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
        if (!authStore.isAuthenticated) {
            // Redirect to login if not authenticated
            next({ name: 'login', query: { redirect: to.fullPath } });
            return;
        }

        // Check role-based access
        if (to.meta.roles && to.meta.roles.length > 0) {
            const userRole = authStore.userRole;
            if (!to.meta.roles.includes(userRole)) {
                // Redirect to access denied if role doesn't match
                next({ name: 'accessDenied' });
                return;
            }
        }
    }

    // Check if route requires guest (not authenticated)
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        // Redirect to dashboard if already authenticated
        next({ name: 'dashboard' });
        return;
    }

    next();
});

export default router;
