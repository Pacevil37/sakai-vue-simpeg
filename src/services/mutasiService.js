import api from '@/plugins/axios';

class MutasiService {
    async getMutasi(params = {}) {
        try {
            // Backend mounts mutation routes under /api/v1/mutation/mutasi
            const response = await api.get('/mutation/mutasi', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getMutasiById(id) {
        try {
            const response = await api.get(`/mutation/mutasi/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createMutasi(data) {
        try {
            const response = await api.post('/mutation/mutasi', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateMutasi(id, data) {
        try {
            const response = await api.put(`/mutation/mutasi/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteMutasi(id) {
        try {
            const response = await api.delete(`/mutation/mutasi/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new MutasiService();
