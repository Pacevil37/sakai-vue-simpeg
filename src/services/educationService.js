import api from '@/plugins/axios';

class EducationService {
    // Riwayat Pendidikan
    async getRiwayatPendidikan(params = {}) {
        try {
            const response = await api.get('/education/riwayat-pendidikan', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getRiwayatPendidikanById(id) {
        try {
            const response = await api.get(`/education/riwayat-pendidikan/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createRiwayatPendidikan(data) {
        try {
            const response = await api.post('/education/riwayat-pendidikan', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateRiwayatPendidikan(id, data) {
        try {
            const response = await api.put(`/education/riwayat-pendidikan/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteRiwayatPendidikan(id) {
        try {
            const response = await api.delete(`/education/riwayat-pendidikan/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Riwayat Diklat
    async getRiwayatDiklat(params = {}) {
        try {
            const response = await api.get('/education/riwayat-diklat', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async getRiwayatDiklatById(id) {
        try {
            const response = await api.get(`/education/riwayat-diklat/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async createRiwayatDiklat(data) {
        try {
            const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
            const response = await api.post('/education/riwayat-diklat', data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async updateRiwayatDiklat(id, data) {
        try {
            const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
            const response = await api.put(`/education/riwayat-diklat/${id}`, data, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async deleteRiwayatDiklat(id) {
        try {
            const response = await api.delete(`/education/riwayat-diklat/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new EducationService();
