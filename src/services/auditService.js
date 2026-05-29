import api from '@/plugins/axios';

class AuditService {
    // Get all audit logs with filters
    async getAllAuditLogs(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            Object.keys(params).forEach((key) => {
                if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                    queryParams.append(key, params[key]);
                }
            });

            const queryString = queryParams.toString();
            const url = `/audit${queryString ? `?${queryString}` : ''}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            throw error;
        }
    }

    // Get audit log by ID
    async getAuditLogById(id) {
        try {
            const response = await api.get(`/audit/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching audit log:', error);
            throw error;
        }
    }

    // Get audit statistics
    async getAuditStats() {
        try {
            const response = await api.get('/audit/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching audit statistics:', error);
            throw error;
        }
    }

    // Get recent audit logs
    async getRecentLogs(limit = 10) {
        try {
            const response = await api.get(`/audit/recent?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recent audit logs:', error);
            throw error;
        }
    }

    // Delete old audit logs
    async cleanupOldLogs(daysOld = 90) {
        try {
            const response = await api.delete('/audit/cleanup', {
                data: { daysOld }
            });
            return response.data;
        } catch (error) {
            console.error('Error cleaning up audit logs:', error);
            throw error;
        }
    }

    // Get audit actions for filtering
    getAuditActions() {
        return [
            { label: 'Semua Aksi', value: '' },
            { label: 'Login', value: 'LOGIN' },
            { label: 'Logout', value: 'LOGOUT' },
            { label: 'Create User', value: 'CREATE_USER' },
            { label: 'Update User', value: 'UPDATE_USER' },
            { label: 'Delete User', value: 'DELETE_USER' },
            { label: 'Create Role', value: 'CREATE_ROLE' },
            { label: 'Update Role', value: 'UPDATE_ROLE' },
            { label: 'Delete Role', value: 'DELETE_ROLE' },
            { label: 'Create Pegawai', value: 'CREATE_PEGAWAI' },
            { label: 'Update Pegawai', value: 'UPDATE_PEGAWAI' },
            { label: 'Delete Pegawai', value: 'DELETE_PEGAWAI' },
            { label: 'Create Education', value: 'CREATE_EDUCATION' },
            { label: 'Update Education', value: 'UPDATE_EDUCATION' },
            { label: 'Delete Education', value: 'DELETE_EDUCATION' },
            { label: 'Create Training', value: 'CREATE_TRAINING' },
            { label: 'Update Training', value: 'UPDATE_TRAINING' },
            { label: 'Delete Training', value: 'DELETE_TRAINING' },
            { label: 'Create Mutation', value: 'CREATE_MUTATION' },
            { label: 'Update Mutation', value: 'UPDATE_MUTATION' },
            { label: 'Delete Mutation', value: 'DELETE_MUTATION' },
            { label: 'Create Performance', value: 'CREATE_PERFORMANCE' },
            { label: 'Update Performance', value: 'UPDATE_PERFORMANCE' },
            { label: 'Delete Performance', value: 'DELETE_PERFORMANCE' },
            { label: 'Create KGB', value: 'CREATE_KGB' },
            { label: 'Update KGB', value: 'UPDATE_KGB' },
            { label: 'Delete KGB', value: 'DELETE_KGB' },
            { label: 'Create Pension', value: 'CREATE_PENSION' },
            { label: 'Update Pension', value: 'UPDATE_PENSION' },
            { label: 'Delete Pension', value: 'DELETE_PENSION' }
        ];
    }

    // Get table names for filtering
    getTableNames() {
        return [
            { label: 'Semua Tabel', value: '' },
            { label: 'Users', value: 'users' },
            { label: 'Roles', value: 'roles' },
            { label: 'Pegawai', value: 'pegawai' },
            { label: 'Education', value: 'riwayat_pendidikan' },
            { label: 'Training', value: 'riwayat_diklat' },
            { label: 'Mutation', value: 'mutasi' },
            { label: 'Performance', value: 'penilaian_kinerja' },
            { label: 'KGB', value: 'kgb' },
            { label: 'Pension', value: 'pensiun' },
            { label: 'Audit Logs', value: 'audit_logs' }
        ];
    }

    // Format audit log for display
    formatAuditLog(auditLog) {
        if (!auditLog) return {};
        const actionLabels = {
            LOGIN: 'Login Sistem',
            LOGOUT: 'Logout Sistem',
            CREATE_USER: 'Buat User',
            UPDATE_USER: 'Update User',
            DELETE_USER: 'Hapus User',
            CREATE_ROLE: 'Buat Role',
            UPDATE_ROLE: 'Update Role',
            DELETE_ROLE: 'Hapus Role',
            CREATE_PEGAWAI: 'Buat Pegawai',
            UPDATE_PEGAWAI: 'Update Pegawai',
            DELETE_PEGAWAI: 'Hapus Pegawai',
            CREATE_EDUCATION: 'Buat Pendidikan',
            UPDATE_EDUCATION: 'Update Pendidikan',
            DELETE_EDUCATION: 'Hapus Pendidikan',
            CREATE_TRAINING: 'Buat Diklat',
            UPDATE_TRAINING: 'Update Diklat',
            DELETE_TRAINING: 'Hapus Diklat',
            CREATE_MUTATION: 'Buat Mutasi',
            UPDATE_MUTATION: 'Update Mutasi',
            DELETE_MUTATION: 'Hapus Mutasi',
            CREATE_PERFORMANCE: 'Buat Penilaian',
            UPDATE_PERFORMANCE: 'Update Penilaian',
            DELETE_PERFORMANCE: 'Hapus Penilaian',
            CREATE_KGB: 'Buat KGB',
            UPDATE_KGB: 'Update KGB',
            DELETE_KGB: 'Hapus KGB',
            CREATE_PENSION: 'Buat Pensiun',
            UPDATE_PENSION: 'Update Pensiun',
            DELETE_PENSION: 'Hapus Pensiun'
        };

        let oldParsed = null;
        let newParsed = null;
        try {
            if (auditLog.old_values && typeof auditLog.old_values === 'string') oldParsed = JSON.parse(auditLog.old_values);
            else if (auditLog.old_values && typeof auditLog.old_values === 'object') oldParsed = auditLog.old_values;
        } catch (_) {}
        try {
            if (auditLog.new_values && typeof auditLog.new_values === 'string') newParsed = JSON.parse(auditLog.new_values);
            else if (auditLog.new_values && typeof auditLog.new_values === 'object') newParsed = auditLog.new_values;
        } catch (_) {}
        return {
            ...auditLog,
            action_label: actionLabels[auditLog.action] || auditLog.action,
            formatted_date: auditLog.created_at ? new Date(auditLog.created_at).toLocaleString('id-ID') : '-',
            old_values_parsed: oldParsed,
            new_values_parsed: newParsed
        };
    }

    // Get audit log summary
    getAuditSummary(auditLogs) {
        const summary = {
            total: auditLogs.length,
            by_action: {},
            by_user: {},
            by_table: {},
            recent_activity: auditLogs.slice(0, 5)
        };

        auditLogs.forEach((log) => {
            // Count by action
            summary.by_action[log.action] = (summary.by_action[log.action] || 0) + 1;

            // Count by user
            if (log.user_id) {
                summary.by_user[log.user_id] = (summary.by_user[log.user_id] || 0) + 1;
            }

            // Count by table
            summary.by_table[log.table_name] = (summary.by_table[log.table_name] || 0) + 1;
        });

        return summary;
    }
}

export default new AuditService();
