// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

// App Configuration
export const APP_CONFIG = {
    NAME: import.meta.env.VITE_APP_NAME || 'SIMPEG',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'Sistem Informasi Manajemen Pegawai'
};
