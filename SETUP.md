# Setup Guide - SIMPEG Frontend Integration

Panduan lengkap untuk setup dan menjalankan integrasi frontend SIMPEG.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd sakai-vue
npm install
```

### 2. Setup Environment
```bash
# Copy environment file
npm run setup
# atau manual
cp env.example .env
```

### 3. Configure API URL
Edit file `.env` dan sesuaikan dengan backend:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

## 📋 Prerequisites

### Backend Requirements
- Node.js backend sudah running di `http://localhost:3000`
- API endpoints sudah tersedia:
  - `POST /api/auth/login`
  - `GET /api/pegawai`
  - `POST /api/pegawai`
  - `PUT /api/pegawai/:id`
  - `DELETE /api/pegawai/:id`
  - `GET /api/reports/*`

### Frontend Requirements
- Node.js 16+ 
- npm atau yarn
- Vue 3 dengan Vite
- PrimeVue components
- Pinia untuk state management

## 🔧 Configuration

### Environment Variables
File `.env` berisi konfigurasi:
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=SIMPEG
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Sistem Informasi Manajemen Pegawai
```

### API Configuration
File `src/config/api.js` berisi konfigurasi API:
```javascript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};
```

## 🗂️ File Structure

```
sakai-vue/
├── src/
│   ├── plugins/
│   │   ├── axios.js          # Axios instance + interceptors
│   │   └── toast.js          # PrimeVue Toast utility
│   ├── services/
│   │   ├── authService.js    # Authentication API calls
│   │   ├── pegawaiService.js # Pegawai CRUD operations
│   │   └── reportService.js  # Report generation & download
│   ├── stores/
│   │   └── useAuthStore.js   # Pinia store untuk auth state
│   ├── pages/
│   │   ├── auth/
│   │   │   └── login.vue     # Login page
│   │   ├── pegawai/
│   │   │   ├── index.vue     # List pegawai
│   │   │   ├── create.vue    # Form tambah pegawai
│   │   │   ├── edit.vue      # Form edit pegawai
│   │   │   └── detail.vue    # Detail pegawai
│   │   └── reports/
│   │       └── index.vue     # Report dashboard
│   ├── config/
│   │   └── api.js            # API configuration
│   └── layout/
│       ├── AppMenu.vue       # Updated dengan menu SIMPEG
│       └── AppTopbar.vue     # Updated dengan user info & logout
├── env.example               # Environment variables template
├── .env                      # Environment variables (create from env.example)
└── INTEGRATION_README.md     # Dokumentasi lengkap
```

## 🔐 Authentication Flow

### 1. Login Process
1. User input email/password di `/auth/login`
2. `authService.login()` mengirim request ke backend
3. Backend return JWT token + user data
4. Token disimpan di localStorage
5. User data disimpan di Pinia store
6. Redirect ke dashboard

### 2. Route Protection
- Routes dengan `meta: { requiresAuth: true }` memerlukan login
- Routes dengan `meta: { roles: ['admin', 'operator'] }` memerlukan role tertentu
- Auto redirect ke login jika tidak authenticated
- Auto redirect ke access denied jika role tidak sesuai

### 3. Token Management
- Token disimpan di localStorage
- Auto attach ke request headers via axios interceptor
- Auto refresh token jika expired
- Auto logout jika refresh gagal

## 📱 Pages Overview

### 1. Login Page (`/auth/login`)
- Form login dengan validasi
- Remember me functionality
- Responsive design
- Auto redirect jika sudah login

### 2. Dashboard (`/`)
- Default dashboard dari Sakai Vue
- Bisa di-custom sesuai kebutuhan

### 3. Pegawai List (`/pegawai`)
- DataTable dengan pagination
- Search & filter options
- Action buttons (view, edit, delete)
- Role-based button visibility

### 4. Pegawai Create (`/pegawai/create`)
- Multi-step form dengan validasi
- File upload untuk foto
- Auto-save draft (optional)

### 5. Pegawai Edit (`/pegawai/:id/edit`)
- Pre-populated form dengan existing data
- Photo preview & update
- Validation & error handling

### 6. Pegawai Detail (`/pegawai/:id`)
- Complete profile view
- Performance history
- Mutation history
- Action buttons

### 7. Reports (`/reports`)
- Dashboard dengan statistics
- Multiple report types
- Filter options per report
- Download buttons (Excel/PDF)

## 🎨 UI Components

### PrimeVue Components Used
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

### Layout Components
- `AppLayout` - main layout wrapper
- `AppMenu` - sidebar navigation
- `AppTopbar` - top navigation bar
- `AppSidebar` - sidebar container

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run setup        # Copy env.example to .env
```

### Development Server
- URL: `http://localhost:5173`
- Hot reload enabled
- Vue DevTools compatible
- Source maps enabled

### Build Process
- Vite build system
- Vue 3 SFC compilation
- TypeScript support (if needed)
- CSS preprocessing with Sass
- Asset optimization

## 🐛 Troubleshooting

### Common Issues

1. **CORS Error**
   ```
   Access to XMLHttpRequest at 'http://localhost:3000/api' from origin 'http://localhost:5173' has been blocked by CORS policy
   ```
   **Solution**: Pastikan backend CORS sudah dikonfigurasi untuk allow `http://localhost:5173`

2. **Token Expired**
   ```
   Unauthorized: Token expired
   ```
   **Solution**: Check token refresh logic di `authService.js`

3. **Route Access Denied**
   ```
   Access denied: Insufficient permissions
   ```
   **Solution**: Check user role di auth store dan route meta configuration

4. **File Upload Issues**
   ```
   Failed to upload file
   ```
   **Solution**: Check file size limits dan FormData construction

5. **API Connection Error**
   ```
   Network Error: Unable to connect to API
   ```
   **Solution**: 
   - Pastikan backend server running
   - Check API URL di environment variables
   - Verify network connectivity

### Debug Tips

1. **Check Console**
   - Open browser DevTools
   - Check Console tab untuk error messages
   - Check Network tab untuk API requests

2. **Check Network Requests**
   - Open Network tab di DevTools
   - Monitor API calls
   - Check request/response headers

3. **Check Local Storage**
   - Open Application tab di DevTools
   - Check Local Storage untuk token dan user data

4. **Check Vue DevTools**
   - Install Vue DevTools extension
   - Monitor component state
   - Check Pinia store state

## 📞 Support

### Getting Help
1. Check console untuk error messages
2. Verify API endpoints di backend
3. Check network requests di browser dev tools
4. Verify environment variables
5. Check browser compatibility

### Useful Commands
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check environment variables
echo $VITE_API_URL
```

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
- [ ] PWA support
- [ ] Multi-language support

### Production Deployment
- [ ] Environment-specific builds
- [ ] CDN configuration
- [ ] Security headers
- [ ] Performance optimization
- [ ] Error monitoring
- [ ] Analytics integration

---

**Setup selesai! Aplikasi SIMPEG siap digunakan.** 🎉
