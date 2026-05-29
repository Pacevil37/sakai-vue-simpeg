# SIMPEG - Sistem Informasi Manajemen Pegawai

Aplikasi SIMPEG dibangun menggunakan Vue 3 dengan template Admin Dashboard Sekai Vue + PrimeVue.

## Fitur Utama

### 1. Dashboard
- **Statistik Pegawai**: Menampilkan total pegawai, pegawai aktif, pegawai baru bulan ini, dan total laporan
- **Grafik Pegawai Per Bulan**: Chart interaktif menggunakan PrimeVue Chart
- **Statistik Berdasarkan Role**: Distribusi pegawai berdasarkan role (admin, operator, pegawai, superadmin)
- **Aktivitas Terbaru**: Timeline aktivitas sistem terbaru

### 2. Data Pegawai
- **Index**: Tabel pegawai dengan pagination, filter, dan aksi CRUD
- **Create**: Form tambah pegawai baru
- **Edit**: Form update data pegawai
- **Detail**: Halaman detail pegawai
- **Upload Foto**: Fitur upload foto profil pegawai

### 3. Laporan
- **Laporan Pegawai**: Download Excel/PDF dengan filter departemen, status, dan rentang tanggal
- **Laporan Kinerja**: Download Excel/PDF evaluasi kinerja pegawai
- **Laporan Audit**: Download Excel/PDF audit trail sistem
- **Laporan Mutasi**: Download Excel/PDF mutasi pegawai
- **Statistik Laporan**: Dashboard statistik laporan yang di-generate

### 4. Pengaturan (Super Admin)
- **Manajemen User**: CRUD user dengan role management
- **Konfigurasi Sistem**: Pengaturan umum, keamanan, notifikasi, dan backup

## Struktur Menu

```
├── Dashboard (Semua user yang login)
├── SIMPEG
│   ├── Data Pegawai (Admin & Operator)
│   └── Laporan (Semua user yang login)
└── Pengaturan (Super Admin)
    ├── Manajemen User
    └── Konfigurasi Sistem
```

## Role & Permission

### Super Admin
- Akses penuh ke semua fitur
- Manajemen user dan konfigurasi sistem
- Akses ke menu Pengaturan

### Admin
- Akses ke Dashboard dan Laporan
- CRUD Data Pegawai
- Tidak bisa akses menu Pengaturan

### Operator
- Akses ke Dashboard dan Laporan
- CRUD Data Pegawai (terbatas)
- Tidak bisa akses menu Pengaturan

### Pegawai
- Akses ke Dashboard dan Laporan
- Tidak bisa akses Data Pegawai dan Pengaturan

## Teknologi yang Digunakan

- **Frontend**: Vue 3 + Composition API
- **UI Framework**: PrimeVue
- **Template**: Sekai Vue Admin Dashboard
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Charts**: PrimeVue Chart (Chart.js)
- **Styling**: Tailwind CSS + PrimeVue CSS

## Struktur Project

```
src/
├── components/
│   └── dashboard/
│       ├── PegawaiStatsWidget.vue
│       ├── PegawaiRoleWidget.vue
│       ├── PegawaiChartWidget.vue
│       └── RecentActivitiesWidget.vue
├── pages/
│   ├── auth/
│   │   └── login.vue
│   ├── pegawai/
│   │   ├── index.vue
│   │   ├── create.vue
│   │   ├── edit.vue
│   │   └── detail.vue
│   ├── reports/
│   │   └── index.vue
│   └── admin/
│       ├── users.vue
│       └── settings.vue
├── services/
│   ├── authService.js
│   ├── pegawaiService.js
│   ├── reportService.js
│   └── dashboardService.js
├── stores/
│   └── useAuthStore.js
├── layout/
│   ├── AppLayout.vue
│   ├── AppMenu.vue
│   └── AppTopbar.vue
└── router/
    └── index.js
```

## API Integration

### Dashboard Service
- `getDashboardStats()`: Statistik umum dashboard
- `getPegawaiStatsByRole()`: Statistik pegawai berdasarkan role
- `getPegawaiChartData()`: Data untuk grafik pegawai per bulan
- `getRecentActivities()`: Aktivitas terbaru sistem

### Pegawai Service
- `getPegawai()`: Ambil data pegawai dengan pagination dan filter
- `createPegawai()`: Tambah pegawai baru
- `updatePegawai()`: Update data pegawai
- `deletePegawai()`: Hapus pegawai
- `uploadPhoto()`: Upload foto pegawai

### Report Service
- `generatePegawaiReport()`: Generate laporan pegawai (Excel/PDF)
- `generatePerformanceReport()`: Generate laporan kinerja
- `generateAuditReport()`: Generate laporan audit
- `generateMutationReport()`: Generate laporan mutasi

## Route Guards

### Authentication Guard
- Semua halaman kecuali login memerlukan authentication
- Redirect ke login jika tidak authenticated

### Role-based Guard
- Data Pegawai: Admin & Operator
- Pengaturan: Super Admin
- Dashboard & Laporan: Semua user yang login

## Responsive Design

Semua halaman menggunakan grid system PrimeVue yang responsif:
- **Mobile**: `col-12` (full width)
- **Tablet**: `md:col-6` (half width)
- **Desktop**: `lg:col-4` atau `xl:col-3` (quarter width)

## Toast Notifications

Menggunakan PrimeVue Toast untuk notifikasi:
- **Success**: Operasi berhasil
- **Error**: Operasi gagal
- **Info**: Informasi umum
- **Warning**: Peringatan

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Variables

Buat file `.env` di root project:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=SIMPEG
```

## Backend API Endpoints

Pastikan backend menyediakan endpoint berikut:

### Dashboard
- `GET /api/dashboard/stats`
- `GET /api/dashboard/pegawai-by-role`
- `GET /api/dashboard/pegawai-chart`
- `GET /api/dashboard/recent-activities`

### Pegawai
- `GET /api/pegawai` (dengan pagination & filter)
- `POST /api/pegawai`
- `PUT /api/pegawai/:id`
- `DELETE /api/pegawai/:id`
- `POST /api/pegawai/:id/photo`

### Reports
- `GET /api/reports/pegawai?format=excel|pdf`
- `GET /api/reports/performance?format=excel|pdf`
- `GET /api/reports/audit?format=excel|pdf`
- `GET /api/reports/mutation?format=excel|pdf`

## Development Notes

1. **Menu Cleanup**: Menu bawaan Sekai (UI Components, Pages, Hierarchy, Get Started) sudah dihapus
2. **Custom Widgets**: Dashboard menggunakan widget custom yang terintegrasi dengan backend
3. **Role Management**: Implementasi role-based access control yang ketat
4. **Responsive**: Semua komponen sudah responsif untuk mobile, tablet, dan desktop
5. **Error Handling**: Implementasi error handling yang konsisten dengan toast notifications

## Future Enhancements

1. **Real-time Notifications**: WebSocket untuk notifikasi real-time
2. **Advanced Charts**: Grafik yang lebih detail dan interaktif
3. **Export Features**: Export data dalam berbagai format
4. **Mobile App**: PWA atau mobile app menggunakan framework yang sama
5. **Advanced Search**: Search dengan autocomplete dan filter advanced


