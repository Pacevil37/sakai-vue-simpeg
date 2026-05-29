// src/stores/useAuthStore.js
import { supabase } from '@/lib/supabase';
import router from '@/router';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null);
    const token = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    const session = ref(null);

    // Helper untuk mengambil role user
    const fetchUserRole = async (userId) => {
        try {
            const { data, error: roleError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId)
                .maybeSingle();
            if (roleError) throw roleError;
            return data?.role || 'pegawai';
        } catch (err) {
            console.error('Error fetching user role:', err);
            return 'pegawai';
        }
    };

    // === FUNGSI INIT ===
    const init = async () => {
        isLoading.value = true;
        try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            session.value = currentSession;
            if (currentSession?.user) {
                token.value = currentSession.access_token;
                const role = await fetchUserRole(currentSession.user.id);
                user.value = {
                    id: currentSession.user.id,
                    email: currentSession.user.email,
                    name: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0],
                    role: role,
                };
            } else {
                token.value = null;
                user.value = null;
            }
        } catch (err) {
            console.error('Init auth error:', err);
            error.value = err.message;
        } finally {
            isLoading.value = false;
        }

        // Listener perubahan auth state
        supabase.auth.onAuthStateChange(async (event, newSession) => {
            session.value = newSession;
            if (event === 'SIGNED_IN' && newSession?.user) {
                token.value = newSession.access_token;
                const role = await fetchUserRole(newSession.user.id);
                user.value = {
                    id: newSession.user.id,
                    email: newSession.user.email,
                    name: newSession.user.user_metadata?.full_name || newSession.user.email?.split('@')[0],
                    role: role,
                };
            } else if (event === 'SIGNED_OUT') {
                token.value = null;
                user.value = null;
                session.value = null;
                router.push('/auth/login');
            }
        });
    };

    // === FUNGSI LOGIN (menerima email dan password sebagai dua parameter) ===
    const login = async (email, password) => {
        isLoading.value = true;
        error.value = null;
        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (loginError) throw loginError;

            const role = await fetchUserRole(data.user.id);
            user.value = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
                role: role,
            };
            token.value = data.session.access_token;
            session.value = data.session;

            return { success: true, user: user.value };
        } catch (err) {
            error.value = err.message || 'Login failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    // === FUNGSI LOGOUT ===
    const logout = async () => {
        isLoading.value = true;
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            token.value = null;
            user.value = null;
            session.value = null;
            isLoading.value = false;
            router.push('/auth/login');
        }
    };

    // ==================== GETTERS ====================
    const isAuthenticated = computed(() => !!user.value && !!session.value);
    const userRole = computed(() => user.value?.role || null);

    const isSuperAdmin = computed(() => userRole.value === 'super_admin');
    const isAdmin = computed(() => userRole.value === 'admin_kepegawaian');
    const isOperator = computed(() => userRole.value === 'admin_kepegawaian');
    const isPegawai = computed(() => userRole.value === 'pegawai');
    const isUser = computed(() => false);

    const canManageUsers = computed(() => ['super_admin', 'admin_kepegawaian'].includes(userRole.value));
    const canManageEmployees = computed(() => ['super_admin', 'admin_kepegawaian'].includes(userRole.value));
    const canViewReports = computed(() => ['super_admin', 'admin_kepegawaian'].includes(userRole.value));
    const canManageSystem = computed(() => userRole.value === 'super_admin');
    const canCreatePegawai = computed(() => ['super_admin', 'admin_kepegawaian'].includes(userRole.value));
    const canEditPegawai = computed(() => ['super_admin', 'admin_kepegawaian'].includes(userRole.value));
    const canDeletePegawai = computed(() => ['super_admin', 'admin_kepegawaian'].includes(userRole.value));
    const canViewAllPegawai = computed(() => ['super_admin', 'admin_kepegawaian'].includes(userRole.value));

    const userName = computed(() => user.value?.name || '');
    const userEmail = computed(() => user.value?.email || '');

    const hasRoleAccess = (roles) => {
        if (!userRole.value || !Array.isArray(roles)) return false;
        return roles.includes(userRole.value);
    };
    const hasPermission = (permission) => {
        if (!user.value) return false;
        if (user.value.role === 'super_admin' || user.value.role === 'admin_kepegawaian') return true;
        return false;
    };
    const hasRole = (role) => userRole.value === role;
    const hasAnyRole = (roles) => {
        if (!user.value || !Array.isArray(roles)) return false;
        return roles.includes(user.value.role);
    };
    const checkAuth = () => !!session.value;
    const clearError = () => { error.value = null; };
    const refreshToken = async () => {
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
            await logout();
            throw refreshError;
        }
        token.value = data.session.access_token;
        return token.value;
    };
    const fetchUser = async () => {
        isLoading.value = true;
        try {
            const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            const role = await fetchUserRole(currentUser.id);
            user.value = {
                id: currentUser.id,
                email: currentUser.email,
                name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
                role: role,
            };
            return user.value;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            isLoading.value = false;
        }
    };
    const updateUser = (userData) => {
        if (user.value) user.value = { ...user.value, ...userData };
    };

    return {
        user, token, isLoading, error,
        isAuthenticated, userRole, userName, userEmail,
        isAdmin, isOperator, isUser, isSuperAdmin, isPegawai,
        canManageUsers, canManageEmployees, canViewReports, canManageSystem,
        canCreatePegawai, canEditPegawai, canDeletePegawai, canViewAllPegawai,
        hasRoleAccess, hasPermission, hasRole, hasAnyRole, checkAuth, clearError,
        init, login, logout, refreshToken, fetchUser, updateUser
    };
});