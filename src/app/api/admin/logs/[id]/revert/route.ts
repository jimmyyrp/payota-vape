import { NextRequest, NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
import type { ActivitySnapshot } from '@/lib/activity-log';

export const runtime = 'nodejs';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

interface ActivityRow {
  id: number;
  actor_id: number | null;
  actor_name: string | null;
  module: string;
  action: string;
  summary: string | null;
  ref_type: string | null;
  ref_id: number | null;
  snapshot_before: ActivitySnapshot | null;
  snapshot_after: ActivitySnapshot | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  reverted_at: string | null;
  reverted_by: number | null;
}

/**
 * Ambil satu log + verifikasi sesi admin. Token dibaca dari Authorization header
 * (sama dengan token sesi yang disimpan client di localStorage).
 */
async function loadLog(req: NextRequest, id: number): Promise<{ log: ActivityRow; token: string } | { error: NextResponse }> {
  const auth = await requireAdminRole(req, ['admin', 'developer']);
  if (!auth.ok) {
    return { error: NextResponse.json({ success: false, error: 'Akses ditolak: sesi tidak valid.' }, { status: auth.status, headers: NO_STORE_HEADERS }) };
  }
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || '';
  const { data, error } = await supabase.rpc('get_activity_log', { p_token: token, p_id: id });
  if (error || !data || data.length === 0) {
    return { error: NextResponse.json({ success: false, error: 'Log tidak ditemukan.' }, { status: 404, headers: NO_STORE_HEADERS }) };
  }
  return { log: data[0] as ActivityRow, token };
}

function pkColumns(table: string): string[] {
  switch (table) {
    case 'settings':
      return ['key'];
    case 'product_categories':
      return ['product_id', 'category_id'];
    case 'product_sub_categories':
      return ['product_id', 'sub_category_id'];
    case 'event_categories':
      return ['event_id', 'category_id'];
    default:
      return ['id'];
  }
}

/**
 * Tulis ulang baris agar cocok dengan snapshot. Untuk parent: upsert by PK.
 * Untuk child table: hapus dulu baris yang terikat ref, lalu sisipkan snapshot.
 */
async function replaySnapshotBefore(log: ActivityRow): Promise<void> {
  const snap = log.snapshot_before;
  if (!snap || snap.length === 0) return;

  const meta = log.metadata || {};
  const primaryTable = (meta.primaryTable as string) || log.ref_type || '';
  const childTables = (meta.childTables as string[]) || [];
  const refCol = (meta.refCol as string) || '';

  for (const snapTable of snap) {
    const { table, rows } = snapTable;
    if (rows.length === 0) continue;

    if (childTables.includes(table) && refCol) {
      // Hapus relasi lama utk ref ini, lalu sisipkan snapshot.
      const refVal = log.ref_id;
      const del = await supabase.from(table).delete().eq(refCol, refVal);
      if (del.error) throw new Error(`Gagal bersihkan ${table}: ${del.error.message}`);
      const inserts = rows.map((r) => ({ ...r }));
      if (inserts.length > 0) {
        const ins = await supabase.from(table).insert(inserts);
        if (ins.error) throw new Error(`Gagal memulihkan ${table}: ${ins.error.message}`);
      }
      continue;
    }

    // Parent / table biasa: upsert by PK columns.
    const pks = pkColumns(table);
    const upsertRows = rows.map((r) => ({ ...r }));
    const onConflict = pks.join(',');
    if (table === 'settings') {
      const targetKeys = rows.map((r) => r['key'] as string);
      if (targetKeys.length > 0) {
        const del = await supabase.from(table).delete().in('key', targetKeys);
        if (del.error) throw new Error(`Gagal bersihkan ${table}: ${del.error.message}`);
      }
    }
    const res = await supabase.from(table).upsert(upsertRows, { onConflict });
    if (res.error) throw new Error(`Gagal memulihkan ${table}: ${res.error.message}`);
  }
  void primaryTable;
}

/**
 * Batalkan operasi create/duplicate: hapus baris snapshot_after.
 * Baris child dibersihkan oleh ON DELETE CASCADE dari parent.
 */
async function undoAfterSnapshot(log: ActivityRow): Promise<void> {
  const meta = log.metadata || {};
  const primaryTable = (meta.primaryTable as string) || log.ref_type || '';
  const refId = log.ref_id;
  if (primaryTable && refId != null) {
    if (primaryTable === 'settings') {
      const keys = (log.snapshot_after || [])
        .flatMap((t) => t.rows.map((r) => r['key']))
        .filter((k): k is string => typeof k === 'string');
      if (keys.length > 0) {
        const del = await supabase.from(primaryTable).delete().in('key', keys);
        if (del.error) throw new Error(`Gagal membatalkan ${primaryTable}: ${del.error.message}`);
      }
      return;
    }
    const del = await supabase.from(primaryTable).delete().eq('id', refId);
    if (del.error) throw new Error(`Gagal membatalkan ${primaryTable}: ${del.error.message}`);
  }
}

const CREATE_ACTIONS = new Set(['create', 'duplicate']);

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: 'ID tidak valid.' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const loaded = await loadLog(req, id);
  if ('error' in loaded) return loaded.error;
  const { log, token } = loaded;

  if (log.reverted_at) {
    return NextResponse.json({ success: false, error: 'Aksi ini sudah dibalikan.' }, { status: 409, headers: NO_STORE_HEADERS });
  }

  try {
    if (CREATE_ACTIONS.has(log.action)) {
      await undoAfterSnapshot(log);
    } else {
      await replaySnapshotBefore(log);
    }

    // Tandai sudah dibalikan (SECURITY DEFINER — hanya sesi admin valid).
    const { data: marked, error: markErr } = await supabase.rpc('mark_activity_reverted', {
      p_token: token,
      p_id: id,
    });
    if (markErr) throw new Error(`Gagal menandai: ${markErr.message}`);

    return NextResponse.json(
      { success: true, reverted: marked === true },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal membalikan aksi.';
    return NextResponse.json({ success: false, error: msg }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
