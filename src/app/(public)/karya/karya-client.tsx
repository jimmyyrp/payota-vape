'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Search, Star, Loader2, ChevronDown, Check, Eye, ArrowUpDown, ChevronUp, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useTrackPostView } from '@/hooks/use-track-post-view';
import { supabase } from '@/lib/supabase';
import { fetchAllPosts } from '@/lib/queries';
import { parseImgIndex } from '@/lib/url-utils';
import { formatCompactNumber, formatFullNumber, formatPriceRange } from '@/lib/formatters';
import type { PostDetailItem } from '@/components/post-detail-dialog';
import { KaryaManageChip } from '@/components/karya-manage-chip';
import { InlineKaryaEditDialog } from '@/components/inline-karya-edit-dialog';

const PostDetailDialog = dynamic(
  () => import('@/components/post-detail-dialog').then((mod) => mod.PostDetailDialog),
  { ssr: false }
);

/**
 * ErrorBoundary sederhana: mencegah crash pada PostDetailDialog
 * merusak seluruh halaman galeri karya.
 */
interface EBProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
interface EBState {
  hasError: boolean;
}
class DialogErrorBoundary extends React.Component<EBProps, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(): EBState { return { hasError: true }; }
  componentDidCatch(err: Error) { console.error('PostDetailDialog error:', err); }
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

/**
 * KaryaPage - Galeri Karya dengan filter, search, bookmark, dan detail dialog.
 * Search & filter state synced to URL params for persistence on refresh.
 */

const ITEMS_PER_PAGE = 24;

interface CategoryData {
  id: number;
  name: string;
}

interface SubCategoryData {
  id: number;
  name: string;
  category_id: number;
}

function KaryaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<PostDetailItem[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  /* Sync state from URL params */
  const [search, setSearch] = useState(() => searchParams?.get('q') || '');
  const [selectedCats, setSelectedCats] = useState<number[]>(() => {
    const cat = searchParams?.get('category');
    return cat ? [parseInt(cat)] : [];
  });
  const [subCategoryFilter, setSubCategoryFilter] = useState<number | null>(() => {
    const sub = searchParams?.get('sub_category');
    return sub ? parseInt(sub) : null;
  });
  const [sortOrder, setSortOrder] = useState<'newest' | 'popular'>(() => {
    return (searchParams?.get('sort') as 'newest' | 'popular') || 'newest';
  });
  const [selected, setSelected] = useState<PostDetailItem | null>(null);
  // Indeks gambar (0-based) yang tampil saat detail dibuka, sinkron dengan ?img=
  const [initialImageIndex, setInitialImageIndex] = useState(0);
  const [editingPost, setEditingPost] = useState<PostDetailItem | null>(null);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(searchParams?.get('page') || '1', 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });

  const gotoPage = useCallback((page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { toggleBookmark, isBookmarked, mounted } = useBookmarks();

  /* Push filter state to URL without reload */
  const updateURL = useCallback((params: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    }
    const newSearch = url.pathname + url.search;
    router.replace(newSearch, { scroll: false });
  }, [router]);

  /* Debounce search input to URL */
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({ q: search || null });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, updateURL]);

  /* Sync category filter to URL */
  useEffect(() => {
    updateURL({ category: selectedCats.length === 1 ? String(selectedCats[0]) : null });
  }, [selectedCats, updateURL]);

  /* Sync sort to URL */
  useEffect(() => {
    updateURL({ sort: sortOrder !== 'newest' ? sortOrder : null });
  }, [sortOrder, updateURL]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, subCatRes, allPosts] = await Promise.all([
        supabase.from('categories').select('id, name').is('is_active', true).order('name'),
        supabase.from('sub_categories').select('id, name, category_id').is('deleted_at', null).order('name'),
        fetchAllPosts().then((rows) => rows as unknown as PostDetailItem[]),
      ]);
      setItems(allPosts as PostDetailItem[]);
      setCategories((catRes.data || []) as CategoryData[]);
      setSubCategories((subCatRes.data || []) as SubCategoryData[]);

      /* Open detail if URL has ?id= */
      const postId = searchParams?.get('id');
      if (postId) {
        const target = allPosts.find((p) => p.id.toString() === postId);
        if (target) {
          setInitialImageIndex(parseImgIndex(searchParams?.get('img')));
          setSelected(target);
        }
      }
    } catch (err) {
      console.error('Gagal memuat data karya:', err);
      setItems([]);
      setCategories([]);
      setSubCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let result = items.filter((item) => {
      const matchSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase());
      const itemCatIds = (item.categories || []).map((c) => c.id);
      const matchCat = selectedCats.length === 0 || selectedCats.some((id) => itemCatIds.includes(id));
      const matchSub = subCategoryFilter === null || (item.sub_categories || []).some((sc) => sc.id === subCategoryFilter);
      return matchSearch && matchCat && matchSub;
    });
    if (sortOrder === 'popular') result = [...result].sort((a, b) => (b.views || 0) - (a.views || 0));
    else result = [...result].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime() || Number(b.id) - Number(a.id));

    return result;
  }, [search, selectedCats, subCategoryFilter, sortOrder, items]);

  /* Subkategori yang ditampilkan di filter: bila tepat 1 kategori dipilih, batasi ke subkategori kategori tsb */
  const subCatOptions = useMemo(() => {
    if (selectedCats.length === 1) {
      return subCategories.filter((sc) => sc.category_id === selectedCats[0]);
    }
    return subCategories;
  }, [subCategories, selectedCats]);

  /* Sinkronkan subkategori terpilih agar tetap valid terhadap kategori terpilih */
  useEffect(() => {
    if (subCategoryFilter === null) return;
    const stillValid = subCatOptions.some((sc) => sc.id === subCategoryFilter);
    if (!stillValid && subCatOptions.length > 0) {
      setSubCategoryFilter(null);
    }
  }, [subCatOptions, subCategoryFilter]);

  /* Sync sub category filter to URL */
  useEffect(() => {
    updateURL({ sub_category: subCategoryFilter === null ? null : String(subCategoryFilter) });
  }, [subCategoryFilter, updateURL]);

  /* --- PAGINATION --- */
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)),
    [filtered.length]
  );

  /* Reset ke halaman 1 saat pencarian/filter/urutan berubah.
     Tapi JANGAN pada render pertama, agar halaman aktif (mis. ?page=6)
     tetap bertahan saat refresh/reload. */
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [search, selectedCats, subCategoryFilter, sortOrder]);

  /* Sync halaman aktif ke URL */
  useEffect(() => {
    updateURL({ page: currentPage > 1 ? String(currentPage) : null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  /* Pastikan halaman selalu valid bila total halaman menyusut.
     Hanya jalankan saat data selesai dimuat (loading=false), karena saat
     loading totalPages masih 1 dan akan salah me-reset ?page=6 ke 1. */
  useEffect(() => {
    if (loading) return;
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages, loading]);

  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const pageStartNum = filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEndNum = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  /* Deret nomor halaman (windowed) agar tetap ringkas di mobile */
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    const sorted = Array.from(pages).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const withGaps: (number | '…')[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) withGaps.push('…');
      withGaps.push(p);
      prev = p;
    }
    return withGaps;
  }, [totalPages, currentPage]);

  useTrackPostView(mounted ? selected?.id : null);

  if (!mounted) return null;

  return (
    <div className="pt-20 min-h-screen bg-background text-left selection:bg-primary/20 overflow-x-hidden relative">
      {/* HEADER */}
      <section className="px-6 pt-16 pb-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-left space-y-1">
            <span className="text-primary font-black text-[9px] uppercase tracking-[0.5em] block">KATALOG PRODUK</span>
            <h1 className="text-4xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tighter">Katalog Produk</h1>
          </div>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <section className="py-2 px-6 bg-background/95 sticky top-[52px] z-[80] backdrop-blur-xl border-y border-border/60 shadow-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center min-w-0">
            <div className="relative w-full min-w-0 lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="CARI PRODUK..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-secondary border-none rounded-xl pl-11 pr-4 h-11 text-[16px] md:text-[10px] font-bold uppercase md:tracking-widest outline-none shadow-inner text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto min-w-0 overflow-x-auto no-scrollbar">
              <Popover modal={false}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 rounded-xl border-none text-[9px] font-bold uppercase tracking-widest px-6 shadow-sm transition-all shrink-0",
                      selectedCats.length > 0 ? "bg-primary text-white" : "bg-card text-foreground"
                    )}
                  >
                    {selectedCats.length === 1
                      ? (categories.find((c) => c.id === selectedCats[0])?.name || 'KATEGORI')
                      : selectedCats.length > 1
                        ? `${selectedCats.length} KATEGORI`
                        : 'KATEGORI'} <ChevronDown size={12} className="ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 rounded-[2rem] border-border shadow-5xl bg-card overflow-hidden mt-3 z-[300]">
                  <div className="p-4 bg-primary text-white text-[9px] font-black uppercase tracking-widest text-center">FILTER KATEGORI</div>
                  <ScrollArea className="h-64 p-3">
                    <div className="space-y-1">
                      {/* SEMUA KATEGORI — reset filter */}
                      <button
                        onClick={() => { setSelectedCats([]); }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                          selectedCats.length === 0
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "hover:bg-secondary text-muted-foreground border-transparent"
                        )}
                      >
                        SEMUA KATEGORI {selectedCats.length === 0 && <Check size={12} />}
                      </button>
                      <div className="border-t border-border/60 my-2" />
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCats((prev) => prev.includes(c.id) ? prev.filter((i) => i !== c.id) : [...prev, c.id]); }}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                            selectedCats.includes(c.id) ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-secondary text-muted-foreground border-transparent"
                          )}
                        >
                          {c.name} {selectedCats.includes(c.id) && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <Popover modal={false}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 rounded-xl border-none text-[9px] font-bold uppercase tracking-widest px-6 shadow-sm transition-all shrink-0",
                      subCategoryFilter !== null ? "bg-primary text-white" : "bg-card text-foreground"
                    )}
                  >
                    {subCategoryFilter !== null
                      ? subCatOptions.find((sc) => sc.id === subCategoryFilter)?.name || 'SUBKATEGORI'
                      : 'SUBKATEGORI'} <ChevronDown size={12} className="ml-2" />
                  </Button>
                </PopoverTrigger>
