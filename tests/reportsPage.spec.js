import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

// Mock reportService
const mockReports = [
    {
        id: 1,
        reportType: 'pegawai',
        format: 'excel',
        schedule: { date: '2024-01-15T10:00:00Z' },
        createdAt: '2024-01-10T08:00:00Z',
        createdBy: 'Admin',
        description: 'Test report 1'
    },
    {
        id: 2,
        reportType: 'mutation',
        format: 'pdf',
        schedule: { date: '2024-01-20T14:00:00Z' },
        createdAt: '2024-01-12T09:00:00Z',
        createdBy: 'Operator',
        description: 'Test report 2'
    }
];

const mockReportService = {
    getReports: vi.fn().mockResolvedValue({
        data: mockReports,
        total: 2,
        page: 1,
        limit: 10
    }),
    getReportById: vi.fn().mockResolvedValue(mockReports[0]),
    createReport: vi.fn().mockResolvedValue({ id: 3, ...mockReports[0] }),
    updateReport: vi.fn().mockResolvedValue({ id: 1, ...mockReports[0], description: 'Updated' }),
    deleteReport: vi.fn().mockResolvedValue({ success: true }),
            getReportTypes: vi.fn().mockResolvedValue([
                { key: 'pegawai', label: 'Laporan Pegawai' },
                { key: 'mutation', label: 'Laporan Mutasi' }
            ]),
            getScheduledReports: vi.fn().mockResolvedValue({ data: [], total: 0 }),
            scheduleReport: vi.fn().mockResolvedValue({ id: 1 }),
            updateScheduledReport: vi.fn().mockResolvedValue({ id: 1 }),
            cancelScheduledReport: vi.fn().mockResolvedValue(true)
};

vi.mock('@/services/reportService', () => ({
    default: mockReportService
}));

vi.mock('primevue/usetoast', () => ({
    useToast: () => ({
        add: vi.fn()
    })
}));

// Mock PrimeVue components
vi.mock('primevue/button', () => ({
    default: { name: 'Button', template: '<button><slot /></button>' }
}));

vi.mock('primevue/datatable', () => ({
    default: { name: 'DataTable', template: '<div><slot /></div>' }
}));

vi.mock('primevue/column', () => ({
    default: { name: 'Column', template: '<div><slot /></div>' }
}));

vi.mock('primevue/dialog', () => ({
    default: { name: 'Dialog', template: '<div v-if="visible"><slot /></div>' }
}));

vi.mock('primevue/select', () => ({
    default: { name: 'Select', template: '<select><slot /></select>' }
}));

vi.mock('primevue/inputtext', () => ({
    default: { name: 'InputText', template: '<input type="text" />' }
}));

vi.mock('primevue/inputnumber', () => ({
    default: { name: 'InputNumber', template: '<input type="number" />' }
}));

vi.mock('primevue/textarea', () => ({
    default: { name: 'Textarea', template: '<textarea></textarea>' }
}));

vi.mock('primevue/datepicker', () => ({
    default: { name: 'DatePicker', template: '<input type="date" />' }
}));

vi.mock('primevue/calendar', () => ({
    default: { name: 'Calendar', template: '<input type="date" />' }
}));

vi.mock('primevue/tag', () => ({
    default: { name: 'Tag', template: '<span><slot /></span>' }
}));

vi.mock('primevue/message', () => ({
    default: { name: 'Message', template: '<div><slot /></div>' }
}));

vi.mock('primevue/progressspinner', () => ({
    default: { name: 'ProgressSpinner', template: '<div></div>' }
}));

import ReportsPage from '@/pages/reports/index.vue';

