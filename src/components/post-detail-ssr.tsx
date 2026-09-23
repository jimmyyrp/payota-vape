'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice, formatPriceRange } from '@/lib/formatters';
import { getSiteUrl, buildProductWhatsAppUrl, toAbsoluteUrl } from '@/lib/whatsapp';
import { siteConfig } from '@/data/site-data';
import { parseImgIndex } from '@/lib/url-utils';
import { cn } from '@/lib/utils';
import { useStaffAuth } from '@/hooks/use-staff-auth';
import { useTrackPostView } from '@/hooks/use-track-post-view';
import { KaryaManageFab } from '@/components/karya-manage-fab';
import { InlineKaryaEditDialog } from '@/components/inline-karya-edit-dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

// ============================================
// TYPES
// ============================================

interface PostImage {
  url_images: string;
  urutan?: number;
}

interface PostCategory {
  name: string;
}

interface PostSubCategory {
  name: string;
}

export interface PostDetailData {
  id: number | string;
  title: string;
  deskripsi?: string;
  gambar_thumbnail?: string;
  price?: number;
  price_max?: number | null;
  is_active?: boolean;
  categories?: PostCategory[];
  sub_categories?: PostSubCategory[];
  product_images?: PostImage[];
}

interface PostDetailSSRProps {
  post: PostDetailData | null;
  backHref: string;
  backLabel: string;
  pageTitlePrefix: string;
  metaType?: 'website' | 'article';
}

// ============================================
// COMPONENT
// ============================================

