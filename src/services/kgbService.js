import api from '@/plugins/axios';

class KgbService {
    async getKgb(params = {}) {
        try {
            const response = await api.get('/kgb', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getKgbById(id) {
        try {
            const response = await api.get(`/kgb/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createKgb(data) {
        try {
            const response = await api.post('/kgb', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateKgb(id, data) {
        try {
            const response = await api.put(`/kgb/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteKgb(id) {
        try {
            const response = await api.delete(`/kgb/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new KgbService();
