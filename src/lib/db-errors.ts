/**
 * Terjemahkan error database (PostgREST/PG) menjadi pesan Indonesia
 * yang bisa dipahami admin. Jika kode tidak dikenal, tampilkan
 * pesan aslinya agar tidak pernah ada "Kegagalan Sistem" misterius.
 */

interface DbErrorLike {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

const CODE_MAP: Record<string, string> = {
  '23505': 'Data duplikat: sudah ada data dengan ID/kunci yang sama.',
  '23503': 'Gagal: data masih dirujuk oleh data lain (relasi).',
  '23502': 'Gagal: ada kolom wajib yang belum terisi.',
  '23514': 'Nilai tidak sesuai aturan validasi tabel.',
  '42501': 'Akses ditolak server (kebijakan keamanan RLS).',
  '42601': 'Kesalahan sintaks pada query sistem.',
  '22P02': 'Format nilai tidak valid (misal angka tidak sah).',
  'PGRST116': 'Data tidak ditemukan atau hasil ganda.',
};

export function friendlyDbError(err: unknown): string {
  const e = (typeof err === 'object' && err !== null ? err : {}) as DbErrorLike;
  const mapped = e.code ? CODE_MAP[e.code] : undefined;
  if (mapped) {
    return e.details || e.message ? `${mapped} (${e.message ?? e.details})` : mapped;
  }
  return e.message || 'Terjadi kesalahan tak terduga pada server.';
}
