
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdminRole } from '@/lib/admin-auth';

/**
 * Maintenance API v84.0
 * Memicu pembersihan data Soft-Delete > 7 hari (Hard Delete).
 *
 * SECURITY: Verifikasi sesi lewat DATABASE (RPC SECURITY DEFINER),
 * bukan secret ENV. Hanya role developer yang diizinkan.
 * Client mengirim `Authorization: Bearer <session_token>`.
 */

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, ['developer']);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak: sesi tidak valid atau bukan developer.' },
      { status: auth.status === 403 ? 403 : 401, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const { data, error } = await supabase.rpc('cleanup_expired_records');
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Protokol pembersihan (Hard Delete) berhasil dieksekusi.',
      details: data,
    }, { headers: NO_STORE_HEADERS });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kegagalan protokol maintenance.';
    return NextResponse.json(
      { success: false, message, error: message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
