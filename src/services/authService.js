import api from '@/plugins/axios';

class AuthService {
    // Login user
    async login(credentials) {
        try {
            const response = await api.post('/auth/login', credentials);
            const { token, user } = response.data.data;

            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            return { token, user };
        } catch (error) {
            throw error;
        }
    }

    // Register user
    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Logout user
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Even if logout fails on server, clear local storage
            console.error('Logout error:', error);
        } finally {
            // Always clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    // Refresh token
    async refreshToken() {
        try {
            const response = await api.post('/auth/refresh');
            const { token } = response.data.data;

            localStorage.setItem('token', token);
            return token;
        } catch (error) {
            // If refresh fails, clear storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
    }

    // Get current user
    async getCurrentUser() {
        try {
            const response = await api.get('/auth/me');
            const user = response.data.data;

            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error) {
            throw error;
        }
    }

    // Verify email
    async verifyEmail(token) {
        try {
            const response = await api.post('/auth/verify-email', { token });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Resend verification email
    async resendVerificationEmail(email) {
        try {
            const response = await api.post('/auth/resend-verification', { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Request password reset
    async requestPasswordReset(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Reset password
    async resetPassword(token, newPassword) {
        try {
            const response = await api.post('/auth/reset-password', {
                token,
                password: newPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await api.post('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token;
    }

    // Get stored token
    getToken() {
        return localStorage.getItem('token');
    }

    // Get stored user
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
}

export default new AuthService();
