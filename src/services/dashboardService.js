// src/services/dashboardService.js
import { supabase } from '@/lib/supabase';

class DashboardService {
    async getStats() {
        try {
            const { count: total_pegawai } = await supabase
                .from('pegawai')
                .select('*', { count: 'exact', head: true });
            const { count: cuti_pending } = await supabase
                .from('cuti')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            const { count: cuti_setuju } = await supabase
                .from('cuti')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'disetujui');
            return {
                total_pegawai: total_pegawai || 0,
                cuti_pending: cuti_pending || 0,
                cuti_setuju: cuti_setuju || 0
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }

    async getPegawaiByUnit() {
        try {
            const { data, error } = await supabase
                .from('pegawai')
                .select('unit_kerja')
                .not('unit_kerja', 'is', null);
            if (error) throw error;
            const counts = {};
            data.forEach(peg => {
                const unit = peg.unit_kerja;
                counts[unit] = (counts[unit] || 0) + 1;
            });
            return Object.entries(counts).map(([unit, count]) => ({ unit, count }));
        } catch (error) {
            console.error('Error getting pegawai by unit:', error);
            throw error;
        }
    }

    async getPegawaiByJabatan() {
        try {
            const { data, error } = await supabase
                .from('pegawai')
                .select('jabatan')
                .not('jabatan', 'is', null);
            if (error) throw error;
            const counts = {};
            data.forEach(peg => {
                const jabatan = peg.jabatan;
                counts[jabatan] = (counts[jabatan] || 0) + 1;
            });
            return Object.entries(counts).map(([jabatan, count]) => ({ jabatan, count }));
        } catch (error) {
            console.error('Error getting pegawai by jabatan:', error);
            throw error;
        }
    }

    async getPegawaiChart() {
        try {
            const { data, error } = await supabase
                .from('pegawai')
                .select('golongan');
            if (error) throw error;
            const counts = {};
            data.forEach(peg => {
                const gol = peg.golongan;
                if (gol) counts[gol] = (counts[gol] || 0) + 1;
            });
            const labels = Object.keys(counts).sort();
            const values = labels.map(label => counts[label]);
            return {
                labels,
                datasets: [{ data: values }]
            };
        } catch (error) {
            console.error('Error getting pegawai chart:', error);
            throw error;
        }
    }

    async getRecentActivities() {
        try {
            const { data, error } = await supabase
                .from('cuti')
                .select('created_at, jenis_cuti, status, pegawai(nama)')
                .order('created_at', { ascending: false })
                .limit(10);
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting recent activities:', error);
            throw error;
        }
    }

    // Other methods can be implemented similarly...
}

export default new DashboardService();