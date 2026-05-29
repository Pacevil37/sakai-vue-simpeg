# Dokumentasi Halaman Reports - CRUD Lengkap

## Ringkasan

Halaman `/reports` telah diimplementasikan dengan fitur CRUD (Create, Read, Update, Delete) lengkap beserta sistem filtering yang komprehensif. Halaman ini memungkinkan pengguna untuk mengelola laporan dengan antarmuka yang responsif dan user-friendly.

## Fitur Utama

### 1. CRUD Operations

#### Create (Buat Laporan Baru)
- Form input dengan validasi lengkap
- Field yang tersedia:
  - **Jenis Laporan** (wajib): Pilih dari dropdown (Pegawai, Mutasi, Kinerja, Pendidikan, Diklat, Audit)
  - **Format** (wajib): Excel, PDF, atau JSON
  - **Tanggal & Waktu Jadwal** (wajib): Calendar dengan time picker
  - **Deskripsi** (opsional): Textarea untuk deskripsi laporan
  - **Dibuat Oleh** (opsional): Input text untuk nama pembuat

#### Read (Baca Data)
- Tabel data dengan pagination
- Menampilkan kolom:
  - ID
  - Jenis Laporan (dengan tag berwarna)
  - Format (dengan tag berwarna)
  - Tanggal Jadwal
  - Dibuat Pada
  - Dibuat Oleh
  - Deskripsi
  - Aksi (Edit/Delete)

#### Update (Edit Laporan)
- Form edit dengan data pre-filled
- Validasi yang sama dengan form create
- Update data melalui API

#### Delete (Hapus Laporan)
- Konfirmasi penghapusan dengan dialog
- Menampilkan informasi laporan yang akan dihapus
- Feedback visual setelah penghapusan

### 2. Sistem Filtering Komprehensif

#### Global Search
- Pencarian teks bebas di semua field
- Mencari berdasarkan jenis laporan, format, atau pembuat
- Enter untuk trigger search

#### Filter Berdasarkan Kolom
- **Jenis Laporan**: Dropdown filter
- **Format**: Dropdown filter (Excel, PDF, JSON)
- **Rentang Tanggal**: Date range picker
- **ID Range**: Filter berdasarkan ID minimum dan maksimum

#### Sorting
- Sorting ascending/descending
- Sortable columns: ID, Jenis Laporan, Format, Tanggal Jadwal, Dibuat Pada, Dibuat Oleh
- Indikator visual untuk sort order

#### Pagination
- Pagination dengan opsi rows per page: 10, 25, 50, 100
- Lazy loading untuk performa optimal
- Current page report template

### 3. Antarmuka Pengguna

#### Layout Responsif
- Grid system yang responsif
- Mobile-friendly dengan breakpoints
- Scrollable table pada layar kecil

#### Feedback Visual
- **Loading States**: Progress spinner saat loading data
- **Success Messages**: Toast notification untuk aksi berhasil
- **Error Messages**: Toast notification dengan detail error
- **Empty States**: Pesan informatif saat tidak ada data
- **Validation Feedback**: Error messages pada form fields

#### Error Handling
- Try-catch untuk semua operasi async
- Error messages yang informatif
- Graceful degradation saat API error
- Retry mechanism untuk operasi yang gagal

### 4. Validasi Client-Side

#### Form Validation
- Menggunakan Vuelidate untuk validasi
- Rules yang diterapkan:
  - `reportType`: Required
  - `format`: Required
  - `scheduleDate`: Required
  - `description`: Min length 3 karakter (jika diisi)

#### Visual Feedback
- Field dengan error ditandai dengan class `p-invalid`
- Error messages ditampilkan di bawah field
- Submit button disabled saat validasi gagal

## Struktur File

```
sakai-vue/
├── src/
│   ├── pages/
│   │   └── reports/
│   │       └── index.vue          # Main reports page component
│   ├── services/
│   │   └── reportService.js       # Service untuk API calls
│   └── tests/
│       ├── reportsPage.spec.js     # Unit tests untuk page component
│       └── reportService.spec.js   # Unit tests untuk service
└── REPORTS_CRUD_README.md         # Dokumentasi ini
```

## API Integration

### Endpoints yang Digunakan

