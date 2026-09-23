'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const LIMITS = {
  NAME: 40,
  TEXT: 400
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-primary/10 relative font-body overflow-x-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />
    <div className="w-full max-w-[640px] relative z-10 animate-fade-up">
      {children}
    </div>
    <div className="mt-8 text-center opacity-20">
      <p className="text-[7px] text-primary uppercase tracking-[0.6em] font-black">Vape Store Feedback System v1.0</p>
    </div>
  </div>
);

export default function ReviewPage() {
  const params = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  interface TokenData {
    id: number;
    token: string;
    usage_limit: number;
    usage_count: number;
  }
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Klien Vape Store',
    text: '',
    rating: 5
  });

  useEffect(() => {
    async function validateToken() {
      if (!params?.token) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('review_tokens')
          .select('*')
          .eq('token', params?.token as string)
          .single();

        if (error || !data || (data.usage_count >= data.usage_limit)) {
          setTokenData(null);
        } else {
          setTokenData(data);
        }
      } catch {
        setTokenData(null);
      } finally {
        setLoading(false);
      }
    }
    validateToken();
  }, [params?.token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.text.trim()) return;

    setSubmitting(true);
    try {
      const { error: rpcError } = await supabase.rpc('submit_review_with_token', {
        p_name: formData.name.trim(),
        p_role: formData.role,
        p_text: formData.text.trim(),
        p_rating: formData.rating,
        p_token: (params?.token as string) || ''
      });
      
      if (rpcError) throw rpcError;
      
      setSuccess(true);
      toast({ title: "Terima Kasih", description: "Ulasan Anda sangat berarti bagi kami." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi gangguan pada protokol keamanan.';
      toast({ 
        variant: "destructive", 
        title: "Gagal Mengirim", 
        description: message
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <PageWrapper>
      <div className="flex flex-col items-center gap-6 py-24 bg-card rounded-[3rem] shadow-sm p-10 border border-border/60">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/20">Sinkronisasi Akses...</p>
      </div>
    </PageWrapper>
  );

  if (!tokenData && !success) {
    return (
      <PageWrapper>
        <Card className="border-none rounded-[3.5rem] shadow-5xl text-center p-14 space-y-10 bg-card">
          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"><AlertCircle size={40} /></div>
          <div className="space-y-4">
            <h1 className="text-2xl font-headline text-primary uppercase font-black tracking-tighter leading-none">Sesi Berakhir</h1>
            <p className="text-primary/30 text-[11px] font-medium italic uppercase tracking-widest leading-relaxed">Tautan kadaluwarsa atau kuota ulasan telah penuh.</p>
          </div>
          <Button asChild className="bg-primary hover:opacity-90 text-white rounded-full w-full h-14 text-[10px] font-black uppercase tracking-[0.3em] border-none shadow-2xl transition-all active:scale-95">
            <Link href="/">Kembali Ke Beranda</Link>
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  if (success) {
    return (
      <PageWrapper>
        <Card className="border-none rounded-[3.5rem] shadow-5xl text-center p-14 space-y-10 bg-card">
          <div className="w-24 h-24 bg-success/10 text-success rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={48} /></div>
          <div className="space-y-4">
            <h1 className="text-2xl font-headline text-primary uppercase font-black tracking-tighter leading-none">Ulasan Terkirim</h1>
            <p className="text-primary/30 text-[11px] font-medium italic uppercase tracking-[0.2em] leading-relaxed">Terima kasih telah mempercayakan kebahagiaan Anda bersama Vape Store.</p>
          </div>
          <Button asChild className="bg-primary hover:opacity-90 text-white rounded-full w-full h-14 text-[10px] font-black uppercase tracking-[0.3em] border-none shadow-2xl active:scale-95 transition-all">
            <Link href="/">Tutup Halaman</Link>
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Card className="border-none rounded-[3.5rem] shadow-5xl overflow-hidden bg-card">
        <div className="bg-primary py-10 px-8 text-center text-white relative">
          <h1 className="text-lg md:text-xl font-headline font-bold uppercase tracking-[0.4em] leading-none">Kesan & Pesan</h1>
          <p className="text-white/30 text-[8px] uppercase tracking-[0.3em] font-black mt-3">Vape Store</p>
        </div>

        <CardContent className="p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/20">Identitas Anda</Label>
                  <span className={cn("text-[8px] font-bold tracking-widest", formData.name.length >= LIMITS.NAME ? "text-destructive/70" : "text-primary/10")}>
                    {formData.name.length} / {LIMITS.NAME}
                  </span>
                </div>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="NAMA LENGKAP KLIEN" 
                  maxLength={LIMITS.NAME}
                  className="h-14 rounded-2xl bg-primary/[0.02] border-none px-6 shadow-inner text-sm font-bold text-primary ring-0 focus-visible:ring-primary/10" 
                  required
                />
              </div>

              <div className="space-y-4 text-center md:text-right">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/20 mr-1 block md:inline-block">Rating Pelayanan</Label>
                <div className="flex gap-2 justify-center md:justify-end">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setFormData({...formData, rating: s})} className="transition-all hover:scale-110 active:scale-90 outline-none">
                      <Star size={36} className={cn("transition-all duration-300", s <= formData.rating ? "fill-primary text-primary scale-110 drop-shadow-md" : "text-primary/5")} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/20">Pengalaman Anda</Label>
                <span className={cn("text-[8px] font-bold tracking-widest", formData.text.length >= LIMITS.TEXT ? "text-destructive/70" : "text-primary/10")}>
                  {formData.text.length} / {LIMITS.TEXT}
                </span>
              </div>
              <Textarea 
                value={formData.text} 
                onChange={(e) => setFormData({...formData, text: e.target.value})} 
                placeholder="Ceritakan kepuasan Anda bersama tim kami..." 
                maxLength={LIMITS.TEXT}
                className="min-h-[160px] md:min-h-[200px] rounded-[2.5rem] bg-primary/[0.02] border-none p-8 no-scrollbar shadow-inner text-sm italic text-primary font-medium leading-relaxed ring-0 focus-visible:ring-primary/10" 
                required
              />
              <p className="text-[8px] text-muted-foreground italic px-4">Cerita Anda membantu kami menjaga kualitas produk dan layanan kami.</p>
            </div>

            <Button disabled={submitting || !formData.name || !formData.text} type="submit" className="w-full bg-primary hover:opacity-90 text-white rounded-[2rem] h-16 text-[12px] font-black uppercase tracking-[0.4em] shadow-4xl border-none transition-all active:scale-95 group">
              {submitting ? <Loader2 className="animate-spin h-6 w-6" /> : (
                <span className="flex items-center justify-center gap-4">
                  KIRIM ULASAN <CheckCircle2 size={20} className="group-hover:rotate-12 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}