describe('Reports Page - CRUD Operations', () => {
    let wrapper;
    let pinia;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
        vi.clearAllMocks();
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.unmount();
        }
    });

    describe('Component Rendering', () => {
        it('renders the reports page with header and buttons', async () => {
            wrapper = mount(ReportsPage, {
                global: {
                    plugins: [pinia],
                    stubs: {
                        Button: true,
                        DataTable: true,
                        Column: true,
                        Dialog: true,
                        Select: true,
                        InputText: true,
                        InputNumber: true,
                        Textarea: true,
                        DatePicker: true,
                        Calendar: true,
                        Tag: true,
                        Message: true,
                        ProgressSpinner: true
                    }
                }
            });

            await wrapper.vm.$nextTick();

            expect(wrapper.html()).toContain('Manajemen Laporan');
            expect(mockReportService.getReports).toHaveBeenCalled();
        });

        it('loads reports data on mount', async () => {
            wrapper = mount(ReportsPage, {
                global: {
                    plugins: [pinia],
                    stubs: {
                        Button: true,
                        DataTable: true,
                        Column: true,
                        Dialog: true,
                        Select: true,
                        InputText: true,
                        InputNumber: true,
                        Textarea: true,
                        DatePicker: true,
                        Calendar: true,
                        Tag: true,
                        Message: true,
                        ProgressSpinner: true
                    }
                }
            });

            await wrapper.vm.$nextTick();
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(mockReportService.getReports).toHaveBeenCalled();
        });
    });

    describe('CRUD Operations', () => {
        beforeEach(() => {
            wrapper = mount(ReportsPage, {
                global: {
                    plugins: [pinia],
                    stubs: {
                        Button: true,
                        DataTable: true,
                        Column: true,
                        Dialog: true,
                        Select: true,
                        InputText: true,
                        InputNumber: true,
                        Textarea: true,
                        DatePicker: true,
                        Calendar: true,
                        Tag: true,
                        Message: true,
                        ProgressSpinner: true
                    }
                }
            });
        });

        it('opens create dialog when create button is clicked', async () => {
            await wrapper.vm.$nextTick();
            expect(wrapper.vm.createDialogVisible).toBe(false);

            wrapper.vm.openCreateDialog();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.createDialogVisible).toBe(true);
            expect(wrapper.vm.formData.reportType).toBeNull();
            expect(wrapper.vm.formData.format).toBe('excel');
        });

        it('opens edit dialog with pre-filled data', async () => {
            await wrapper.vm.$nextTick();
            const report = mockReports[0];

            wrapper.vm.openEditDialog(report);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.editDialogVisible).toBe(true);
            expect(wrapper.vm.editingReport).toEqual(report);
            expect(wrapper.vm.formData.reportType).toBe(report.reportType);
            expect(wrapper.vm.formData.format).toBe(report.format);
        });

        it('creates a new report successfully', async () => {
            await wrapper.vm.$nextTick();
            wrapper.vm.formData = {
                reportType: 'pegawai',
                format: 'excel',
                scheduleDate: new Date('2024-01-20'),
                filters: {},
                description: 'Test description',
                createdBy: 'Admin'
            };

            await wrapper.vm.saveReport();
            await wrapper.vm.$nextTick();

            expect(mockReportService.createReport).toHaveBeenCalled();
            expect(wrapper.vm.createDialogVisible).toBe(false);
        });

        it('updates an existing report successfully', async () => {
            await wrapper.vm.$nextTick();
            wrapper.vm.editingReport = mockReports[0];
            wrapper.vm.formData = {
                reportType: 'pegawai',
                format: 'pdf',
                scheduleDate: new Date('2024-01-20'),
                filters: {},
                description: 'Updated description',
                createdBy: 'Admin'
            };

            await wrapper.vm.saveReport();
            await wrapper.vm.$nextTick();

            expect(mockReportService.updateReport).toHaveBeenCalledWith(1, expect.any(Object));
            expect(wrapper.vm.editDialogVisible).toBe(false);
        });

        it('deletes a report with confirmation', async () => {
            await wrapper.vm.$nextTick();
            const report = mockReports[0];

            wrapper.vm.confirmDelete(report);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.deleteDialogVisible).toBe(true);
            expect(wrapper.vm.selectedReport).toEqual(report);

            await wrapper.vm.deleteReport();
            await wrapper.vm.$nextTick();

            expect(mockReportService.deleteReport).toHaveBeenCalledWith(1);
            expect(wrapper.vm.deleteDialogVisible).toBe(false);
        });
    });

    describe('Filtering and Search', () => {
        beforeEach(() => {
            wrapper = mount(ReportsPage, {
                global: {
                    plugins: [pinia],
                    stubs: {
                        Button: true,
                        DataTable: true,
                        Column: true,
                        Dialog: true,
                        Select: true,
                        InputText: true,
                        InputNumber: true,
                        Textarea: true,
                        DatePicker: true,
                        Calendar: true,
                        Tag: true,
                        Message: true,
                        ProgressSpinner: true
                    }
                }
            });
        });

        it('applies global search filter', async () => {
            await wrapper.vm.$nextTick();
            wrapper.vm.filters.search = 'pegawai';
            wrapper.vm.onSearch();

            await wrapper.vm.$nextTick();

            expect(mockReportService.getReports).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: 'pegawai'
                })
            );
        });

        it('applies report type filter', async () => {
            await wrapper.vm.$nextTick();
            wrapper.vm.filters.reportType = 'pegawai';
            wrapper.vm.onFilterChange();

            await wrapper.vm.$nextTick();

            expect(mockReportService.getReports).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'pegawai'
                })
            );
        });

        it('applies format filter', async () => {
            await wrapper.vm.$nextTick();
            wrapper.vm.filters.format = 'excel';
            wrapper.vm.onFilterChange();

            await wrapper.vm.$nextTick();

            expect(mockReportService.getReports).toHaveBeenCalledWith(
                expect.objectContaining({
                    format: 'excel'
                })
            );
        });

        it('applies date range filter', async () => {
            await wrapper.vm.$nextTick();
            const dateFrom = new Date('2024-01-01');
            const dateTo = new Date('2024-01-31');
            wrapper.vm.filters.dateRange = [dateFrom, dateTo];
            wrapper.vm.onFilterChange();

            await wrapper.vm.$nextTick();

            expect(mockReportService.getReports).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateFrom: expect.any(String),
                    dateTo: expect.any(String)
                })
            );
        });

        it('applies ID range filters', async () => {
            await wrapper.vm.$nextTick();
            wrapper.vm.filters.minId = 1;
            wrapper.vm.filters.maxId = 10;
            wrapper.vm.onFilterChange();

            await wrapper.vm.$nextTick();

            expect(mockReportService.getReports).toHaveBeenCalledWith(
                expect.objectContaining({
                    minId: 1,
                    maxId: 10
                })
            );
        });

        it('clears all filters', async () => {
            await wrapper.vm.$nextTick();
            wrapper.vm.filters = {
                search: 'test',
                reportType: 'pegawai',
                format: 'excel',
                dateRange: [new Date(), new Date()],
                minId: 1,
                maxId: 10
            };

            wrapper.vm.clearFilters();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.filters.search).toBe('');
            expect(wrapper.vm.filters.reportType).toBeNull();
            expect(wrapper.vm.filters.format).toBeNull();
            expect(wrapper.vm.filters.dateRange).toBeNull();
            expect(wrapper.vm.filters.minId).toBeNull();
            expect(wrapper.vm.filters.maxId).toBeNull();
        });
    });

    describe('Pagination and Sorting', () => {
        beforeEach(() => {
            wrapper = mount(ReportsPage, {
                global: {
                    plugins: [pinia],
                    stubs: {
                        Button: true,
                        DataTable: true,
                        Column: true,
                        Dialog: true,
                        Select: true,
                        InputText: true,
                        InputNumber: true,
                        Textarea: true,
                        DatePicker: true,
                        Calendar: true,
                        Tag: true,
                        Message: true,
                        ProgressSpinner: true
                    }
                }
            });
        });

        it('handles page change', async () => {
            await wrapper.vm.$nextTick();
            const event = { page: 1, rows: 25 };

            wrapper.vm.onPageChange(event);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.pagination.page).toBe(2);
            expect(wrapper.vm.pagination.limit).toBe(25);
            expect(mockReportService.getReports).toHaveBeenCalled();
        });

        it('handles sorting', async () => {
            await wrapper.vm.$nextTick();
            const event = { sortField: 'createdAt', sortOrder: 1 };

            wrapper.vm.onSort(event);
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.sortField).toBe('createdAt');
            expect(wrapper.vm.sortOrder).toBe(1);
            expect(mockReportService.getReports).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            wrapper = mount(ReportsPage, {
                global: {
                    plugins: [pinia],
                    stubs: {
                        Button: true,
                        DataTable: true,
                        Column: true,
                        Dialog: true,
                        Select: true,
                        InputText: true,
                        InputNumber: true,
                        Textarea: true,
                        DatePicker: true,
                        Calendar: true,
                        Tag: true,
                        Message: true,
                        ProgressSpinner: true
                    }
                }
            });
        });

        it('handles load reports error gracefully', async () => {
            mockReportService.getReports.mockRejectedValueOnce(new Error('Network error'));

            await wrapper.vm.loadReports();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.reports).toEqual([]);
            expect(wrapper.vm.pagination.total).toBe(0);
        });

        it('handles create report error gracefully', async () => {
            await wrapper.vm.$nextTick();
            mockReportService.createReport.mockRejectedValueOnce(new Error('Create failed'));

            wrapper.vm.formData = {
                reportType: 'pegawai',
                format: 'excel',
                scheduleDate: new Date(),
                filters: {},
                description: 'Test',
                createdBy: 'Admin'
            };

            await wrapper.vm.saveReport();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.createDialogVisible).toBe(true); // Dialog should remain open on error
        });

        it('handles delete report error gracefully', async () => {
            await wrapper.vm.$nextTick();
            mockReportService.deleteReport.mockRejectedValueOnce(new Error('Delete failed'));

            wrapper.vm.selectedReport = mockReports[0];
            await wrapper.vm.deleteReport();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.deleteDialogVisible).toBe(true); // Dialog should remain open on error
        });
    });

    describe('Validation', () => {
        beforeEach(() => {
            wrapper = mount(ReportsPage, {
                global: {
                    plugins: [pinia],
                    stubs: {
                        Button: true,
                        DataTable: true,
                        Column: true,
                        Dialog: true,
                        Select: true,
                        InputText: true,
                        InputNumber: true,
                        Textarea: true,
                        DatePicker: true,
                        Calendar: true,
                        Tag: true,
                        Message: true,
                        ProgressSpinner: true
                    }
                }
  });
});

        it('prevents saving with invalid form data', async () => {
            await wrapper.vm.$nextTick();
            wrapper.vm.formData = {
                reportType: null, // Invalid - required
                format: 'excel',
                scheduleDate: null, // Invalid - required
                filters: {},
                description: '',
                createdBy: 'Admin'
            };

            await wrapper.vm.saveReport();
            await wrapper.vm.$nextTick();

            expect(mockReportService.createReport).not.toHaveBeenCalled();
            expect(mockReportService.updateReport).not.toHaveBeenCalled();
        });
    });
});