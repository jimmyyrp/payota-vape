'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Carousel as ShadCarousel,
  CarouselContent as ShadContent,
  CarouselItem as ShadItem,
  CarouselNext as ShadNext,
  CarouselPrevious as ShadPrev,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Eye, LayoutGrid, MessageCircle, Star, Maximize2, X } from 'lucide-react';
import { formatCompactNumber, formatPriceRange } from '@/lib/formatters';
import { buildProductWhatsAppUrl, getSiteUrl, toAbsoluteUrl } from '@/lib/whatsapp';
import { useStaffAuth } from '@/hooks/use-staff-auth';
import { supabase } from '@/lib/supabase';
import { KaryaManageBar } from '@/components/karya-manage-bar';
import { InlineKaryaEditDialog } from '@/components/inline-karya-edit-dialog';
import { ImageManageDialog } from '@/components/image-manage-dialog';

// ============================================
// TYPES
// ============================================

export interface PostImageData {
  url_images: string;
  [key: string]: unknown;
}

export interface PostCategoryData {
  id: number;
  name: string;
}

export interface PostSubCategoryData {
  id: number;
  name: string;
}

export interface PostDetailItem {
  id: number | string;
  title: string;
  deskripsi?: string;
  gambar_thumbnail?: string;
  price?: number;
  price_max?: number | null;
  views?: number;
  created_at?: string;
  updated_at?: string;
  images?: PostImageData[];
  categories?: PostCategoryData[];
  sub_categories?: PostSubCategoryData[];
  [key: string]: unknown;
}

interface PostDetailDialogProps {
  selected: PostDetailItem | null;
  onOpenChange: (open: boolean) => void;
  onBookmarkToggle?: (id: string) => void;
  isBookmarked?: (id: string) => boolean;
  /** Refresh data induk setelah duplikat/toggle dari bar kelola (admin/dev). */
  onManagedChange?: () => void;
  /** Tutup dialog + refresh setelah hapus dari bar kelola. */
  onManagedDelete?: () => void;
  /** Buka edit in-place (admin/dev). Saat tidak disediakan, bar kelola navigate /admin/karya. */
  onEdit?: (post: PostDetailItem) => void;
  /** Indeks gambar (0-based) yang ingin ditampilkan saat dibuka. Default 0 (foto pertama). */
  initialImageIndex?: number;
  /** Dipanggil setiap slide berubah (indeks 0-based) agar induk bisa sinkronkan URL. */
  onSlideChange?: (index: number) => void;
}

// ============================================
// COMPONENT
// ============================================

