'use client';

/**
 * Log Aktivitas — audit + rollback semua mutasi admin.
 * Setiap aksi dicatat (snapshot sebelum/sesudah) oleh use-*-admin hooks.
 * Admin bisa menekan 'Balikan' untuk menerapkan ulang snapshot SEBELUM aksi,
 * dengan konfirmasi ganda (dual-confirm) sebelum benar-benar diterapkan.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { History, Loader2, RotateCcw, ShieldCheck, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ActivityRow = {
  id: number;
  actor_id: number | null;
  actor_name: string | null;
  module: string;
  action: string;
  summary: string | null;
  ref_type: string | null;
  ref_id: number | null;
  snapshot_before: unknown[] | null;
  snapshot_after: unknown[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  reverted_at: string | null;
  reverted_by: number | null;
};

const MODULE_LABEL: Record<string, string> = {
  karya: 'Karya',
  services: 'Katalog Buket',
  users: 'Tim',
  events: 'Event',
  reviews: 'Testimoni',
  settings: 'Pengaturan',
};

const ACTION_COLOR: Record<string, string> = {
  create: 'text-success bg-success/10 border-success/20',
  update: 'text-primary bg-primary/10 border-primary/20',
  delete: 'text-destructive bg-destructive/10 border-destructive/20',
  soft_delete: 'text-warning bg-warning/10 border-warning/20',
  restore: 'text-success bg-success/10 border-success/20',
  toggle_active: 'text-primary bg-primary/10 border-primary/20',
  duplicate: 'text-primary bg-primary/10 border-primary/20',
  move: 'text-primary bg-primary/10 border-primary/20',
  clear: 'text-destructive bg-destructive/10 border-destructive/20',
  upsert: 'text-primary bg-primary/10 border-primary/20',
};

const ACTION_LABEL: Record<string, string> = {
  create: 'Buat',
  update: 'Ubah',
  delete: 'Hapus',
  soft_delete: 'Arsipkan',
  restore: 'Pulihkan',
  toggle_active: 'Status',
  duplicate: 'Duplikat',
  move: 'Pindah',
  clear: 'Bersihkan',
  upsert: 'Simpan',
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function getSessionToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('fee_session_token') || '';
}

export default function AdminLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rpcNotReady, setRpcNotReady] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [revertTarget, setRevertTarget] = useState<ActivityRow | null>(null);
  const [reverting, setReverting] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setRpcNotReady(false);
    try {
      const token = getSessionToken();
      if (!token) {
        throw new Error('Sesi login tidak ditemukan. Silakan login ulang.');
      }
      const { data, error } = await supabase.rpc('list_activity_logs', {
        p_token: token,
        p_module: filter || null,
        p_limit: 300,
      });
      if (error) throw error;
      setLogs((data as ActivityRow[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gangguan sistem.';
      // PGRST202 = fungsi RPC tidak ditemukan di cache skema PostgREST
      // (migrasi log belum diterapkan ke database, atau skema belum di-reload).
      const code = (err as { code?: string } | undefined)?.code;
      setRpcNotReady(
        code === 'PGRST202' ||
          msg.includes('PGRST202') ||
          /could not find the function/i.test(msg) ||
          msg.includes('404')
      );
      setLoadError(msg);
      toast({ variant: 'destructive', title: 'Gagal Memuat Log', description: msg });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleRevert = async () => {
    if (!revertTarget) return;
    const token = getSessionToken();
    setReverting(true);
    try {
      const res = await fetch(`/api/admin/logs/${revertTarget.id}/revert`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Gagal membalikan.');
      }
      toast({ title: 'Aksi Dibalikan', description: 'Snapshot sebelum aksi telah diterapkan ulang.' });
      setRevertTarget(null);
      void load();
    } catch (err: unknown) {
      toast({ variant: 'destructive', title: 'Gagal Membalikan', description: err instanceof Error ? err.message : 'Coba lagi.' });
    } finally {
      setReverting(false);
    }
  };

  const modules = Object.keys(MODULE_LABEL);
  const filteredLogs = filter ? logs.filter((l) => l.module === filter) : logs;

  return (
    <div className="space-y-6 animate-fade-up text-left pb-10 w-full max-w-full overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/60">
        <h1 className="text-xl font-headline font-bold text-foreground uppercase tracking-tighter flex items-center gap-3">
          <History size={22} /> Log Aktivitas
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 rounded-xl border border-primary/10 bg-card px-3 text-[10px] font-black uppercase tracking-widest text-primary focus:outline-none"
            aria-label="Filter modul"
          >
            <option value="">Semua Modul</option>
            {modules.map((m) => (
              <option key={m} value={m}>{MODULE_LABEL[m]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* FILTER CHIPS */}
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="flex gap-1.5 min-w-max">
          {modules.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilter(filter === m ? '' : m)}
              className={cn(
                'shrink-0 rounded-xl px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-colors',
                filter === m
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-card text-primary/40 border-border/60 hover:text-primary hover:bg-primary/5'
              )}
            >
              {MODULE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {loading && (
          <div className="flex items-center justify-center py-20 text-primary/30">
            <Loader2 className="animate-spin" size={22} />
          </div>
        )}

        {!loading && loadError && (
          <div className="py-16 flex flex-col items-center gap-3 text-center bg-destructive/5 rounded-2xl border border-destructive/10">
            <div className="w-16 h-16 bg-destructive/10 rounded-[1.8rem] flex items-center justify-center">
              <History size={30} className="text-destructive/40" />
            </div>
            <p className="text-[11px] text-destructive font-black uppercase tracking-widest">Gagal Memuat Log</p>
            <p className="max-w-sm text-[9px] text-primary/40 leading-relaxed">{loadError}</p>
            {rpcNotReady && (
              <p className="max-w-sm text-[9px] text-primary/40 leading-relaxed bg-primary/5 rounded-xl px-4 py-3 border border-primary/10">
                Fitur log belum aktif di database. Jalankan <span className="font-mono font-black text-primary">npm run db:migrate</span> di terminal
                (atau jalankan ulang file <span className="font-mono font-black text-primary">migrations/014_qualify_pgcrypto_in_activity_log.sql</span> di Supabase SQL Editor).
                Setelah itu klik Coba Lagi.
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void load()}
                className="h-9 rounded-xl border-primary/10 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/5"
              >
                <RotateCcw size={13} className="mr-1.5" /> Coba Lagi
              </Button>
              {loadError.includes('Sesi') && (
                <Button
                  asChild
                  size="sm"
                  className="h-9 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest border-none shadow-md hover:opacity-90"
                >
                  <a href="/login">Login Ulang</a>
                </Button>
              )}
            </div>
          </div>
        )}

        {!loading && !loadError && filteredLogs.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 bg-primary/5 rounded-[1.8rem] flex items-center justify-center">
              <History size={30} className="text-primary/20" />
            </div>
            <p className="text-[11px] text-primary/30 font-black uppercase tracking-widest">Belum ada aktivitas</p>
            <p className="text-[9px] text-primary/20">Mutasi admin akan dicatat di sini untuk keperluan audit.</p>
          </div>
        )}

        {!loading && filteredLogs.map((log) => {
          const isOpen = expanded === log.id;
          return (
            <div
              key={log.id}
              className={cn(
                'overflow-hidden rounded-2xl border bg-card p-3 md:p-4 transition-colors',
                log.reverted_at ? 'border-border/60 opacity-70' : 'border-border/60 hover:bg-primary/[0.02]'
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : log.id)}
                className="w-full flex min-w-0 items-center gap-3 text-left"
              >
                <span className={cn('shrink-0 rounded-lg px-2 py-1 text-[7px] font-black uppercase tracking-widest border', ACTION_COLOR[log.action] || 'text-primary/40')}>
                  {ACTION_LABEL[log.action] || log.action}
                </span>
                <span className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-[10px] font-bold text-foreground">{log.summary || '(tanpa ringkasan)'}</p>
                  <p className="mt-0.5 break-words text-[8px] text-primary/25 font-mono">
                    {MODULE_LABEL[log.module] || log.module}
                    {log.ref_type ? ` · ${log.ref_type}` : ''}
                    {log.ref_id != null ? ` #${log.ref_id}` : ''}
                  </p>
                </span>
                <span className="hidden sm:block text-[8px] text-primary/30 font-bold shrink-0">{fmtDate(log.created_at)}</span>
                <span className="shrink-0">
                  {log.reverted_at ? (
                    <span className="rounded-lg px-2 py-1 text-[7px] font-black uppercase tracking-widest bg-success/10 text-success border border-success/20">Sudah dibalikan</span>
                  ) : (
                    <span className="rounded-lg px-2 py-1 text-[7px] font-black uppercase tracking-widest bg-primary/5 text-primary/40 border border-primary/10">Aktif</span>
                  )}
                </span>
                <ChevronDown size={15} className={cn('shrink-0 text-primary/25 transition-transform', isOpen && 'rotate-180')} />
              </button>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-border/60 space-y-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-primary/40">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={12} /> {log.actor_name || 'Admin'}
                    </span>
                    <span className="font-mono text-primary/25">#{log.id} · {fmtDate(log.created_at)}</span>
                  </div>

                  {!log.reverted_at ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRevertTarget(log)}
                      disabled={reverting}
                      className="h-9 rounded-xl border-primary/10 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary/5"
                    >
                      {reverting ? <Loader2 size={13} className="animate-spin mr-1.5" /> : <RotateCcw size={13} className="mr-1.5" />}
                      Balikan Aksi
                    </Button>
                  ) : (
                    <p className="text-[8px] text-success font-black uppercase tracking-widest">Aksi ini sudah dibalikan dan tidak bisa diulang.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DUAL-CONFIRM REVERT */}
      <AlertDialog open={!!revertTarget} onOpenChange={(open) => { if (!open) setRevertTarget(null); }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-5xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-warning/10 text-warning rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <RotateCcw size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Balikan Aksi Ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest leading-relaxed mb-6">
              {revertTarget ? `"${revertTarget.summary || 'Aksi'}"` : 'Aksi ini'} akan dikembalikan ke kondisi SEBELUM-nya.
              Data yang ada sekarang akan ditimpa. Konfirmasi ganda untuk mencegah kesalahan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={reverting} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">
              BATAL
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={reverting}
              onClick={(e) => { e.preventDefault(); void handleRevert(); }}
              className="bg-warning/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {reverting ? 'MEMBALIKAN...' : 'YA, BALIKAN'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}