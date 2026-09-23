import { supabase } from '@/lib/supabase';

/**
 * Model snapshot aktivitas admin.
 *
 * Setiap snapshot adalah array operasi per-tabel. Entri { table, rows } berarti:
 *   - pada snapshot_before: kondisi baris SEBELUM aksi (untuk dipulihkan).
 *   - pada snapshot_after:  kondisi baris SETELAH aksi (untuk dibatalkan bila create).
 *
 * Konvensi untuk rollback (lihat /api/admin/logs/[id]/revert):
 *   - create/duplicate : balikan = hapus baris snapshot_after.
 *   - update/toggle/move/upsert/soft_delete/restore : balikan = tulis ulang snapshot_before.
 *   - delete (hard)     : balikan = sisipkan ulang baris snapshot_before (+ child).
 */
export type SnapshotTable = {
  table: string;
  /** Baris lengkap dengan nilai kolom. Untuk child/junction tanpa PK tunggal, seluruh baris disertakan. */
  rows: Record<string, unknown>[];
};

export type ActivitySnapshot = SnapshotTable[];

export type ActivityModule =
  | 'karya'
  | 'services'
  | 'users'
  | 'events'
  | 'reviews'
  | 'settings';

export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'soft_delete'
  | 'restore'
  | 'toggle_active'
  | 'duplicate'
  | 'move'
  | 'clear'
  | 'upsert';

export interface LogActivityInput {
  module: ActivityModule;
  action: ActivityAction;
  summary: string;
  refType: string;
  refId?: number | null;
  before?: ActivitySnapshot;
  after?: ActivitySnapshot;
  metadata?: Record<string, unknown>;
}

export function getSessionToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('fee_session_token') || '';
}

export function getActorIdentity(): { userId: number | null; name: string } {
  if (typeof window === 'undefined') return { userId: null, name: '' };
  const raw = window.localStorage.getItem('fee_user_id');
  const id = raw ? Number.parseInt(raw, 10) : NaN;
  return {
    userId: Number.isFinite(id) ? id : null,
    name: window.localStorage.getItem('fee_user_name') || '',
  };
}

/**
 * Mencatat aktivitas admin ke tabel activity_logs via RPC SECURITY DEFINER.
 * Aman: aktor ditentukan dari sesi token; input pemanggil hanya jadi fallback.
 */
export async function logActivity(input: LogActivityInput): Promise<number | null> {
  const token = getSessionToken();
  const { userId } = getActorIdentity();
  const { data, error } = await supabase.rpc('log_activity', {
    p_token: token,
    p_module: input.module,
    p_action: input.action,
    p_summary: input.summary,
    p_ref_type: input.refType,
    p_ref_id: input.refId ?? null,
    p_before: input.before ?? [],
    p_after: input.after ?? [],
    p_metadata: input.metadata ?? {},
    p_actor_name: getActorIdentity().name,
    p_requestor_id: userId,
  });
  if (error) {
    // Log gagal tidak boleh menggagalkan aksi utama — hanya dibuang ke stderr.
    const code = (error as { code?: string } | undefined)?.code;
    if (code === 'PGRST202' || /could not find the function/i.test(error.message)) {
      console.warn(
        '[activity-log] RPC log_activity tidak tersedia di database. ' +
          'Jalankan npm run db:migrate (migration 013_ensure_activity_log_rpc.sql) agar log tersimpan.'
      );
    } else {
      console.error('[activity-log] gagal mencatat:', error.message);
    }
    return null;
  }
  return typeof data === 'number' ? data : null;
}
