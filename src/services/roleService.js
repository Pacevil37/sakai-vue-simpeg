import api from '@/config/api';

class RoleService {
    // Get all roles
    async getAllRoles() {
        try {
            const response = await api.get('/roles');
            return response.data;
        } catch (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }
    }

    // Get role by ID
    async getRoleById(id) {
        try {
            const response = await api.get(`/roles/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching role:', error);
            throw error;
        }
    }

    // Create new role
    async createRole(roleData) {
        try {
            const response = await api.post('/roles', roleData);
            return response.data;
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    }

    // Update role
    async updateRole(id, roleData) {
        try {
            const response = await api.put(`/roles/${id}`, roleData);
            return response.data;
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }

    // Delete role
    async deleteRole(id) {
        try {
            const response = await api.delete(`/roles/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting role:', error);
            throw error;
        }
    }

    // Get role statistics
    async getRoleStats() {
        try {
            const response = await api.get('/roles/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching role statistics:', error);
            throw error;
        }
    }

    // Get available roles for dropdown
    async getRoleOptions() {
        try {
            const response = await this.getAllRoles();
            return response.data.map((role) => ({
                label: role.name,
                value: role.id,
                description: role.description
            }));
        } catch (error) {
            console.error('Error fetching role options:', error);
            throw error;
        }
    }

    // Validate role data
    validateRoleData(roleData) {
        const errors = [];

        if (!roleData.name || roleData.name.trim().length === 0) {
            errors.push('Nama role wajib diisi');
        }

        if (roleData.name && roleData.name.length > 50) {
            errors.push('Nama role maksimal 50 karakter');
        }

        if (!roleData.description || roleData.description.trim().length === 0) {
            errors.push('Deskripsi wajib diisi');
        }

        if (roleData.description && roleData.description.length > 255) {
            errors.push('Deskripsi maksimal 255 karakter');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default new RoleService();
