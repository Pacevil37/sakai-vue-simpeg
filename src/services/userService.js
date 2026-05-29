import api from '@/plugins/axios';

class UserService {
    // Get all users with pagination and filters
    async getUsers(params = {}) {
        try {
            const response = await api.get('/users', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get user by ID
    async getUserById(id) {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Create new user
    async createUser(userData) {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update user
    async updateUser(id, userData) {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Delete user
    async deleteUser(id) {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get user roles
    async getUserRoles() {
        try {
            const response = await api.get('/users/roles');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new UserService();