export function PostDetailSSR({
  post,
  backHref,
  backLabel,
  pageTitlePrefix,
}: PostDetailSSRProps) {
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center p-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-headline text-primary">{pageTitlePrefix} Tidak Ditemukan</h1>
          <Button asChild className="bg-primary rounded-full px-8 h-12 text-[10px] font-bold uppercase tracking-widest">
            <Link href={backHref}>Kembali</Link>
          </Button>
        </div>
      </div>
    );
  }

  const safePostImages = Array.isArray(post.product_images)
    ? post.product_images.filter((img) => !!img?.url_images)
    : [];
  const categoryNames = (post.categories || []).map((c) => c.name).join(' • ') || 'KOLEKSI VAPE';

  const displayImages = safePostImages.length > 0
    ? safePostImages
    : [{ url_images: '/favicon_io/apple-touch-icon.png' }];
  const siteUrl = getSiteUrl();
  const detailUrl = `${siteUrl}${backHref}/${encodeURIComponent(String(post.id))}`;

  const router = useRouter();
  const { canManage } = useStaffAuth();
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [editingPost, setEditingPost] = useState<{
    id: number | string;
    title: string;
    price?: number;
    deskripsi?: string;
    gambar_thumbnail?: string;
    is_active?: boolean;
    images?: { url_images: string }[];
  } | null>(null);

  // Hanya render carousel setelah mount agar startIndex (dari ?img=N) bisa
  // dihitung dari URL tanpa menyebabkan hydration mismatch dan tanpa race
  // scroll-to-bisa-gagal pada HP lambat. Embla langsung inisialisasi di slide target.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tambah jumlah tayangan sekali per sesi per produk (anti-spam via sessionStorage).
  useTrackPostView(mounted ? post?.id : null);

  const getRequestedImageIndex = () => {
    if (typeof window === 'undefined') return 0;
    const params = new URLSearchParams(window.location.search);
    const idx = parseImgIndex(params.get('img'));
    return idx >= 0 && idx < displayImages.length ? idx : 0;
  };

  const requestedImageIndex = mounted ? getRequestedImageIndex() : 0;

  useEffect(() => {
    if (!api) return;
    const targetIndex = requestedImageIndex;
    if (targetIndex !== api.selectedScrollSnap()) {
      api.scrollTo(targetIndex);
    }
    setCurrentSlide(api.selectedScrollSnap());
    const handleSelect = () => {
      const snap = api.selectedScrollSnap();
      setCurrentSlide(snap);
      // Jaga URL ?img= selaras dengan slide aktif agar link berbagi = screenshot asli.
      if (snap > 0 && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const next = String(snap + 1);
        if (url.searchParams.get('img') !== next) {
          url.searchParams.set('img', next);
          router.replace(url.pathname + url.search, { scroll: false });
        }
      }
    };
    api.on('select', handleSelect);
    return () => {
      api.off('select', handleSelect);
    };
  }, [api, requestedImageIndex, router]);

  // Compute WhatsApp URL at click time directly from Embla API — guarantees
  // the image matches exactly what the user sees at the moment of clicking.
  const handleWhatsAppClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const idx = (api?.selectedScrollSnap() ?? 0);
      const safeIdx = idx >= 0 && idx < displayImages.length ? idx : 0;
      const imageUrl = toAbsoluteUrl(displayImages[safeIdx].url_images, siteUrl);
      const shareDetailUrl = safeIdx > 0 ? `${detailUrl}?img=${safeIdx + 1}` : detailUrl;
      const url = buildProductWhatsAppUrl({
        title: post.title,
        detailUrl: shareDetailUrl,
        imageUrl,
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('[KaryaDetail] gagal membuka WhatsApp share:', err);
      window.location.href = `${siteConfig.whatsapp}?text=${encodeURIComponent(`Halo, saya mau tanya tentang ${post.title}`)}`;
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-background">
      {/* TOMBOL KELOLA (hanya admin/developer) —
          aksi (duplikat/arsip/tayang/ubah) memicu router.refresh() agar data
          langsung mutakhir; hapus akan mengarahkan keluar ke backHref. */}
      <KaryaManageFab
        postId={post.id}
        postTitle={post.title}
        postIsActive={(post.is_active ?? true)}
        onActionComplete={() => router.refresh()}
        onDeleted={() => router.push(backHref)}
        onEdit={() => setEditingPost({
          id: post.id,
          title: post.title,
          price: post.price,
          deskripsi: post.deskripsi,
          gambar_thumbnail: post.gambar_thumbnail,
          is_active: post.is_active ?? true,
          images: (post.product_images || []).map((i) => ({ url_images: i.url_images })),
        })}
      />

      {/* EDIT IN-PLACE (admin/dev) */}
      <InlineKaryaEditDialog
        post={editingPost}
        onOpenChange={(open) => { if (!open) setEditingPost(null); }}
        onSaved={() => {
          setEditingPost(null);
          router.refresh();
        }}
      />

      <div className="container mx-auto px-6 max-w-7xl py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="text-primary hover:bg-primary/5 text-[10px] font-bold uppercase tracking-widest gap-2 p-0 h-auto">
            <Link href={backHref} className="flex items-center gap-2">
              <ArrowLeft size={16} /> {backLabel}
            </Link>
          </Button>

          {/* MODE KELOLA (admin/developer): status aktif + pintu menuju pengaturan */}
          {canManage && (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-2 animate-fade-up">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground">Mode Kelola</span>
              <span className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest',
                (post.is_active ?? true) ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              )}>
                <span className={cn('h-1.5 w-1.5 rounded-full', (post.is_active ?? true) ? 'bg-success' : 'bg-warning')} />
                {(post.is_active ?? true) ? 'Tayang' : 'Draf'}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground/50">edit, duplikat, status & hapus tersedia lewat tombol ⋮</span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row bg-card rounded-[3.5rem] overflow-hidden border border-border shadow-4xl text-left">
          {/* IMAGE CAROUSEL */}
          <div className="lg:w-1/2 relative min-h-[300px] sm:min-h-[400px] bg-secondary flex items-center justify-center">
            {!mounted ? (
              <img
                src={displayImages[0]?.url_images ?? ''}
                alt={post.title}
                className="absolute inset-0 h-full w-full object-contain p-4 sm:p-6 lg:p-8 opacity-40"
              />
            ) : (
              <>
                <Carousel setApi={setApi} opts={{ startIndex: requestedImageIndex, loop: displayImages.length > 1 }} className="w-full h-full">
                  <CarouselContent>
                    {displayImages.map((img: PostImage, idx: number) => (
                      <CarouselItem key={idx} className="relative h-[300px] sm:h-[400px] lg:h-[600px] flex items-center justify-center">
                        <div className="relative w-full h-full">
                          {idx === 0 ? (
                            <img
                              src={img.url_images}
                              alt={post.title}
                              loading="eager"
                              decoding="async"
                              fetchPriority="high"
                              className="absolute inset-0 h-full w-full object-contain p-4 sm:p-6 lg:p-8"
                            />
                          ) : (
                            <img
                              src={img.url_images}
                              alt={`${post.title} - Foto ${idx + 1}`}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 h-full w-full object-contain p-4 sm:p-6 lg:p-8"
                            />
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {displayImages.length > 1 && (
                    <>
                      <CarouselPrevious className="left-3 sm:left-4 h-10 w-10 md:h-11 md:w-11 rounded-xl md:rounded-2xl" />
                      <CarouselNext className="right-3 sm:right-4 h-10 w-10 md:h-11 md:w-11 rounded-xl md:rounded-2xl" />
                    </>
                  )}
                </Carousel>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="absolute top-3 right-3 z-40 h-10 w-10 rounded-xl bg-black/40 text-white border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl"
                  aria-label="Tutup detail visual"
                >
                  <ArrowRight size={16} className="rotate-45" />
                </button>

                {displayImages.length > 1 && (
                  <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-40 px-3 sm:px-6">
                    <div className="mx-auto flex w-fit max-w-[95%] items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-1.5 backdrop-blur-xl no-scrollbar">
                      {displayImages.map((img: PostImage, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => api?.scrollTo(idx)}
                          className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 ${currentSlide === idx ? 'border-primary' : 'border-white/20 opacity-70'}`}
                          aria-label={`Gambar ${idx + 1}`}
                        >
                          <img src={img.url_images} alt={`${post.title} - Foto ${idx + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* INFO PANEL */}
          <div className="lg:w-1/2 p-10 lg:p-14 lg:h-[600px] lg:flex lg:flex-col overflow-y-auto no-scrollbar">
            <div className="space-y-8 flex-1">
            <div className="space-y-2 text-left">
              <span className="text-primary font-black tracking-[0.4em] uppercase text-[9px] block">
                {categoryNames}
              </span>
              <h1 className="text-3xl font-headline text-foreground tracking-tighter leading-tight uppercase font-bold">
                {post.title}
              </h1>
              {post.deskripsi && (
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  {post.deskripsi}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 py-6 border-y border-border/60">
              <div className="space-y-0.5">
                <p className="text-[7px] font-black uppercase text-muted-foreground tracking-[0.4em]">Harga</p>
                <p className="text-[13px] font-black text-primary">{formatPriceRange(post.price || 0, post.price_max)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[7px] font-black uppercase text-muted-foreground tracking-[0.4em]">ID Konten</p>
                <p className="text-[13px] font-black text-muted-foreground/40">VAPE-{post.id}</p>
              </div>
            </div>
            </div>

            <Button asChild className="w-full bg-primary hover:opacity-90 text-white rounded-2xl h-12 md:h-14 text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] shadow-3xl border-none active:scale-95 transition-all lg:mt-auto mt-8">
              <a
                href="#"
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-3"
              >
                ORDER WHATSAPP <MessageCircle size={18} />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
