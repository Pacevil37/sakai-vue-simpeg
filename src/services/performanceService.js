import api from '@/plugins/axios';

class PerformanceService {
    async getPerformance(params = {}) {
        try {
            const response = await api.get('/performance', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getPerformanceById(id) {
        try {
            const response = await api.get(`/performance/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getPerformanceByPegawaiId(pegawaiId) {
        try {
            const response = await api.get(`/performance/pegawai/${pegawaiId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getPerformanceByTahun(tahun) {
        try {
            const response = await api.get(`/performance/tahun/${tahun}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createPerformance(data) {
        try {
            const response = await api.post('/performance', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updatePerformance(id, data) {
        try {
            const response = await api.put(`/performance/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deletePerformance(id) {
        try {
            const response = await api.delete(`/performance/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new PerformanceService();
