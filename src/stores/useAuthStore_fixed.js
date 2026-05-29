import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/services/authService';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null);
    const token = ref(null);
    const isLoading = ref(false);
    const error = ref(null);

    // Initialize from localStorage
    const initializeAuth = () => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            token.value = storedToken;
            user.value = JSON.parse(storedUser);
        }
    };

    // Initialize on store creation
    initializeAuth();

    // Getters
    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const userRole = computed(() => user.value?.role || null);
    const userName = computed(() => user.value?.name || '');
    const userEmail = computed(() => user.value?.email || '');
    const isAdmin = computed(() => user.value?.role === 'admin');
    const isOperator = computed(() => user.value?.role === 'operator');
    const isUser = computed(() => user.value?.role === 'user');
    const isSuperAdmin = computed(() => user.value?.role === 'superadmin');

    // Admin level roles (admin and superadmin)
    const isAdminLevel = computed(() => user.value?.role === 'admin' || user.value?.role === 'superadmin');

    // Management level roles (operator, admin, superadmin)
    const isManagementLevel = computed(() => ['operator', 'admin', 'superadmin'].includes(user.value?.role));

    // Actions
    const login = async (credentials) => {
        try {
            isLoading.value = true;
            error.value = null;

            const { token: newToken, user: userData } = await authService.login(credentials);

            token.value = newToken;
            user.value = userData;

            // Store in localStorage
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            return { success: true, user: userData };
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Login failed';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const logout = async () => {
        try {
            isLoading.value = true;

            await authService.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            // Always clear state and localStorage
            token.value = null;
            user.value = null;
            error.value = null;

            localStorage.removeItem('token');
            localStorage.removeItem('user');

            isLoading.value = false;

            // Redirect to login
            router.push('/auth/login');
        }
    };

    const refreshToken = async () => {
        try {
            const newToken = await authService.refreshToken();
            token.value = newToken;
            localStorage.setItem('token', newToken);
            return newToken;
        } catch (err) {
            // If refresh fails, logout user
            await logout();
            throw err;
        }
    };

    const fetchUser = async () => {
        try {
            isLoading.value = true;

            const userData = await authService.getCurrentUser();
            user.value = userData;

            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (err) {
            error.value = err.response?.data?.message || err.message || 'Failed to fetch user';
            throw err;
        } finally {
            isLoading.value = false;
        }
    };

    const updateUser = (userData) => {
        user.value = userData;
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const clearError = () => {
        error.value = null;
    };

    const checkAuth = () => {
        return authService.isAuthenticated();
    };

    const hasPermission = (permission) => {
        if (!user.value || !user.value.permissions) return false;
        return user.value.permissions.includes(permission);
    };

    const hasRole = (role) => {
        if (!user.value) return false;
        return user.value.role === role;
    };

    const hasAnyRole = (roles) => {
        if (!user.value || !Array.isArray(roles)) return false;
        return roles.includes(user.value.role);
    };

    return {
        // State
        user,
        token,
        isLoading,
        error,

        // Getters
        isAuthenticated,
        userRole,
        userName,
        userEmail,
        isAdmin,
        isOperator,
        isUser,
        isSuperAdmin,
        isAdminLevel,
        isManagementLevel,

        // Actions
        login,
        logout,
        refreshToken,
        fetchUser,
        updateUser,
        clearError,
        checkAuth,
        hasPermission,
        hasRole,
        hasAnyRole,
        initializeAuth
    };
});
