'use client';

/**
 * ImageManageDialog - Aksi admin/developer pada SATU gambar di galeri karya:
 * 1) "Jadikan Produk Baru"  -> buat draf baru menyalin metadata sumber, isi satu gambar itu
 * 2) "Pindahkan ke Produk Lain" -> pilih karya tujuan lalu pindahkan gambar tsb
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { createProductFromImage, moveImageToProduct } from '@/lib/post-actions';
import { cn } from '@/lib/utils';
import { CopyPlus, FolderInput, Loader2, ImagePlus, Search } from 'lucide-react';

interface ImageManageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: { id: number | string; title: string } | null;
  imageUrl: string;
  imageIndex: number;
  /** Jumlah gambar pada karya sumber (untuk cek aturan min. 1 gambar). */
  imageCount?: number;
  onProductCreated?: (newPost: {
    id: number | string;
    title: string;
    price: number;
    deskripsi: string;
    gambar_thumbnail: string;
    is_active: boolean;
    images: { url_images: string }[];
    category_ids: number[];
    sub_category_ids: number[];
  }) => void;
  onChanged?: () => void;
}

interface TargetOption {
  id: number;
  title: string;
  imageUrl?: string;
}

export const ImageManageDialog: React.FC<ImageManageDialogProps> = ({
  open,
  onOpenChange,
  post,
  imageUrl,
  imageIndex,
  imageCount,
  onProductCreated,
  onChanged,
}) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'new' | 'move' | null>(null);
  const [busy, setBusy] = useState(false);
  const [targets, setTargets] = useState<TargetOption[]>([]);
  const [targetSearch, setTargetSearch] = useState('');
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<TargetOption | null>(null);

  // Reset state setiap dialog dibuka
  useEffect(() => {
    if (open) {
      setMode(null);
      setBusy(false);
      setTargetSearch('');
      setSelectedTarget(null);
      setTargets([]);
    }
  }, [open]);

  const loadTargets = useCallback(async () => {
    if (!post) return;
    setLoadingTargets(true);
    try {
      let all: TargetOption[] = [];
      let offset = 0;
      while (true) {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, product_images(url_images)')
          .is('deleted_at', null)
          .order('id', { ascending: false })
          .range(offset, offset + 999);
        if (error) throw error;
        const batch = ((data || []) as unknown as Array<{
          id: number;
          title: string;
          product_images?: { url_images: string }[];
        }>).filter((r) => String(r.id) !== String(post.id));
        all = all.concat(
          batch.map((r) => ({ id: r.id, title: r.title, imageUrl: r.product_images?.[0]?.url_images }))
        );
        if (batch.length < 1000) break;
        offset += 1000;
      }
      setTargets(all);
    } catch (err: unknown) {
      console.error('Gagal memuat daftar karya tujuan:', err);
      toast({ variant: 'destructive', title: 'Gagal Memuat Tujuan', description: 'Tidak dapat memuat daftar karya tujuan.' });
    } finally {
      setLoadingTargets(false);
    }
  }, [post, toast]);

  const handleChooseMode = (next: 'new' | 'move') => {
    setMode(next);
    if (next === 'move') void loadTargets();
  };

  const handleBack = () => {
    setMode(null);
    setBusy(false);
  };

  const handleCreateProduct = async () => {
    if (!post) return;
    setBusy(true);
    try {
      const res = await createProductFromImage(post.id, imageUrl);
      if (!res.ok) throw new Error(res.error);
      onProductCreated?.({
        id: res.newId,
        title: res.title,
        price: res.price || 0,
        deskripsi: res.deskripsi || '',
        gambar_thumbnail: imageUrl,
        is_active: false,
        images: [{ url_images: imageUrl }],
        category_ids: res.category_ids,
        sub_category_ids: res.sub_category_ids,
      });
      onChanged?.();
      onOpenChange(false);
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Produk',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async () => {
    if (!post || !selectedTarget) return;
    setBusy(true);
    try {
      const res = await moveImageToProduct(post.id, imageUrl, selectedTarget.id);
      if (!res.ok) throw new Error(res.error);
      toast({
        title: 'Gambar Dipindahkan',
        description: `Gambar dipindah ke "${selectedTarget.title}".`,
      });
      onChanged?.();
      onOpenChange(false);
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Gagal Memindahkan Gambar',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga.',
      });
    } finally {
      setBusy(false);
    }
  };

  if (!post) return null;

  // Aturan katalog: karya harus selalu menyisakan minimal 1 gambar.
  const singleImage = typeof imageCount === 'number' && imageCount <= 1;

  const filteredTargets = targets.filter((t) =>
    t.title.toLowerCase().includes(targetSearch.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
      <DialogContent
        overlayClassName="!z-[400]"
        className="!z-[410] w-[calc(100%-2rem)] max-w-lg rounded-2xl border-none bg-card p-0 shadow-5xl sm:w-full !max-h-[85dvh] flex flex-col"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="border-b border-border/60 bg-primary/5 px-5 py-5 text-left sm:px-7 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-headline font-black uppercase tracking-tight text-primary">
            <ImagePlus size={16} /> Kelola Gambar {imageIndex + 1}
          </DialogTitle>
          <DialogDescription className="text-[10px] leading-relaxed text-primary/50">
            Pilih aksi untuk gambar ini pada &quot;{post.title}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 px-5 py-5 sm:px-7 sm:py-6">
          {/* PREVIEW GAMBAR */}
          <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-primary/5 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Gambar dipilih" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary">Gambar terpilih</p>
              <p className="text-[10px] text-primary/50 break-words leading-relaxed mt-0.5">{imageUrl}</p>
            </div>
          </div>

          {mode === null && (
            <div className="space-y-2.5 pt-1">
              {singleImage && (
                <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4 text-[10px] leading-relaxed text-warning font-medium">
                  Karya ini hanya memiliki 1 gambar dan wajib menyisakannya.
                  Tambahkan foto lain lewat editor karya sebelum memindahkan atau membuat produk baru.
                </div>
              )}
              <Button
                onClick={() => handleChooseMode('new')}
                disabled={singleImage || busy}
                className="w-full h-auto flex items-center gap-3 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/10 py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <CopyPlus size={18} />
                <span className="flex-1">Jadikan Produk Baru</span>
              </Button>
              <Button
                onClick={() => handleChooseMode('move')}
                disabled={singleImage || busy}
                className="w-full h-auto flex items-center gap-3 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/10 py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <FolderInput size={18} />
                <span className="flex-1">Pindahkan ke Produk Lain</span>
              </Button>
            </div>
          )}

          {mode === 'new' && (
            <div className="space-y-4 pt-1">
              <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">Detail pembuatan</p>
                <p className="text-[10px] leading-relaxed text-primary/50">
                  Akan dibuat karya <b>draf baru</b> dengan menyalin metadata <b>&quot;{post.title}&quot;</b>
                  (judul, harga, deskripsi, kategori) dan hanya berisi gambar ini. Setelah dibuat, dialog
                  editor langsung terbuka agar langsung dapat disesuaikan.
                </p>
              </div>
              <Button
                onClick={() => void handleCreateProduct()}
                disabled={busy}
                className="w-full h-11 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <CopyPlus size={14} />} Buat &amp; Edit Produk Baru
              </Button>
            </div>
          )}

          {mode === 'move' && (
            <div className="space-y-3 pt-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary">
                Pilih karya tujuan
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary/30" />
                <Input
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  placeholder="Cari karya tujuan..."
                  className="h-11 rounded-xl bg-primary/5 border-primary/10 pl-9 text-sm"
                />
              </div>

              {loadingTargets ? (
                <div className="py-10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
                </div>
              ) : (
                <ScrollArea className="h-64 rounded-xl border border-border/60">
                  <div className="space-y-1 p-2">
                    {filteredTargets.length === 0 ? (
                      <p className="py-8 text-center text-[9px] font-bold uppercase tracking-widest text-primary/30">
                        Tidak ada karya tujuan
                      </p>
                    ) : (
                      filteredTargets.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTarget(t)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-xl p-2.5 text-left transition-all border',
                            selectedTarget?.id === t.id
                              ? 'bg-primary/10 border-primary/30'
                              : 'border-transparent hover:bg-primary/5'
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.imageUrl || '/favicon_io/apple-touch-icon.png'}
                            alt={t.title}
                            className="h-10 w-10 shrink-0 rounded-lg object-cover bg-primary/5"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-foreground truncate">
                              {t.title}
                            </span>
                            <span className="block text-[8px] font-bold uppercase tracking-widest text-primary/40">
                              FEE-{t.id}
                            </span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}

              <Button
                onClick={() => void handleMove()}
                disabled={!selectedTarget || busy}
                className="w-full h-11 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <FolderInput size={14} />} Pindahkan Gambar
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-border/60 bg-background px-5 py-4 sm:justify-end sm:px-7 shrink-0">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => (mode ? handleBack() : onOpenChange(false))}
            className="h-10 flex-1 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary/60 hover:bg-primary/5 sm:flex-none"
          >
            {mode ? 'Kembali' : 'Tutup'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
