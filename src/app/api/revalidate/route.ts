
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdminRole } from '@/lib/admin-auth';

/**
 * Global Revalidation API v113.0
 * Membersihkan cache seluruh situs agar data terbaru langsung tampil.
 *
 * Yang DIBERSIHKAN:
 *   - Cache Next.js / ISR server (semua halaman lewat root layout).
 *   - Cache CDN respons akses publik (via Vercel).
 *
 * Yang TIDAK dihapus (dijamin aman):
 *   - Sesi login admin/staf (tabel admin_sessions + localStorage).
 *   - Bookmark / favorit produk (localStorage per pengunjung).
 *
 * SECURITY: Verifikasi sesi lewat DATABASE (RPC SECURITY DEFINER),
 * bukan secret ENV. Role admin & developer diizinkan.
 * Client mengirim `Authorization: Bearer <session_token>`.
 */
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, ['admin', 'developer']);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: 'Akses ditolak: sesi tidak valid.' },
      { status: auth.status === 403 ? 403 : 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    // Root layout mencakup SEMUA halaman (publik + admin).
    revalidatePath('/', 'layout');

    // Eksplisitkan rute publik utama: memastikan ISR/galeri/layanan
    // langsung regenerasi walau ada halaman yang tak berbagi segment cache.
    const publicPaths = [
      '/',
      '/karya',
      '/karya/[id]',
      '/layanan',
      '/layanan/[id]',
      '/favorit',
      '/kontak',
      '/review',
      '/bantuan',
      '/privacy',
      '/terms',
    ];
    for (const path of publicPaths) {
      revalidatePath(path, 'layout');
    }

    return NextResponse.json(
      {
        success: true,
        revalidatedAt: new Date().toISOString(),
        message:
          'Cache sistem berhasil dibersihkan. Sesi login & favorit pengunjung tetap aman.',
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Revalidation failed';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
