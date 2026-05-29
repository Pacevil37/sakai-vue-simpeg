import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios instance
const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
};

vi.mock('@/plugins/axios', () => ({
    default: mockApi
}));

import reportService from '@/services/reportService';

describe('reportService - CRUD Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getReports', () => {
        it('fetches reports with pagination and filters', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: [{ id: 1, reportType: 'pegawai' }],
                    total: 1,
                    page: 1,
                    limit: 10
                }
            };

            mockApi.get.mockResolvedValueOnce(mockResponse);

            const result = await reportService.getReports({
                page: 1,
                limit: 10,
                search: 'test',
                type: 'pegawai'
            });

            expect(mockApi.get).toHaveBeenCalledWith('/report/scheduled', {
                params: {
                    page: 1,
                    limit: 10,
                    search: 'test',
                    type: 'pegawai'
                }
            });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });

        it('handles array response format', async () => {
            const mockResponse = {
                data: [{ id: 1 }, { id: 2 }]
            };

            mockApi.get.mockResolvedValueOnce(mockResponse);

            const result = await reportService.getReports();

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        it('handles empty response', async () => {
            const mockResponse = {
                data: { data: [], total: 0 }
            };

            mockApi.get.mockResolvedValueOnce(mockResponse);

            const result = await reportService.getReports();

            expect(result.data).toEqual([]);
            expect(result.total).toBe(0);
        });
    });

    describe('getReportById', () => {
        it('fetches a single report by ID', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: [{ id: 1, reportType: 'pegawai' }]
                }
            };

            mockApi.get.mockResolvedValueOnce(mockResponse);

            const result = await reportService.getReportById(1);

            expect(mockApi.get).toHaveBeenCalledWith('/report/scheduled', {
                params: { id: 1 }
            });

            expect(result.id).toBe(1);
            expect(result.reportType).toBe('pegawai');
        });

        it('returns null if report not found', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: []
                }
            };

            mockApi.get.mockResolvedValueOnce(mockResponse);

            const result = await reportService.getReportById(999);

            expect(result).toBeNull();
        });
    });

    describe('createReport', () => {
        it('creates a new report', async () => {
            const reportData = {
                reportType: 'pegawai',
                format: 'excel',
                schedule: { date: '2024-01-20' },
                filters: {},
                description: 'Test report'
            };

            const mockResponse = {
                data: {
                    success: true,
                    data: { id: 1, ...reportData }
                }
            };

            mockApi.post.mockResolvedValueOnce(mockResponse);

            const result = await reportService.createReport(reportData);

            expect(mockApi.post).toHaveBeenCalledWith('/report/schedule', reportData);
            expect(result.id).toBe(1);
            expect(result.reportType).toBe('pegawai');
        });

        it('handles create error', async () => {
            const reportData = {
                reportType: 'pegawai',
                format: 'excel',
                schedule: { date: '2024-01-20' }
            };

            mockApi.post.mockRejectedValueOnce(new Error('Create failed'));

            await expect(reportService.createReport(reportData)).rejects.toThrow();
        });
    });

    describe('updateReport', () => {
        it('updates an existing report', async () => {
            const reportId = 1;
            const updateData = {
                reportType: 'mutation',
                format: 'pdf',
                description: 'Updated description'
            };

            const mockResponse = {
                data: {
                    success: true,
                    data: { id: reportId, ...updateData }
                }
            };

            mockApi.put.mockResolvedValueOnce(mockResponse);

            const result = await reportService.updateReport(reportId, updateData);

            expect(mockApi.put).toHaveBeenCalledWith(`/report/schedule/${reportId}`, updateData);
            expect(result.id).toBe(reportId);
            expect(result.reportType).toBe('mutation');
        });

        it('handles update error', async () => {
            const reportId = 1;
            const updateData = { description: 'Updated' };

            mockApi.put.mockRejectedValueOnce(new Error('Update failed'));

            await expect(reportService.updateReport(reportId, updateData)).rejects.toThrow();
        });
    });

    describe('deleteReport', () => {
        it('deletes a report', async () => {
            const reportId = 1;

            const mockResponse = {
                data: {
                    success: true
                }
            };

            mockApi.delete.mockResolvedValueOnce(mockResponse);

            const result = await reportService.deleteReport(reportId);

            expect(mockApi.delete).toHaveBeenCalledWith(`/report/schedule/${reportId}`);
            expect(result.success).toBe(true);
        });

        it('handles delete error', async () => {
            const reportId = 1;

            mockApi.delete.mockRejectedValueOnce(new Error('Delete failed'));

            await expect(reportService.deleteReport(reportId)).rejects.toThrow();
        });
    });

    describe('getScheduledReports', () => {
        it('normalizes getScheduledReports payload with object response', async () => {
            const mockResponse = {
                data: {
                    data: [{ id: 1 }],
                    total: 1
                }
            };

            mockApi.get.mockResolvedValueOnce(mockResponse);

            const result = await reportService.getScheduledReports({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });

        it('normalizes getScheduledReports payload with array response', async () => {
            const mockResponse = {
                data: [{ id: 1 }, { id: 2 }]
            };

            mockApi.get.mockResolvedValueOnce(mockResponse);

            const result = await reportService.getScheduledReports();

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
        });
    });

    describe('updateScheduledReport', () => {
        it('calls updateScheduledReport via PUT', async () => {
            const mockResponse = {
                data: {
                    data: { id: 1, reportType: 'pegawai' }
                }
            };

            mockApi.put.mockResolvedValueOnce(mockResponse);

            const result = await reportService.updateScheduledReport(1, { reportType: 'pegawai' });

            expect(mockApi.put).toHaveBeenCalledWith('/report/schedule/1', { reportType: 'pegawai' });
            expect(result.id).toBe(1);
        });
    });

    describe('cancelScheduledReport', () => {
        it('cancels a scheduled report', async () => {
            const mockResponse = {
                data: {
                    data: { success: true }
                }
            };

            mockApi.delete.mockResolvedValueOnce(mockResponse);

            const result = await reportService.cancelScheduledReport(1);

            expect(mockApi.delete).toHaveBeenCalledWith('/report/schedule/1');
            expect(result).toBeDefined();
        });
    });

    describe('Report Generation Methods', () => {
        it('generates pegawai report in excel format', async () => {
            const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const mockResponse = {
                data: mockBlob
            };

            mockApi.get.mockResolvedValueOnce(mockResponse);

            await reportService.generatePegawaiReport('excel', { department: 'IT' });

            expect(mockApi.get).toHaveBeenCalledWith(
                '/report/laporan/pegawai',
                expect.objectContaining({
                    params: expect.objectContaining({
                        format: 'excel',
                        department: 'IT'
                    }),
                    responseType: 'blob'
                })
            );
        });

        it('generates performance report in pdf format', async () => {
            const mockBlob = new Blob(['test'], { type: 'application/pdf' });
            const mockResponse = {
                data: mockBlob
            };

            mockApi.get.mockResolvedValueOnce(mockResponse);

            await reportService.generatePerformanceReport('pdf', { period: 'Q1-2024' });

            expect(mockApi.get).toHaveBeenCalledWith(
                '/report/laporan/kinerja',
                expect.objectContaining({
                    params: expect.objectContaining({
                        format: 'pdf',
                        period: 'Q1-2024'
                    }),
                    responseType: 'blob'
                })
            );
        });
    });

    describe('Preset Management', () => {
        beforeEach(() => {
            // Clear localStorage before each test
            localStorage.clear();
        });

        it('creates a saved preset', () => {
            const preset = {
                name: 'Test Preset',
                filters: { department: 'IT' }
            };

            const result = reportService.createSavedPreset('pegawai', preset);

            expect(result.id).toBeDefined();
            expect(result.type).toBe('pegawai');
            expect(result.name).toBe('Test Preset');
        });

        it('lists saved presets', () => {
            const preset = {
                name: 'Test Preset',
                filters: { department: 'IT' }
            };

            reportService.createSavedPreset('pegawai', preset);
            const presets = reportService.listSavedPresets('pegawai');

            expect(presets).toHaveLength(1);
            expect(presets[0].name).toBe('Test Preset');
        });

        it('updates a saved preset', () => {
            const preset = {
                name: 'Test Preset',
                filters: { department: 'IT' }
            };

            const created = reportService.createSavedPreset('pegawai', preset);
            const updated = reportService.updateSavedPreset('pegawai', created.id, { name: 'Updated Preset' });

            expect(updated.name).toBe('Updated Preset');
        });

        it('deletes a saved preset', () => {
            const preset = {
                name: 'Test Preset',
                filters: { department: 'IT' }
            };

            const created = reportService.createSavedPreset('pegawai', preset);
            reportService.deleteSavedPreset('pegawai', created.id);

            const presets = reportService.listSavedPresets('pegawai');
            expect(presets).toHaveLength(0);
        });
    });
});