1. **GET /report/scheduled** - Get all reports dengan filters
   - Query params: `page`, `limit`, `search`, `type`, `format`, `dateFrom`, `dateTo`, `minId`, `maxId`, `sortBy`, `sortOrder`

2. **GET /report/scheduled?id={id}** - Get report by ID

3. **POST /report/schedule** - Create new report
   - Body: `{ reportType, format, schedule, filters, description, createdBy }`

4. **PUT /report/schedule/:id** - Update report
   - Body: `{ reportType, format, schedule, filters, description, createdBy }`

5. **DELETE /report/schedule/:id** - Delete report

### Service Methods

```javascript
// Get all reports
await reportService.getReports(params)

// Get report by ID
await reportService.getReportById(id)

// Create report
await reportService.createReport(reportData)

// Update report
await reportService.updateReport(id, reportData)

// Delete report
await reportService.deleteReport(id)
```

## Testing

### Unit Tests

#### reportsPage.spec.js
- Component rendering tests
- CRUD operations tests
- Filtering and search tests
- Pagination and sorting tests
- Error handling tests
- Validation tests

#### reportService.spec.js
- Service method tests
- API integration tests
- Error handling tests
- Preset management tests

### Menjalankan Tests

```bash
npm run test
# atau
npm run test:unit
```

## Penggunaan

### Membuat Laporan Baru

1. Klik tombol "Tambah Laporan"
2. Isi form dengan data yang diperlukan
3. Klik "Simpan"
4. Laporan akan muncul di tabel

### Mengedit Laporan

1. Klik tombol edit (ikon pensil) pada baris laporan
2. Ubah data yang diperlukan
3. Klik "Update"
4. Perubahan akan tersimpan

### Menghapus Laporan

1. Klik tombol delete (ikon trash) pada baris laporan
2. Konfirmasi penghapusan di dialog
3. Klik "Hapus"
4. Laporan akan dihapus dari sistem

### Filtering Data

1. Gunakan field "Cari Global" untuk pencarian teks
2. Pilih filter dari dropdown (Jenis, Format)
3. Pilih rentang tanggal jika diperlukan
4. Set ID range untuk filter numerik
5. Klik "Cari" atau filter akan otomatis terapkan saat perubahan

### Sorting

1. Klik header kolom untuk sorting
2. Klik lagi untuk toggle ascending/descending
3. Indikator panah menunjukkan sort order

## Maintenance

### Menambah Field Baru

1. Tambahkan field di `formData` ref
2. Tambahkan input di template (create/edit dialog)
3. Update validation rules jika diperlukan
4. Update API payload structure

### Menambah Filter Baru

1. Tambahkan property di `filters` ref
2. Tambahkan input di filter section
3. Update `loadReports()` untuk include filter baru
4. Update `clearFilters()` untuk reset filter baru

### Menambah Kolom Tabel

1. Tambahkan `<Column>` di DataTable
2. Update sortField options jika perlu sorting
3. Update filter options jika perlu filtering

## Troubleshooting

### Data tidak muncul
- Periksa koneksi API
- Periksa console untuk error messages
- Pastikan filter tidak terlalu ketat
- Cek network tab di browser dev tools

### Form tidak bisa disimpan
- Periksa validasi error messages
- Pastikan semua field wajib sudah diisi
- Periksa console untuk error details
- Pastikan API endpoint tersedia

### Filter tidak bekerja
- Pastikan filter value tidak null/undefined
- Periksa format date range
- Cek API response structure
- Periksa console untuk error

## Dependencies

- Vue 3
- PrimeVue
- Vuelidate (untuk validasi)
- Axios (untuk API calls)
- Pinia (untuk state management)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Catatan Penting

1. **Authentication**: Pastikan user sudah login sebelum mengakses halaman
2. **Permissions**: Beberapa operasi mungkin memerlukan role tertentu
3. **API Base URL**: Dikonfigurasi di `src/config/api.js` atau environment variable
4. **Error Handling**: Semua error ditangani dengan toast notifications
5. **Loading States**: Semua operasi async menampilkan loading indicator

## Changelog

### Version 1.0.0 (Current)
- ✅ Implementasi CRUD lengkap
- ✅ Sistem filtering komprehensif
- ✅ Validasi client-side
- ✅ Error handling robust
- ✅ Unit tests lengkap
- ✅ Dokumentasi

## Kontak & Support

Untuk pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.

