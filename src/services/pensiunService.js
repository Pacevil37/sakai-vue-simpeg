import api from '@/plugins/axios';

class PensiunService {
    async getPensiun(params = {}) {
        try {
            const response = await api.get('/pensiun', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getPensiunById(id) {
        try {
            const response = await api.get(`/pensiun/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createPensiun(data) {
        try {
            const response = await api.post('/pensiun', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updatePensiun(id, data) {
        try {
            const response = await api.put(`/pensiun/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deletePensiun(id) {
        try {
            const response = await api.delete(`/pensiun/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new PensiunService();
