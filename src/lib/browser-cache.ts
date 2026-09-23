/**
 * browser-cache.ts - Utilitas bersama untuk membersihkan cache browser
 * (localStorage + sessionStorage + CacheStorage) AMAN.
 *
 * Kebijakan penghapusan (menyamakan halaman Developer & VersionGuard):
 *  - HAPUS: semua localStorage non-whitelist, seluruh sessionStorage, semua
 *    CacheStorage milik origin.
 *  - AMAN (tidak dihapus): sesi login admin/staf & bookmark favorit pengunjung,
 *    serta kunci versi `fee_app_version`.
 */

/** Daftar kunci data PENGGUNA yang TIDAK boleh terhapus. */
export const CACHE_PERSIST_KEYS: ReadonlySet<string> = new Set([
  'fee_admin_auth',
  'fee_user_role',
  'fee_user_name',
  'fee_user_id',
  'fee_user_username',
  'fee_session_token',
  'fee_bookmarks',
]);

/** Kunci localStorage tempat identitas versi kode website disimpan. */
export const APP_BROWSER_VERSION_KEY = 'fee_app_version';

/** Bersihkan semua cache browser sambil menjaga whitelist data pengguna. */
export async function clearDataCaches(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const doomed: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key !== APP_BROWSER_VERSION_KEY && !CACHE_PERSIST_KEYS.has(key)) {
        doomed.push(key);
      }
    }
    for (const key of doomed) window.localStorage.removeItem(key);
  } catch {
    /* abaikan bila localStorage tidak tersedia/diblokir */
  }

  try {
    window.sessionStorage.clear();
  } catch {
    /* abaikan bila sessionStorage tidak tersedia/diblokir */
  }

  try {
    if (window.caches && typeof window.caches.keys === 'function') {
      const names = await window.caches.keys();
      await Promise.all(names.map((name) => window.caches.delete(name)));
    }
  } catch {
    /* abaikan bila CacheStorage diblokir / berumur lama */
  }
}