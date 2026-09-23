import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export type AdminRole = 'admin' | 'developer';

export interface AdminSessionResult {
  ok: boolean;
  role: AdminRole | null;
  status: number;
  user_id?: number | null;
}

/**
 * Verifikasi sesi admin/developer lewat database (RPC SECURITY DEFINER),
 * bukan lewat secret ENV. Token dikirim sebagai `Authorization: Bearer <token>`.
 */
export async function requireAdminRole(
  req: NextRequest,
  allowedRoles: AdminRole[] = ['admin', 'developer']
): Promise<AdminSessionResult> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return { ok: false, role: null, status: 401 };
  }

  const { data, error } = await supabase.rpc('verify_admin_session', {
    p_token: token,
  });

  if (error) {
    return { ok: false, role: null, status: 401 };
  }

  const session = (data && Array.isArray(data) && data.length > 0 ? data[0] : null) as
    | { user_id: number; role: string }
    | null;

  if (!session) {
    return { ok: false, role: null, status: 401 };
  }

  if (!allowedRoles.includes(session.role as AdminRole)) {
    return { ok: false, role: session.role as AdminRole, status: 403 };
  }

  return { ok: true, role: session.role as AdminRole, status: 200, user_id: session.user_id };
}
