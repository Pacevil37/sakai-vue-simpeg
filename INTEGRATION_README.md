# Integrasi Frontend ↔ Backend SIMPEG

Dokumentasi integrasi lengkap frontend Vue 3 (Sakai Vue + PrimeVue) dengan backend Node.js/Express.

## 🚀 Fitur yang Sudah Diintegrasikan

### 1. Authentication System
- ✅ Login dengan email/password
- ✅ Token-based authentication (JWT)
- ✅ Auto token refresh
- ✅ Role-based access control (Admin, Operator, User)
- ✅ Route guards untuk proteksi halaman
- ✅ Logout dengan clear session

### 2. Pegawai Management (CRUD)
- ✅ List pegawai dengan pagination & filtering
- ✅ Tambah pegawai baru
- ✅ Edit data pegawai
- ✅ Hapus pegawai (Admin only)
- ✅ Upload foto profil
- ✅ Search & filter berdasarkan departemen, status, jabatan

### 3. Report System
- ✅ Download laporan Excel & PDF
- ✅ Laporan pegawai dengan filter
- ✅ Laporan kinerja
- ✅ Laporan audit trail
- ✅ Laporan mutasi
- ✅ Statistik dashboard

### 4. UI/UX Features
- ✅ Responsive design dengan Tailwind CSS
- ✅ PrimeVue components (DataTable, Form, Dialog, etc.)
- ✅ Toast notifications untuk feedback
- ✅ Loading states
- ✅ Error handling global
- ✅ Modern admin dashboard layout

## 📁 Struktur File yang Dibuat

```
src/
├── plugins/
│   ├── axios.js          # Axios instance + interceptors
│   └── toast.js          # PrimeVue Toast utility
├── services/
│   ├── authService.js    # Authentication API calls
│   ├── pegawaiService.js # Pegawai CRUD operations
│   └── reportService.js  # Report generation & download
├── stores/
│   └── useAuthStore.js   # Pinia store untuk auth state
├── pages/
│   ├── auth/
│   │   └── login.vue     # Login page
│   ├── pegawai/
│   │   ├── index.vue     # List pegawai
│   │   ├── create.vue    # Form tambah pegawai
│   │   └── edit.vue      # Form edit pegawai
│   └── reports/
│       └── index.vue     # Report dashboard
├── config/
│   └── api.js            # API configuration
└── router/
    └── index.js         # Updated dengan route guards
```

## 🔧 Konfigurasi

### 1. Environment Variables
Buat file `.env` di root project:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=SIMPEG
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Sistem Informasi Manajemen Pegawai
```

### 2. Dependencies
Semua dependencies sudah terinstall:
- `axios` - HTTP client
- `pinia` - State management
- `primevue` - UI components
- `vue-router` - Routing

## 🚦 Route Guards

### Authentication Guards
- Routes dengan `meta: { requiresAuth: true }` memerlukan login
- Routes dengan `meta: { requiresGuest: true }` hanya untuk user belum login

### Role-based Access
- Routes dengan `meta: { roles: ['admin', 'operator'] }` hanya untuk role tertentu
- Admin: full access
- Operator: CRUD pegawai, view reports
- User: view only

## 🔌 API Integration

### Axios Interceptors
- **Request**: Auto attach Bearer token dari localStorage
- **Response**: Handle 401/403 errors, auto redirect ke login
- **Error**: Global error handling dengan Toast notifications

### Services
- **authService**: Login, logout, refresh token, user management
- **pegawaiService**: CRUD operations, search, filter, export
- **reportService**: Generate & download reports (Excel/PDF)

## 📱 Pages Overview

### 1. Login Page (`/auth/login`)
- Form login dengan validasi
- Remember me functionality
- Responsive design dengan gradient background
- Auto redirect jika sudah login

### 2. Pegawai List (`/pegawai`)
- DataTable dengan pagination
- Search & filter options
- Action buttons (view, edit, delete)
- Role-based button visibility

### 3. Pegawai Create (`/pegawai/create`)
- Multi-step form dengan validasi
- File upload untuk foto
- Auto-save draft (optional)

### 4. Pegawai Edit (`/pegawai/:id/edit`)
- Pre-populated form dengan existing data
- Photo preview & update
- Validation & error handling

### 5. Reports (`/reports`)
- Dashboard dengan statistics
- Multiple report types
- Filter options per report
- Download buttons (Excel/PDF)

## 🎨 UI Components Used

### PrimeVue Components
- `DataTable` - untuk list data dengan pagination
- `Dialog` - untuk confirmation dialogs
- `Toast` - untuk notifications
- `Dropdown` - untuk select options
- `Calendar` - untuk date picker
- `FileUpload` - untuk upload file
- `Avatar` - untuk foto profil
- `Tag` - untuk status badges
- `Button` - untuk actions
- `InputText`, `Textarea`, `Password` - untuk form inputs

### Layout
- Responsive grid system
- Card-based layout
- Modern color scheme
- Consistent spacing & typography

## 🔒 Security Features

### Frontend Security
- Route guards untuk proteksi halaman
- Role-based access control
- Token storage di localStorage
- Auto logout pada token expired
- Input validation & sanitization

### API Security
- JWT token authentication
- Request/response interceptors
- Error handling untuk unauthorized access
- CORS configuration

## 🚀 Cara Menjalankan

### 1. Install Dependencies
```bash
cd sakai-vue
npm install
```

### 2. Setup Environment
Buat file `.env` dengan konfigurasi API URL backend.

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

## 📋 Testing Checklist

### Authentication
- [ ] Login dengan valid credentials
- [ ] Login dengan invalid credentials
- [ ] Auto redirect setelah login
- [ ] Logout functionality
- [ ] Token refresh
- [ ] Route protection

### Pegawai Management
- [ ] List pegawai dengan pagination
- [ ] Search & filter functionality
- [ ] Create pegawai baru
- [ ] Edit existing pegawai
- [ ] Delete pegawai (Admin only)
- [ ] Upload foto profil
- [ ] Form validation

### Reports
- [ ] Generate Excel reports
- [ ] Generate PDF reports
- [ ] Filter options
- [ ] Download functionality
- [ ] Report statistics

### UI/UX
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Toast notifications
- [ ] Form validation feedback

## 🐛 Troubleshooting

### Common Issues

1. **CORS Error**
   - Pastikan backend CORS sudah dikonfigurasi
   - Check API URL di environment variables

2. **Token Expired**
   - Check token refresh logic
   - Verify localStorage token storage

3. **Route Access Denied**
   - Check user role di auth store
   - Verify route meta configuration

4. **File Upload Issues**
   - Check file size limits
   - Verify FormData construction

## 📞 Support

Untuk pertanyaan atau issues:
1. Check console untuk error messages
2. Verify API endpoints di backend
3. Check network requests di browser dev tools
4. Verify environment variables

## 🔄 Next Steps

### Potential Enhancements
- [ ] Real-time notifications
- [ ] Advanced search dengan filters
- [ ] Bulk operations
- [ ] Data export/import
- [ ] Audit trail visualization
- [ ] Performance monitoring
- [ ] Unit tests
- [ ] E2E tests

---

**Integrasi Frontend ↔ Backend SIMPEG sudah selesai dan siap digunakan!** 🎉
