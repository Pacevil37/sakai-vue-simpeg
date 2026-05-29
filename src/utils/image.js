const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const SERVER_BASE = API_URL.replace('/api/v1', '');

export function getPhotoUrl(filename) {
  if (!filename) return '';
  const clean = String(filename).trim();
  if (!clean) return '';
  if (clean.startsWith('http')) return clean;
  const safe = encodeURIComponent(clean);
  // Prefer API-prefixed uploads path to avoid proxies blocking root
  if (API_URL.includes('/api/')) {
    return `${API_URL}/uploads/foto/${safe}`;
  }
  return `${SERVER_BASE}/uploads/foto/${safe}`;
}

export function getPegawaiPhotoUrl(id) {
  if (!id) return '';
  if (API_URL.includes('/api/')) {
    return `${API_URL}/pegawai/${id}/photo`;
  }
  return `${SERVER_BASE}/api/v1/pegawai/${id}/photo`;
}
