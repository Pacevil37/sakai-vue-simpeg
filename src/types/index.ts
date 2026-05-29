// Frontend TypeScript interfaces for SIMPEG Kemenag API
export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  pegawai_id: number | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  role_name?: string;
  pegawai_nip?: string;
  pegawai_nama?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Pegawai {
  id: number;
  nip: string;
  nama_lengkap: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null; // Date in ISO format
  jenis_kelamin: 'L' | 'P' | null;
  agama: string | null;
  status_perkawinan: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati' | null;
  pangkat_golongan: string | null;
  jabatan: string | null;
  unit_kerja: string | null;
  pendidikan_terakhir: string | null;
  nomor_sk_cpns: string | null;
  tanggal_sk_cpns: string | null; // Date in ISO format
  nomor_sk_pns: string | null;
  tanggal_sk_pns: string | null; // Date in ISO format
  created_at: string;
  updated_at: string;
}

export interface RiwayatPendidikan {
  id: number;
  pegawai_id: number;
  jenjang: string | null;
  institusi: string | null;
  tahun_lulus: number | null;
  ijazah_file: string | null;
  created_at: string;
  updated_at: string;
}

export interface RiwayatDiklat {
  id: number;
  pegawai_id: number;
  nama_diklat: string | null;
  penyelenggara: string | null;
  tahun: number | null;
  sertifikat_file: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mutasi {
  id: number;
  pegawai_id: number;
  dari_unit: string | null;
  ke_unit: string | null;
  tanggal_mutasi: string | null; // Date in ISO format
  surat_sk_file: string | null;
  created_at: string;
  updated_at: string;
}

export interface PenilaianKinerja {
  id: number;
  pegawai_id: number;
  tahun: number;
  nilai: number | null;
  dokumen_file: string | null;
  created_at: string;
  updated_at: string;
}

export interface KenaikanGajiBerkala {
  id: number;
  pegawai_id: number;
  nomor_sk: string | null;
  tanggal_sk: string | null; // Date in ISO format
  gaji_lama: number | null;
  gaji_baru: number | null;
  tmt_kgb: string | null; // Date in ISO format
  created_at: string;
  updated_at: string;
}

export interface Pensiun {
  id: number;
  pegawai_id: number;
  nomor_sk: string | null;
  tanggal_sk: string | null; // Date in ISO format
  tmt_pensiun: string | null; // Date in ISO format
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  table_name: string;
  record_id: number;
  old_values: string | null;
  new_values: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export interface EmailVerificationToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}