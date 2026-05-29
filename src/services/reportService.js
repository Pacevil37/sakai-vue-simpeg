import api from '@/plugins/axios';

class ReportService {
    // Map report type to backend endpoint path
    getEndpointPath(reportType) {
        switch (reportType) {
            case 'pegawai':
                return '/report/laporan/pegawai';
            case 'performance':
                return '/report/laporan/kinerja';
            case 'mutation':
                return '/report/laporan/mutasi';
            case 'pendidikan':
                return '/report/laporan/pendidikan';
            case 'diklat':
                return '/report/laporan/diklat';
            default:
                return `/report/laporan/${reportType}`;
        }
    }
    // Download Excel report
    async downloadExcelReport(reportType, filters = {}) {
        try {
            const params = {
                format: 'excel',
                ...filters
            };
            const endpoint = this.getEndpointPath(reportType);
            const response = await api.get(endpoint, {
                params,
                responseType: 'blob'
            });

            // Create blob and download
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Download PDF report
    async downloadPDFReport(reportType, filters = {}) {
        try {
            const params = {
                format: 'pdf',
                ...filters
            };
            const endpoint = this.getEndpointPath(reportType);
            const response = await api.get(endpoint, {
                params,
                responseType: 'blob'
            });

            // Create blob and download
            const blob = new Blob([response.data], {
                type: 'application/pdf'
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Download Word report (client-generated)
    async downloadWordReport(reportType, filters = {}) {
        try {
            const data = await this.getReportData(reportType, filters);
            const rows = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            const headers = rows.length ? Object.keys(rows[0]) : ['Data'];

            const headerHtml = headers
                .map((header) => `<th>${this._formatHeader(header)}</th>`)
                .join('');

            const bodyHtml = rows.length
                ? rows
                      .map(
                          (row) =>
                              `<tr>${headers
                                  .map((header) => `<td>${row[header] ?? ''}</td>`)
                                  .join('')}</tr>`
                      )
                      .join('')
                : '<tr><td>Tidak ada data</td></tr>';

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8" />
                        <style>
                            body { font-family: Arial, sans-serif; font-size: 12px; }
                            table { width: 100%; border-collapse: collapse; }
                            th, td { border: 1px solid #cccccc; padding: 6px; text-align: left; }
                            th { background: #f5f5f5; }
                        </style>
                    </head>
                    <body>
                        <h2>Laporan ${this._formatHeader(reportType)}</h2>
                        <table>
                            <thead><tr>${headerHtml}</tr></thead>
                            <tbody>${bodyHtml}</tbody>
                        </table>
                    </body>
                </html>
            `;

            const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Open PDF in new tab and trigger browser print
    async printPDFReport(reportType, filters = {}) {
        try {
            const params = { format: 'pdf', ...filters };
            const endpoint = this.getEndpointPath(reportType);
            const response = await api.get(endpoint, { params, responseType: 'blob' });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const printWindow = window.open(url);
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.focus();
                    printWindow.print();
                };
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get report data (without download)
    async getReportData(reportType, filters = {}) {
        try {
            const params = {
                format: 'json',
                ...filters
            };
            const endpoint = this.getEndpointPath(reportType);
            const response = await api.get(endpoint, { params });
            // Normalize: if backend returns { success, data }, unwrap data
            return response.data?.data ?? response.data;
        } catch (error) {
            throw error;
        }
    }

    // Generate pegawai report
    async generatePegawaiReport(format = 'excel', filters = {}) {
        try {
            if (format === 'excel') {
                return await this.downloadExcelReport('pegawai', filters);
            } else if (format === 'pdf') {
                return await this.downloadPDFReport('pegawai', filters);
            } else {
                return await this.getReportData('pegawai', filters);
            }
        } catch (error) {
            throw error;
        }
    }

    // Generate performance report
    async generatePerformanceReport(format = 'excel', filters = {}) {
        try {
            if (format === 'excel') {
                return await this.downloadExcelReport('performance', filters);
            } else if (format === 'pdf') {
                return await this.downloadPDFReport('performance', filters);
            } else {
                return await this.getReportData('performance', filters);
            }
        } catch (error) {
            throw error;
        }
    }

    // Generate audit report
    async generateAuditReport(format = 'excel', filters = {}) {
        try {
            if (format === 'excel') {
                return await this.downloadExcelReport('audit', filters);
            } else if (format === 'pdf') {
                return await this.downloadPDFReport('audit', filters);
            } else {
                return await this.getReportData('audit', filters);
            }
        } catch (error) {
            throw error;
        }
    }

    // Generate mutation report
    async generateMutationReport(format = 'excel', filters = {}) {
        try {
            if (format === 'excel') {
                return await this.downloadExcelReport('mutation', filters);
            } else if (format === 'pdf') {
                return await this.downloadPDFReport('mutation', filters);
            } else {
                return await this.getReportData('mutation', filters);
            }
        } catch (error) {
            throw error;
        }
    }

    // Convenience wrappers for print actions
    async printPegawaiReport(filters = {}) {
        return this.printPDFReport('pegawai', filters);
    }

    async printPerformanceReport(filters = {}) {
        return this.printPDFReport('performance', filters);
    }

    async printMutationReport(filters = {}) {
        return this.printPDFReport('mutation', filters);
    }

    // Generate pension report
    async generatePensionReport(format = 'excel', filters = {}) {
        try {
            if (format === 'excel') {
                return await this.downloadExcelReport('pension', filters);
            } else if (format === 'pdf') {
                return await this.downloadPDFReport('pension', filters);
            } else {
                return await this.getReportData('pension', filters);
            }
        } catch (error) {
            throw error;
        }
    }

    // Get available report types
    async getReportTypes() {
        try {
            const response = await api.get('/report/types');
            return response.data?.data ?? response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get report statistics
    async getReportStats() {
        try {
            const response = await api.get('/dashboard/stats');
            return response.data?.data ?? response.data;
        } catch (error) {
            throw error;
        }
    }

    // Schedule report generation
    async scheduleReport(reportType, schedule, filters = {}, format = 'excel') {
        try {
            const data = {
                reportType,
                schedule,
                filters,
                format
            };
            const response = await api.post('/report/schedule', data);
            return response.data?.data ?? response.data;
        } catch (error) {
            throw error;
        }
    }

    // Get scheduled reports
    async getScheduledReports(params = {}) {
        try {
            const response = await api.get('/report/scheduled', { params });
            // normalize: prefer object with { data, total }
            const payload = response.data;
            if (payload && typeof payload === 'object' && 'data' in payload) {
                return payload;
            }
            return { data: payload?.data ?? payload, total: Array.isArray(payload) ? payload.length : (payload?.total ?? 0) };
        } catch (error) {
            throw error;
        }
    }

    // Cancel scheduled report
    async cancelScheduledReport(scheduleId) {
        try {
            const response = await api.delete(`/report/schedule/${scheduleId}`);
            return response.data?.data ?? response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update scheduled report
    async updateScheduledReport(scheduleId, updates = {}) {
        try {
            const response = await api.put(`/report/schedule/${scheduleId}`, updates);
            return response.data?.data ?? response.data;
        } catch (error) {
            throw error;
        }
    }

    // Local saved presets CRUD (frontend-only storage)
    _getPresetKey(type) {
        return `simpeg_saved_reports_${type}`;
    }

    listSavedPresets(type) {
        const key = this._getPresetKey(type);
        try {
            const raw = localStorage.getItem(key);
            const list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch {
            return [];
        }
    }

    createSavedPreset(type, preset) {
        const key = this._getPresetKey(type);
        const list = this.listSavedPresets(type);
        const id = Date.now();
        const record = { id, type, ...preset };
        localStorage.setItem(key, JSON.stringify([record, ...list]));
        return record;
    }

    updateSavedPreset(type, id, updates) {
        const key = this._getPresetKey(type);
        const list = this.listSavedPresets(type);
        const updated = list.map((item) => (item.id === id ? { ...item, ...updates } : item));
        localStorage.setItem(key, JSON.stringify(updated));
        return updated.find((i) => i.id === id);
    }

    deleteSavedPreset(type, id) {
        const key = this._getPresetKey(type);
        const list = this.listSavedPresets(type);
        const filtered = list.filter((item) => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filtered));
        return true;
    }

    _formatHeader(value) {
        if (!value) return '';
        return String(value)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    // ========== CRUD Operations for Reports ==========
    
    // Get all reports with pagination and filters
    async getReports(params = {}) {
        try {
            const response = await api.get('/report/scheduled', { params });
            const payload = response.data;
            // Normalize response structure
            if (payload && typeof payload === 'object' && 'data' in payload) {
                return {
                    data: payload.data || [],
                    total: payload.total || 0,
                    page: payload.page || 1,
                    limit: payload.limit || 10
                };
            }
            return {
                data: Array.isArray(payload) ? payload : [],
                total: Array.isArray(payload) ? payload.length : 0,
                page: params.page || 1,
                limit: params.limit || 10
            };
        } catch (error) {
            throw error;
        }
    }

    // Get report by ID
    async getReportById(id) {
        try {
            const response = await api.get(`/report/scheduled`, {
                params: { id }
            });
            const payload = response.data;
            if (payload && typeof payload === 'object' && 'data' in payload) {
                const reports = Array.isArray(payload.data) ? payload.data : [];
                return reports.find(r => r.id === Number(id)) || null;
            }
            const reports = Array.isArray(payload) ? payload : [];
            return reports.find(r => r.id === Number(id)) || null;
        } catch (error) {
            throw error;
        }
    }

    // Create new report
    async createReport(reportData) {
        try {
            const response = await api.post('/report/schedule', reportData);
            return response.data?.data ?? response.data;
        } catch (error) {
            throw error;
        }
    }

    // Update report
    async updateReport(id, reportData) {
        try {
            const response = await api.put(`/report/schedule/${id}`, reportData);
            return response.data?.data ?? response.data;
        } catch (error) {
            throw error;
        }
    }

    // Delete report
    async deleteReport(id) {
        try {
            const response = await api.delete(`/report/schedule/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new ReportService();
