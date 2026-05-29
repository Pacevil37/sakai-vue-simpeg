# SIMPEG Backend API Requirements

## Status Saat Ini

Frontend aplikasi SIMPEG sudah siap dan berfungsi dengan fallback data demo. Backend API belum tersedia, sehingga aplikasi menggunakan data mock untuk development.

## Endpoint yang Diperlukan

### 1. **Dashboard Endpoints**

```javascript
// GET /api/v1/dashboard/stats
// Response: { totalPegawai, activePegawai, newThisMonth, totalReports }
{
  "success": true,
  "data": {
    "totalPegawai": 150,
    "activePegawai": 145,
    "newThisMonth": 5,
    "totalReports": 25
  }
}

// GET /api/v1/dashboard/pegawai-chart
// Response: Chart data untuk grafik pegawai per bulan
{
  "success": true,
  "data": [
    { "month": "Jan", "count": 10 },
    { "month": "Feb", "count": 15 },
    { "month": "Mar", "count": 12 },
    { "month": "Apr", "count": 18 },
    { "month": "Mei", "count": 20 },
    { "month": "Jun", "count": 25 }
  ]
}

// GET /api/v1/dashboard/recent-activities
// Response: Aktivitas terbaru
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "create",
      "description": "Menambahkan pegawai baru",
      "user": "Admin User",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}

// GET /api/v1/dashboard/pegawai-by-role
// Response: Statistik pegawai per role
{
  "success": true,
  "data": [
    { "role": "superadmin", "count": 2 },
    { "role": "admin", "count": 5 },
    { "role": "operator", "count": 8 },
    { "role": "pegawai", "count": 135 }
  ]
}
```

### 2. **User Management Endpoints**

```javascript
// GET /api/v1/users
// Query params: page, limit, sortBy, sortOrder, search, role, status
// Response: List users dengan pagination
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "email": "superadmin@simpeg.com",
      "role": "superadmin",
      "status": "active",
      "phone": "081234567890",
      "address": "Jakarta",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}

// POST /api/v1/users
// Body: { name, email, phone, role, status, password, address }
// Response: User yang baru dibuat
{
  "success": true,
  "data": {
    "id": 2,
    "name": "New User",
    "email": "newuser@simpeg.com",
    "role": "admin",
    "status": "active",
    "phone": "081234567891",
    "address": "Jakarta",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}

// PUT /api/v1/users/:id
// Body: { name, email, phone, role, status, password?, address }
// Response: User yang diupdate
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Updated User",
    "email": "updated@simpeg.com",
    "role": "admin",
    "status": "active",
    "phone": "081234567891",
    "address": "Jakarta",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}

// DELETE /api/v1/users/:id
// Response: Konfirmasi penghapusan
{
  "success": true,
  "message": "User berhasil dihapus"
}

// GET /api/v1/users/roles
// Response: List roles yang tersedia
{
  "success": true,
  "data": [
    { "value": "superadmin", "label": "Super Admin" },
    { "value": "admin", "label": "Admin" },
    { "value": "operator", "label": "Operator" },
    { "value": "pegawai", "label": "Pegawai" }
  ]
}
```

### 3. **Pegawai Management Endpoints**

```javascript
// GET /api/v1/pegawai
// Query params: page, limit, sortBy, sortOrder, search, department, status, position
// Response: List pegawai dengan pagination
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nip": "123456789",
      "name": "John Doe",
      "email": "john@simpeg.com",
      "position": "manager",
      "department": "IT",
      "status": "active",
      "hireDate": "2024-01-15T10:30:00Z",
      "photo": "https://example.com/photo.jpg"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}

// POST /api/v1/pegawai
// Body: { nip, name, email, position, department, status, hireDate, ... }
// Response: Pegawai yang baru dibuat

// PUT /api/v1/pegawai/:id
// Body: { nip, name, email, position, department, status, hireDate, ... }
// Response: Pegawai yang diupdate

// DELETE /api/v1/pegawai/:id
// Response: Konfirmasi penghapusan
```

### 4. **Reports Endpoints**

```javascript
// GET /api/v1/reports/stats
// Response: Statistik laporan
{
  "success": true,
  "data": {
    "totalPegawai": 150,
    "activePegawai": 145,
    "totalReports": 25,
    "monthlyReports": 5
  }
}

// GET /api/v1/reports/scheduled
// Response: List laporan yang terjadwal
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "pegawai",
      "format": "excel",
      "createdAt": "2024-01-15T10:30:00Z",
      "createdBy": "Admin User"
    }
  ]
}

// POST /api/v1/reports/generate
// Body: { reportType, format, filters }
// Response: Generate laporan
```

### 5. **Authentication Endpoints**

```javascript
// POST /api/v1/auth/login
// Body: { email, password }
// Response: Token dan user data
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "superadmin@simpeg.com",
      "role": "superadmin"
    }
  }
}

// POST /api/v1/auth/logout
// Response: Konfirmasi logout
{
  "success": true,
  "message": "Logout berhasil"
}

// GET /api/v1/auth/me
// Response: Data user saat ini
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Super Admin",
    "email": "superadmin@simpeg.com",
    "role": "superadmin"
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role ENUM('superadmin', 'admin', 'operator', 'pegawai') NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  password VARCHAR(255) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Pegawai Table
```sql
CREATE TABLE pegawai (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nip VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  position VARCHAR(100),
  department VARCHAR(100),
  status ENUM('active', 'inactive', 'leave') DEFAULT 'active',
  hire_date DATE,
  birth_date DATE,
  address TEXT,
  photo VARCHAR(255),
  education VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Implementasi Backend

### 1. **Express.js + MySQL**
```javascript
// app.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'simpeg_db'
});

// Routes
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/pegawai', require('./routes/pegawai'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/auth', require('./routes/auth'));

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

### 2. **Laravel + MySQL**
```php
// routes/api.php
Route::prefix('v1')->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/pegawai-chart', [DashboardController::class, 'pegawaiChart']);
    Route::get('/dashboard/recent-activities', [DashboardController::class, 'recentActivities']);
    Route::get('/dashboard/pegawai-by-role', [DashboardController::class, 'pegawaiByRole']);
    
    Route::apiResource('users', UserController::class);
    Route::apiResource('pegawai', PegawaiController::class);
    Route::apiResource('reports', ReportController::class);
    
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});
```

## Testing

### 1. **Manual Testing**
- Test semua endpoint dengan Postman/Insomnia
- Pastikan response format sesuai dengan yang diharapkan
- Test error handling (404, 500, validation errors)

### 2. **Frontend Integration**
- Setelah backend siap, hapus fallback data di frontend
- Test semua fitur dengan data real dari database
- Pastikan CRUD operations berfungsi dengan baik

## Status Development

- ✅ **Frontend**: Siap dengan fallback data
- ❌ **Backend**: Belum tersedia
- ⏳ **Database**: Perlu dibuat
- ⏳ **API Integration**: Menunggu backend

## Next Steps

1. **Buat database** dengan schema yang diperlukan
2. **Implementasi backend** dengan framework pilihan (Express.js/Laravel)
3. **Buat semua endpoint** sesuai dengan requirements
4. **Test integration** antara frontend dan backend
5. **Hapus fallback data** di frontend setelah backend siap

---

**Catatan**: Frontend sudah siap dan berfungsi dengan data demo. Tinggal implementasi backend sesuai dengan endpoint yang diperlukan.
