import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Logout API.
 * Mencabut (revoke) sesi admin yang sedang aktif agar token tidak bisa
 * dipakai lagi setelah keluar. Fire-and-forget dari sisi client.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return NextResponse.json({ success: false }, { status: 200 });
  }

  const { error } = await supabase.rpc('revoke_admin_session', {
    p_token: token,
  });

  if (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
