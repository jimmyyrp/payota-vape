'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, Database, Download, ShieldCheck, Loader2, RefreshCw, Zap, Activity, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { buildBackupSql, downloadSqlBackup } from '@/lib/sql-backup';
import { clearDataCaches } from '@/lib/browser-cache';
import { APP_BUILD_VERSION } from '@/lib/build-id.generated';

export default function DeveloperPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('fee_user_role') || '');
    }
  }, []);

  const handleBackupSQL = async () => {
    setLoading(true);
    try {
      const sqlContent = await buildBackupSql();
      downloadSqlBackup(sqlContent);
      toast({ title: "Ekspor Berhasil", description: "Arsip SQL telah diunduh." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal melakukan backup';
      toast({ variant: "destructive", title: "Gagal Backup", description: message });
    } finally {
      setLoading(false);
    }
  };

  const runMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      const token = localStorage.getItem('fee_session_token') || '';
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Maintenance Berhasil", description: "Protokol pembersihan telah dieksekusi." });
      } else {
        throw new Error(data.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Maintenance gagal';
      const needsLogin = /sesi tidak valid|Akses ditolak/i.test(message);
      toast({
        variant: "destructive",
        title: "Maintenance Gagal",
        description: needsLogin ? "Sesi kedaluwarsa. Silakan logout lalu login kembali, kemudian coba lagi." : message,
      });
    } finally {
      setMaintenanceLoading(false);
    }
  };

  /**
   * Bersihkan cache browser (localStorage + sessionStorage + CacheStorage)
   * sambil MENJAGA sesi login & bookmark favorit.
   * Dipakai bersama oleh VersionGuard (auto saat update) & tombol PURGE ini.
   */
  const clearBrowserCache = () => clearDataCaches();

  const purgeCache = async () => {
    setCacheLoading(true);
    const confirmClear = window.confirm(
      'Bersihkan SEMUA cache (server + browser/HP)?\n\nSesi login admin dan bookmark favorit pengunjung TIDAK akan terhapus.\n\nHalaman akan dimuat ulang otomatis setelah selesai.'
    );
    if (!confirmClear) {
      setCacheLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('fee_session_token') || '';
      const res = await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      await clearBrowserCache();

      toast({
        title: "Semua Cache Dibersihkan",
        description: "Cache server & browser dihapus. Sesi login & favorit tetap aman. Memuat ulang…",
      });
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal purge cache';
      toast({ variant: "destructive", title: "Gagal Purge", description: message });
      setCacheLoading(false);
    }
  };

  if (role !== 'developer') return (
    <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
      <div className="w-20 h-20 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner">
        <ShieldCheck size={40} />
      </div>
      <h1 className="text-xl font-headline font-bold text-primary uppercase tracking-widest">Akses Root Terkunci</h1>
      <Button variant="outline" onClick={() => window.location.href = '/admin'} className="rounded-2xl h-12 px-8 border-primary/10 text-primary">KEMBALI KE DASBOR</Button>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-up pb-20 text-left">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-primary opacity-40 text-[10px] font-black uppercase tracking-[0.4em]">
             <Terminal size={12} /> System Command Center
          </div>
          <h1 className="text-2xl font-headline font-bold text-primary tracking-tight uppercase">Developer Tools</h1>
        </div>
        <div className="px-6 py-2.5 rounded-2xl bg-primary text-white flex items-center gap-3 shadow-2xl">
           <Zap size={14} className="text-white animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest">Root Active</span>
        </div>
      </div>
      <p className="text-[10px] font-mono uppercase tracking-widest text-primary/40">Build {APP_BUILD_VERSION} — cache browser dibersihkan otomatis saat versi berubah</p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-[3rem] bg-card overflow-hidden group">
              <CardHeader className="p-10 border-b border-primary/[0.03] bg-primary/[0.01]">
                <div className="flex items-center gap-3">
                  <Database className="text-primary/40" size={20} />
                  <CardTitle className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Vape Store Blueprint SQL</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                <p className="text-[11px] text-primary/30 italic leading-relaxed font-medium">Ekspor seluruh skema dan data ke SQL dengan sinkronisasi ID otomatis.</p>
                <Button onClick={handleBackupSQL} disabled={loading} className="w-full bg-primary hover:opacity-90 text-white rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest shadow-2xl border-none">
                  {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download size={14} className="mr-2" />} JALANKAN EKSPOR (.SQL)
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-[3rem] bg-card overflow-hidden group">
              <CardHeader className="p-10 border-b border-primary/[0.03] bg-primary/[0.01]">
                <div className="flex items-center gap-3">
                  <RefreshCw className="text-primary/40" size={20} />
                  <CardTitle className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">Cache Control</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                <p className="text-[11px] text-primary/30 italic leading-relaxed font-medium">Revalidasi seluruh halaman server DAN bersihkan cache browser/HP. Sesi login & favorit pengunjung dijamin aman — hanya data cache / data sementara yang dihapus. Berguna setelah update website agar HP tidak menampilkan versi lama.</p>
                <Button onClick={purgeCache} disabled={cacheLoading} variant="outline" className="w-full rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-primary/5 hover:text-primary border-primary/10">
                  {cacheLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <RefreshCw size={14} className="mr-2" />} {cacheLoading ? "MEMBERSIHKAN…" : "PURGE ALL CACHE (AMAN)"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
            <CardHeader className="p-10 border-b border-border/60 bg-secondary/40">
              <div className="flex items-center gap-3">
                <Database className="text-primary/50" size={18} />
                <CardTitle className="text-[12px] font-black text-foreground uppercase tracking-[0.4em]">Vape Store Storage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-4 text-left">
              <p className="text-[11px] text-muted-foreground italic leading-relaxed font-medium">
                Media produk disimpan di Supabase Storage bucket <code className="font-mono text-primary not-italic">vape_media</code>.
                Admin (Kategori Produk, Sub Kategori) wajib mengunggah 1+ foto sebelum produk muncul ke publik.
              </p>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                File yang tidak terhubung ke produk (orphan) dapat dibersihkan langsung dari tab Storage di Supabase Dashboard — tanpa perlu cron server.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[3rem] bg-card overflow-hidden">
             <CardHeader className="p-10 border-b border-border/60">
                <div className="flex items-center gap-3">
                   <Activity className="text-primary/40" size={18} />
                   <CardTitle className="text-[12px] font-black text-primary uppercase tracking-[0.4em]">System Logs</CardTitle>
                </div>
             </CardHeader>
             <CardContent className="p-0">
                <div className="bg-primary/[0.02] p-10 font-mono text-[11px] text-primary/60 space-y-2 min-h-[240px]">
                   <p className="opacity-30">[SYSTEM] Vape Store Kernel Active...</p>
                   <p>[CACHE] Invalidation Protocol Ready</p>
                   <p>[DB] Status: Connected to Supabase Production</p>
                   <p className="text-primary font-bold">[CMD] Monitoring blueprint stream...</p>
                   <p className="animate-pulse">_</p>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm rounded-[3rem] bg-primary text-white p-10 space-y-8 relative overflow-hidden">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white shadow-inner border border-white/5"><Zap size={28} /></div>
              <div>
                <h3 className="text-[14px] font-black uppercase tracking-widest text-white">Otoritas Root</h3>
                <p className="text-[10px] text-white/40 uppercase font-medium">Developer Privilege</p>
              </div>
            </div>
            <ul className="space-y-4">
               <li className="text-[12px] text-white/60 flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-white/40" /> Revalidation Path: '/'</li>
               <li className="text-[12px] text-white/60 flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-white/40" /> Hard-Delete Protocol Active</li>
            </ul>
          </Card>
          
          <Card className="border-none shadow-sm rounded-[3rem] bg-destructive/10 p-10 space-y-6">
             <div className="flex items-center gap-3 text-destructive">
                <Trash2 size={24} />
                <CardTitle className="text-[12px] font-black uppercase tracking-[0.4em]">Danger Zone</CardTitle>
             </div>
             <p className="text-[11px] text-destructive/60 leading-relaxed italic font-medium">Hapus permanen data soft-delete yang sudah melewati masa retensi 7 hari secara paksa.</p>
             <Button onClick={runMaintenance} disabled={maintenanceLoading} className="w-full bg-destructive hover:bg-destructive text-white rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest border-none shadow-xl active:scale-95 transition-all">
                {maintenanceLoading ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : "TRIGGER HARD-DELETE"}
             </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}