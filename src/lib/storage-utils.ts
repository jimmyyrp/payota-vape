/**
 * Vape Store - Storage URL Utilities
 */

const STORAGE_BASE = '/storage/v1/object/public/vape_media/';

/**
 * Ekstrak path object di dalam bucket dari URL publik Supabase Storage.
 * Contoh: https://<ref>.supabase.co/storage/v1/object/public/vape_media/products/abc.webp
 *   -> "products/abc.webp"
 * Mengembalikan null bila URL bukan berasal dari bucket vape_media.
 */
export function getStoragePathFromUrl(url: string): string | null {
  if (!url) return null;
  const marker = STORAGE_BASE;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length);
  return path ? decodeURIComponent(path) : null;
}