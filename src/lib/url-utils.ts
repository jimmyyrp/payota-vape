/**
 * Parser ?img=N (berbasis 1) -> indeks (berbasis 0) untuk memilih slide galeri.
 * Mengembalikan 0 untuk nilai tidak valid. Sumber tunggal dipakai di server
 * (metadata) dan client (dialog galeri, halaman detail SSR) agar seragam.
 */
export function parseImgIndex(
  raw: string | string[] | undefined | null
): number {
  const value = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (value == null) return 0;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n - 1 : 0;
}