import api from '@/plugins/axios';

class RiwayatPendidikanService {
    async getRiwayatPendidikan(params = {}) {
        try {
            const response = await api.get('/riwayat-pendidikan', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getRiwayatPendidikanById(id) {
        try {
            const response = await api.get(`/riwayat-pendidikan/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createRiwayatPendidikan(data) {
        try {
            const response = await api.post('/riwayat-pendidikan', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateRiwayatPendidikan(id, data) {
        try {
            const response = await api.put(`/riwayat-pendidikan/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteRiwayatPendidikan(id) {
        try {
            const response = await api.delete(`/riwayat-pendidikan/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new RiwayatPendidikanService();
