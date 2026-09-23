'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Database, MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase';
import { logActivity } from '@/lib/activity-log';

export default function SettingsAdmin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [config, setConfig] = useState({
    phone: '',
    instagram: '',
    tiktok: '',
    address: '',
    message: ''
  });

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      if (data) {
        const mapped = data.reduce<Record<string, string>>((acc, item: { key: string; value: string }) => {
          acc[item.key] = item.value;
          return acc;
        }, {});
        // Filter out keys not present in the config state to prevent
        // stale/legacy DB keys from being injected and then overwritten on save.
        setConfig(prev => {
          const allowed = new Set(Object.keys(prev));
          const filtered: Record<string, string> = {};
          for (const [k, v] of Object.entries(mapped)) {
            if (allowed.has(k)) filtered[k] = v;
          }
          return { ...prev, ...filtered };
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat pengaturan.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setInitialLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const triggerSystemRevalidate = async () => {
    try {
      const secret = localStorage.getItem('fee_session_token') || '';
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${secret}` },
      });
    } catch (e) {
      console.error("Revalidation failed:", e);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = Object.entries(config).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key' });
      if (error) throw error;

      await logActivity({
        module: 'settings', action: 'upsert', refType: 'settings', refId: null,
        summary: 'Simpan konfigurasi pengaturan bisnis',
        before: [{ table: 'settings', rows: Object.entries(config).map(([key, value]) => ({ key, value })) }],
        after: [{ table: 'settings', rows: updates }],
        metadata: { primaryTable: 'settings', childTables: [], refCol: 'key' },
      }).catch(() => {});

      await triggerSystemRevalidate();
      toast({ title: "Konfigurasi Disimpan", description: "Informasi bisnis diperbarui dan cache dibersihkan." });
    } catch {
      toast({ variant: "destructive", title: "Gagal", description: "Masalah sinkronisasi data pusat." });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="space-y-4 animate-fade-up pb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div className="h-6 w-48 rounded-lg bg-primary/[0.04] animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 w-28 rounded-xl bg-primary/[0.04] animate-pulse" />
            <div className="h-10 w-36 rounded-xl bg-primary/[0.04] animate-pulse" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="border-none shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
              <div className="p-8 border-b border-primary/[0.03] space-y-1">
                <div className="h-4 w-36 rounded bg-primary/[0.04] animate-pulse" />
                <div className="h-2.5 w-48 rounded bg-primary/[0.04] animate-pulse" />
              </div>
              <div className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-2.5 w-24 rounded bg-primary/[0.04] animate-pulse" />
                      <div className="h-12 w-full rounded-2xl bg-primary/[0.04] animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-40 rounded bg-primary/[0.04] animate-pulse" />
                  <div className="h-24 w-full rounded-2xl bg-primary/[0.04] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[2.5rem] bg-primary p-8 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-2.5 w-24 rounded bg-white/10 animate-pulse" />
                <div className="h-5 w-36 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <h1 className="text-xl font-headline font-bold text-primary tracking-tight uppercase">Pengaturan Sistem</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings} className="rounded-xl h-10 px-6 text-[10px] font-bold uppercase border-primary/10 text-primary">
            <RotateCcw size={14} className="mr-2" /> Refresh
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-primary hover:opacity-90 text-white rounded-xl h-10 px-8 text-[10px] font-bold uppercase shadow-lg border-none active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-card overflow-hidden">
            <CardHeader className="p-8 border-b border-primary/[0.03]">
              <CardTitle className="text-sm font-headline text-primary uppercase font-black tracking-widest">Informasi Bisnis</CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-widest text-primary/30">Identitas Resmi Vape Store</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-primary/20 ml-1">WhatsApp</Label><Input value={config.phone} onChange={(e) => setConfig({...config, phone: e.target.value})} className="h-12 rounded-2xl bg-primary/[0.02] border-none px-5 text-sm font-bold text-primary" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-primary/20 ml-1">Instagram URL</Label><Input value={config.instagram} onChange={(e) => setConfig({...config, instagram: e.target.value})} className="h-12 rounded-2xl bg-primary/[0.02] border-none px-5 text-sm font-bold text-primary" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-primary/20 ml-1">TikTok URL</Label><Input value={config.tiktok} onChange={(e) => setConfig({...config, tiktok: e.target.value})} className="h-12 rounded-2xl bg-primary/[0.02] border-none px-5 text-sm font-bold text-primary" /></div>
                <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase text-primary/20 ml-1">Alamat Workshop</Label><Input value={config.address} onChange={(e) => setConfig({...config, address: e.target.value})} className="h-12 rounded-2xl bg-primary/[0.02] border-none px-5 text-sm font-bold text-primary" /></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 mb-1"><MessageSquare size={14} className="text-primary" /><Label className="text-[10px] font-black uppercase tracking-widest text-primary/20">Templat Pesan Konsultasi</Label></div>
                <Textarea value={config.message} onChange={(e) => setConfig({...config, message: e.target.value})} className="min-h-[100px] rounded-2xl bg-primary/[0.02] border-none p-6 text-sm font-medium italic text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-primary text-white p-8 space-y-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white relative z-10 shadow-inner border border-white/5"><Database size={24} /></div>
            <div className="space-y-0 relative z-10"><p className="text-[10px] font-black uppercase text-white/40">Sistem Metadata</p><h4 className="text-lg font-bold">Sinkronisasi Real-time</h4></div>
          </Card>
        </div>
      </div>
    </div>
  );
}