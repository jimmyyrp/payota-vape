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
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'File tidak ditemukan.' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const ext = file.name.includes('.') ? file.name.split('.').pop()!.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) : 'webp';
    const safeExt = /^[a-zA-Z0-9]{1,8}$/.test(ext) ? ext : 'webp';
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;

    const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
      contentType: file.type || 'image/webp',
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return NextResponse.json({ success: true, url: data.publicUrl, path: fileName });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload gagal';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}