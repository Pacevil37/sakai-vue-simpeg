import api from '@/plugins/axios';

class PegawaiService {
    // Get all pegawai with pagination and filters
    async getPegawai(params = {}) {
        try {
            const response = await api.get('/pegawai', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get pegawai by ID
    async getPegawaiById(id) {
        try {
            const response = await api.get(`/pegawai/${id}`);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }

    // Create new pegawai
    async createPegawai(pegawaiData) {
        try {
            const response = await api.post('/pegawai', pegawaiData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update pegawai
    async updatePegawai(id, pegawaiData) {
        try {
            const response = await api.put(`/pegawai/${id}`, pegawaiData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Delete pegawai
    async deletePegawai(id) {
        try {
            const response = await api.delete(`/pegawai/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get pegawai statistics
    async getPegawaiStats() {
        try {
            const response = await api.get('/pegawai/stats');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Master positions
    async getPositions() {
        const response = await api.get('/positions');
        return response.data;
    }

    async createPosition(data) {
        const response = await api.post('/positions', data);
        return response.data;
    }

    async updatePosition(id, data) {
        const response = await api.put(`/positions/${id}`, data);
        return response.data;
    }

    async deletePosition(id) {
        const response = await api.delete(`/positions/${id}`);
        return response.data;
    }

    // Master units
    async getUnits() {
        const response = await api.get('/units');
        return response.data;
    }

    async createUnit(data) {
        const response = await api.post('/units', data);
        return response.data;
    }

    async updateUnit(id, data) {
        const response = await api.put(`/units/${id}`, data);
        return response.data;
    }

    async deleteUnit(id) {
        const response = await api.delete(`/units/${id}`);
        return response.data;
    }


    // Register new pegawai (self-registration)
    async registerPegawai(registrationData) {
        try {
            const response = await api.post('/pegawai/register', registrationData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new PegawaiService();
