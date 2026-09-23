import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdminRole } from '@/lib/admin-auth';
import { createServiceClient } from '@/lib/server-supabase';

const BUCKET = 'vape_media';

export async function POST(request: NextRequest) {
  const auth = await requireAdminRole(request, ['admin', 'developer']);
  if (!auth.ok) {
    return NextResponse.json({ success: false, error: 'Akses ditolak: sesi tidak valid.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const path = typeof body?.path === 'string' ? body.path.trim() : '';
    if (!path) {
      return NextResponse.json({ success: false, error: 'Path tidak valid.' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}