<PopoverContent className="w-64 p-0 rounded-[2rem] border-border shadow-5xl bg-card overflow-hidden mt-3 z-[300]">
                    <div className="p-4 bg-primary text-white text-[9px] font-black uppercase tracking-widest text-center">
                      {selectedCats.length === 1 ? `SUBKATEGORI ${selectedCats.length} KATEGORI` : 'FILTER SUBKATEGORI'}
                    </div>
                    {subCatOptions.length === 0 ? (
                      <div className="p-6 text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        {selectedCats.length > 0 ? 'Kategori dipilih belum punya subkategori' : 'Tidak ada subkategori'}
                      </div>
                    ) : (
                      <ScrollArea className="h-64 p-3">
                        <div className="space-y-1">
                          {/* SEMUA SUBKATEGORI — reset filter */}
                          <button
                            onClick={() => setSubCategoryFilter(null)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                              subCategoryFilter === null
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "hover:bg-secondary text-muted-foreground border-transparent"
                            )}
                          >
                          SEMUA SUBKATEGORI {subCategoryFilter === null && <Check size={12} />}
                        </button>
                        <div className="border-t border-border/60 my-2" />
                        {subCatOptions.map((sc) => (
                          <button
                            key={sc.id}
                            onClick={() => { setSubCategoryFilter((prev) => (prev === sc.id ? null : sc.id)); }}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                              subCategoryFilter === sc.id ? "bg-primary/10 text-primary shadow-sm" : "hover:bg-secondary text-muted-foreground"
                            )}
                          >
                            {sc.name} {subCategoryFilter === sc.id && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </PopoverContent>
              </Popover>
              <Button
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'popular' : 'newest')}
                variant="outline"
                className="h-11 rounded-xl border-none text-[9px] font-bold uppercase tracking-widest px-5 shadow-sm shrink-0 bg-card text-foreground"
              >
                {sortOrder === 'newest' ? 'TERBARU' : 'POPULER'} <ArrowUpDown size={12} className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY GRID */}
      <section className="px-6 pt-10 pb-24 min-h-[60vh]">
        <div className="container mx-auto max-w-7xl">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground">Menyusun Katalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-40 text-center bg-card rounded-[3rem] border border-dashed border-border">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">Produk Tidak Ditemukan</p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-12">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col gap-3.5 relative cursor-pointer animate-fade-up"
                  onClick={() => { setInitialImageIndex(0); setSelected(item); }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[2.2rem] bg-card border border-border shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-1.5">
                    <img
                      src={item.images?.[0]?.url_images || "/favicon_io/apple-touch-icon.png"}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 z-20">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(item.id.toString()); }}
                        aria-label={isBookmarked(item.id.toString()) ? `Hapus ${item.title} dari favorit` : `Tambah ${item.title} ke favorit`}
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center transition-all backdrop-blur-xl border border-white/20 shadow-lg",
                          isBookmarked(item.id.toString()) ? "bg-primary text-white scale-110" : "bg-white/30 text-primary hover:bg-white/50"
                        )}
                      >
                        <Star size={14} className={cn(isBookmarked(item.id.toString()) && "fill-white")} />
                      </button>
                    </div>
                    {/* CHIP KELOLA (admin/developer): dropdown aksi inline */}
                    <div className="absolute top-3 left-3 z-20">
                      <KaryaManageChip
                        postId={item.id}
                        postTitle={item.title}
                        postIsActive={(item.is_active as boolean | undefined) ?? true}
                        onEdit={() => setEditingPost(item)}
                        onActionComplete={() => fetchData()}
                      />
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-xl px-2 py-0.5 rounded-lg text-[7.5px] text-white font-black uppercase tracking-widest border border-white/10 z-20 flex items-center gap-1.5 shadow-lg">
                      <Eye size={10} /> {formatCompactNumber(item.views || 0)}
                    </div>
                  </div>
                  <div className="px-1.5">
                    <h2 className="text-[11px] md:text-[12px] font-black text-foreground uppercase tracking-widest line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    {(item.price ?? 0) > 0 && (
                      <p className="text-[10px] font-black text-primary uppercase tracking-wider mt-1">
                        {formatPriceRange(item.price ?? 0, item.price_max)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filtered.length > ITEMS_PER_PAGE && (
              <div className="flex flex-col items-center gap-4 mt-12">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
                  Menampilkan {formatFullNumber(pageStartNum)}–{formatFullNumber(pageEndNum)} dari {formatFullNumber(filtered.length)} produk
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => gotoPage(currentPage - 1)}
                    aria-label="Halaman sebelumnya"
                    className="h-11 px-4 rounded-xl border-none text-[10px] font-black uppercase tracking-widest shadow-sm bg-card text-foreground disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={14} />
                  </Button>

                  {pageNumbers.map((p, idx) =>
                    p === '…' ? (
                      <span key={`gap-${idx}`} className="px-1 text-[10px] font-black text-muted-foreground">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => gotoPage(p)}
                        aria-current={p === currentPage ? 'page' : undefined}
                        className={cn(
                          "h-11 min-w-11 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95",
                          p === currentPage
                            ? "bg-primary text-white border-primary shadow-2xl scale-105"
                            : "bg-card text-foreground border-transparent hover:bg-secondary shadow-sm"
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <Button
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => gotoPage(currentPage + 1)}
                    aria-label="Halaman berikutnya"
                    className="h-11 px-4 rounded-xl border-none text-[10px] font-black uppercase tracking-widest shadow-sm bg-card text-foreground disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      {/* SCROLL TO TOP — andal di HP karena page bisa digulir pendek */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          aria-label="Kembali ke atas"
          className="fixed bottom-6 right-6 z-[70] h-12 w-12 rounded-2xl bg-primary text-white shadow-2xl border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <ChevronUp size={22} strokeWidth={3} />
        </button>
      )}

      {/* SHARED DETAIL DIALOG (dynamically loaded, wrapped in error boundary) */}
      <DialogErrorBoundary>
        <PostDetailDialog
          selected={selected}
          onOpenChange={(v) => { if (!v) { setSelected(null); setInitialImageIndex(0); updateURL({ id: null, img: null }); } }}
          onBookmarkToggle={toggleBookmark}
          isBookmarked={isBookmarked}
          initialImageIndex={initialImageIndex}
          onSlideChange={(idx) => {
            setInitialImageIndex(idx);
            updateURL({ id: selected?.id ? String(selected.id) : null, img: idx > 0 ? String(idx + 1) : null });
          }}
          onManagedChange={() => { fetchData(); }}
          onManagedDelete={() => {
            setSelected(null);
            updateURL({ id: null, img: null });
            void fetchData();
          }}
          onEdit={(post) => setEditingPost(post)}
        />
      </DialogErrorBoundary>
      <InlineKaryaEditDialog
        post={editingPost as PostDetailItem | null}
        onOpenChange={(open) => { if (!open) setEditingPost(null); }}
        onSaved={() => {
          setEditingPost(null);
          void fetchData();
        }}
      />
    </div>
  );
}

export default function KaryaPage() {
  return (
    <Suspense fallback={<div className="pt-48 text-center text-[10px] uppercase font-black text-muted-foreground animate-pulse tracking-[0.6em]">Menghubungkan Server...</div>}>
      <KaryaContent />
    </Suspense>
  );
}