export const PostDetailDialog: React.FC<PostDetailDialogProps> = ({
  selected,
  onOpenChange,
  onBookmarkToggle,
  isBookmarked,
  onManagedChange,
  onManagedDelete,
  onEdit,
  initialImageIndex = 0,
  onSlideChange,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const { canManage } = useStaffAuth();

  // Inline editor (in-place) + image action dialog state
  const [editingPost, setEditingPost] = useState<PostDetailItem | null>(null);
  const [imageAction, setImageAction] = useState<{
    open: boolean;
    imageUrl: string;
    index: number;
  }>({ open: false, imageUrl: '', index: 0 });

  // Track carousel slide via Embla API event
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
      onSlideChange?.(api.selectedScrollSnap());
    };
    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api, onSlideChange]);

  // Reset ke gambar target saat membuka produk berbeda (pakai initialImageIndex
  // bila disediakan, misal deep-link ?img=; default kembali ke foto pertama).
  const prevOpenKeyRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (selected) {
      const key = `${selected.id}:${initialImageIndex}`;
      if (key !== prevOpenKeyRef.current) {
        prevOpenKeyRef.current = key;
        const safeIdx = initialImageIndex > 0 ? initialImageIndex : 0;
        setCurrent(safeIdx);
        api?.scrollTo(safeIdx);
        if (initialImageIndex > 0) onSlideChange?.(safeIdx);
      }
    }
  }, [selected?.id, initialImageIndex, api, onSlideChange]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsFullScreen(false);
    }
    onOpenChange(open);
  };

  // Safety net: teardown modal bersarang (dropdown/alert) kadang membalap
  // unmount dialog induk dan meninggalkan scroll-lock / style body Radix
  // RemoveScroll yang mengunci halaman (tombol di belakang terasa mati).
  // Bersihkan sisa tersebut — TAPI hanya bila tidak ada dialog lain yang
  // sedang terbuka.
  useEffect(() => {
    if (!selected) return;
    return () => {
      const timer = window.setTimeout(() => {
        if (document.querySelectorAll('[role="dialog"]').length === 0) {
          const body = document.body;
          void body.style.removeProperty('overflow');
          void body.style.removeProperty('padding-right');
          void body.style.removeProperty('position');
          void body.style.removeProperty('width');
          void body.style.removeProperty('top');
          void body.style.removeProperty('left');
        }
      }, 0);
      window.clearTimeout(timer);
    };
  }, [selected]);

  if (!selected) return null;

  const categoryNames =
    selected.categories && selected.categories.length > 0
      ? selected.categories.map((c) => c.name).join(' • ')
      : 'KOLEKSI VAPE';

  const displayImages =
    selected.images && selected.images.length > 0
      ? selected.images
      : [{ url_images: '/favicon_io/apple-touch-icon.png' }];
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : getSiteUrl();
  const detailUrl = `${siteOrigin}/karya/${selected.id}`;

  // Compute WhatsApp URL at click time directly from Embla API — guarantees
  // the image matches exactly what the user sees at the moment of clicking.
  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Read directly from Embla API (always up-to-date, no React state lag)
    const idx = (api?.selectedScrollSnap() ?? 0);
    const safeIdx = idx >= 0 && idx < displayImages.length ? idx : 0;
    const imageUrl = toAbsoluteUrl(displayImages[safeIdx].url_images, siteOrigin);
    // Sertakan ?img= agar penerima dibuka di gambar yang SAMA dengan yang dilihat.
    const shareDetailUrl = safeIdx > 0 ? `${detailUrl}?img=${safeIdx + 1}` : detailUrl;
    const url = buildProductWhatsAppUrl({
      title: selected.title,
      detailUrl: shareDetailUrl,
      imageUrl,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={!!selected} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        mobilePosition="full"
        className={cn(
          /* Mobile: full-screen — fills the whole area, info content stays scrollable */
          'p-0 border-none overflow-hidden bg-card shadow-5xl focus:outline-none transition-all duration-500',
          /* Desktop: wider centered popup — inherit inset-0 m-auto from base, just override max-w and layout */
          'md:w-[94vw] md:max-w-[1280px] md:rounded-[2.5rem] md:max-h-[88vh] md:h-[min(760px,88vh)]',
          /* Override base gap-4: 58% + 42% + gap would exceed 100% */
          'gap-0 lg:gap-0',
          /* Flex layout (base is already flex) */
          'flex flex-col lg:flex-row',
          isFullScreen
            ? 'w-full h-full !rounded-none max-w-full md:max-w-full md:inset-0 md:m-auto'
            : ''
        )}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="sr-only">
          <DialogTitle>{selected.title}</DialogTitle>
          <DialogDescription>Detail produk vape Vape Store.</DialogDescription>
        </div>

        {/* IMAGE PANEL */}
        <div
          className={cn(
            'relative bg-secondary border-r border-border shrink-0 overflow-hidden min-w-0 transition-all duration-500 flex items-center justify-center',
            isFullScreen ? 'lg:w-full h-full' : 'lg:w-[60%] h-[min(42dvh,420px)] lg:h-full lg:min-h-[420px]'
          )}
        >
          <ShadCarousel key={String(selected.id)} setApi={setApi} className="w-full h-full">
            <ShadContent className="h-full">
              {displayImages.map((img: PostImageData, idx: number) => (
                <ShadItem key={idx} className="relative h-full w-full flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <img
                      src={img.url_images}
                      alt={selected.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-contain p-4 sm:p-6 lg:p-8"
                    />
                  </div>
                </ShadItem>
              ))}
            </ShadContent>
            <ShadPrev className="left-4 sm:left-6 hidden sm:flex" />
            <ShadNext className="right-4 sm:right-6 hidden sm:flex" />
          </ShadCarousel>

          {/* FULLSCREEN TOGGLE */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            aria-label={isFullScreen ? "Tutup detail visual" : "Buka detail visual"}
            className="absolute top-3 left-3 md:top-6 md:left-6 z-[130] h-10 md:h-12 px-3 md:px-5 rounded-xl md:rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center gap-2 md:gap-2.5 hover:bg-black/60 transition-all shadow-2xl group"
          >
            {isFullScreen ? <X size={16} /> : <Maximize2 size={16} />}
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
              {isFullScreen ? 'TUTUP' : 'DETAIL'}
            </span>
          </button>

          {/* CLOSE BUTTON (mobile) — base close is hidden via hideCloseButton */}
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Tutup detail karya"
            className="absolute top-3 right-3 md:top-6 md:right-6 z-[130] h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-all shadow-2xl group"
          >
            <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* THUMBNAIL STRIP */}
          {!isFullScreen && displayImages.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 md:bottom-8 left-0 right-0 z-[130] px-3 sm:px-6 md:px-8">
              <div className="flex gap-1.5 sm:gap-2 md:gap-3 justify-center bg-black/30 backdrop-blur-xl p-1.5 sm:p-2 md:p-3 rounded-2xl md:rounded-3xl border border-white/10 w-fit mx-auto shadow-2xl max-w-[95%] overflow-x-auto no-scrollbar">
                {displayImages.map((img: PostImageData, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => api?.scrollTo(idx)}
                    aria-label={`Gambar ${idx + 1} dari ${displayImages.length}`}
                    className={cn(
                      'relative w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0',
                      current === idx
                        ? 'border-primary scale-110 shadow-xl'
                        : 'border-white/20 opacity-60 hover:opacity-100'
                    )}
                  >
                    <img
                      src={img.url_images}
                      alt={`Thumbnail ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {canManage && (
                      <span
                        role="button"
                        tabIndex={0}
                        title="Kelola gambar ini (jadikan produk baru / pindahkan)"
                        aria-label={`Kelola gambar ${idx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageAction({ open: true, imageUrl: img.url_images, index: idx });
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setImageAction({ open: true, imageUrl: img.url_images, index: idx }); } }}
                        className="absolute top-1 right-1 h-4 w-4 rounded-md bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 hover:bg-primary transition-all z-10 group-hover:opacity-100"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2 w-2" aria-hidden="true">
                          <circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" />
                          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                          <circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* INFO PANEL */}
        <div
          className={cn(
            'flex flex-col bg-card overflow-hidden min-w-0 flex-1 lg:flex-none relative z-10 transition-all duration-500',
            isFullScreen ? 'hidden' : 'lg:w-[40%]'
          )}
        >
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-5 sm:p-6 md:p-8 lg:p-9 space-y-6 md:space-y-7">
              {/* TITLE */}
              <div className="space-y-2.5 md:space-y-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-primary font-black tracking-[0.3em] uppercase text-[8px] md:text-[9px] block opacity-90">
                    {categoryNames}
                  </span>
                  <div className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-80">
                    <Eye size={11} className="text-primary" />{' '}
                    {formatCompactNumber(selected.views || 0)} TAYANGAN
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-[2.15rem] font-headline text-foreground tracking-tighter leading-[1.05] uppercase font-black break-words">
                  {selected.title}
                </h3>
                {selected.deskripsi && (
                  <p className="text-[10px] sm:text-[11px] md:text-[11px] text-muted-foreground leading-relaxed mt-2">
                    {selected.deskripsi}
                  </p>
                )}
              </div>

              {/* META */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 py-5 sm:py-6 md:py-7 border-y border-border/60">
                <div className="space-y-1.5">
                  <p className="text-[7px] sm:text-[8px] md:text-[8px] font-black uppercase text-muted-foreground tracking-[0.3em] opacity-80">
                    Harga
                  </p>
                  <p className="text-[14px] sm:text-[16px] md:text-[19px] font-black text-primary leading-none tracking-tight">
                    {formatPriceRange(selected.price || 0, selected.price_max)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[7px] sm:text-[8px] md:text-[8px] font-black uppercase text-muted-foreground tracking-[0.3em] opacity-80">
                    ID Konten
                  </p>
                  <p className="text-[14px] sm:text-[16px] md:text-[19px] font-black text-muted-foreground/40 leading-none tracking-tight">
                    VAPE-{selected.id}
                  </p>
                </div>
              </div>

              {/* SUB-CATEGORIES */}
              {selected.sub_categories && selected.sub_categories.length > 0 && (
                <div className="space-y-3 md:space-y-4">
                  <h4 className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid size={14} className="text-primary/40" /> VARIAN PRODUK
                  </h4>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {selected.sub_categories.map((sc: PostSubCategoryData) => (
                      <span
                        key={sc.id}
                        className="text-[8px] md:text-[9px] font-bold text-foreground uppercase px-3 py-2 md:px-3.5 md:py-2 rounded-lg md:rounded-xl bg-secondary border border-border transition-colors hover:bg-primary/20 cursor-default"
                      >
                        #{sc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* MANAGE BAR (hanya admin/developer) */}
          {canManage && (
            <div className="px-5 sm:p-6 md:p-8 pb-0 bg-background shrink-0">
              <KaryaManageBar
                post={{
                  id: selected.id,
                  title: selected.title,
                  is_active: (selected.is_active as boolean | undefined) ?? true,
                }}
                onChanged={onManagedChange}
                onDeleted={onManagedDelete}
                onEdit={onEdit ? () => onEdit(selected) : undefined}
              />
            </div>
          )}

          {/* ACTION BAR */}
          <div className="p-3 sm:p-4 md:p-6 bg-background border-t border-border/60 flex gap-2.5 sm:gap-3 md:gap-4 shrink-0 mt-auto">
            {onBookmarkToggle && isBookmarked && (
              <button
                onClick={() => onBookmarkToggle(selected.id.toString())}
                aria-label={isBookmarked(selected.id.toString()) ? `Hapus ${selected.title} dari favorit` : `Tambah ${selected.title} ke favorit`}
                className={cn(
                  'h-11 w-11 md:h-13 md:w-13 rounded-xl md:rounded-2xl transition-all shadow-lg flex items-center justify-center border shrink-0',
                  isBookmarked(selected.id.toString())
                    ? 'bg-primary text-white border-primary scale-105'
                    : 'bg-card text-primary border-border hover:bg-secondary'
                )}
              >
                <Star
                  size={20}
                  className={cn(isBookmarked(selected.id.toString()) && 'fill-white')}
                />
              </button>
            )}
            <Button
              asChild
              className="flex-1 bg-primary hover:opacity-90 text-white rounded-xl md:rounded-2xl h-11 md:h-13 text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl transition-all border-none group active:scale-95"
            >
              <a
                href="#"
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-4"
              >
                ORDER WHATSAPP{' '}
                <MessageCircle
                  size={20}
                  className="group-hover:rotate-12 transition-transform duration-500"
                />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* EDIT IN-PLACE (admin/dev) */}
      <InlineKaryaEditDialog
        post={editingPost}
        onOpenChange={(open) => { if (!open) setEditingPost(null); }}
        onSaved={() => {
          setEditingPost(null);
          onManagedChange?.();
        }}
      />

      {/* AKSI GAMBAR (jadikan produk baru / pindahkan) - admin/dev */}
      <ImageManageDialog
        open={imageAction.open && !!selected}
        onOpenChange={(open) => { if (!open) setImageAction((p) => ({ ...p, open: false })); }}
        post={selected ? { id: selected.id, title: selected.title } : null}
        imageUrl={imageAction.imageUrl}
        imageIndex={imageAction.index}
        imageCount={selected.images?.length ?? 0}
        onProductCreated={async (newPost) => {
          // Ambil nama kategori/subkategori agar editor (dibuka setelahnya)
          // langsung menampilkan pilihan yang sama seperti produk sumber.
          try {
            const [catRes, subRes] = await Promise.all([
              supabase.from('categories').select('id, name').in('id', newPost.category_ids),
              supabase.from('sub_categories').select('id, name').in('id', newPost.sub_category_ids),
            ]);
            setEditingPost({
              ...newPost,
              categories: (catRes.data || []) as PostCategoryData[],
              sub_categories: (subRes.data || []) as PostSubCategoryData[],
            } as PostDetailItem);
          } catch {
            setEditingPost(newPost as PostDetailItem);
          }
        }}
        onChanged={() => onManagedChange?.()}
      />
    </Dialog>
  );
};
