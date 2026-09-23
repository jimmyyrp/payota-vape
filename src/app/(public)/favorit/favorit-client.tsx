"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useTrackPostView } from '@/hooks/use-track-post-view';
import Link from 'next/link';
import { Trash2, Bookmark, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAllPosts } from '@/lib/queries';
import { formatCompactNumber } from '@/lib/formatters';
import { PostDetailDialog } from '@/components/post-detail-dialog';
import type { PostDetailItem } from '@/components/post-detail-dialog';
import { KaryaManageChip } from '@/components/karya-manage-chip';
import { InlineKaryaEditDialog } from '@/components/inline-karya-edit-dialog';

/**
 * FavoritesPage - Halaman produk favorit pengguna dengan detail dialog.
 */

export default function FavoritesPage() {
  const { bookmarks, toggleBookmark, isBookmarked, mounted } = useBookmarks();
  const [savedPosts, setSavedPosts] = useState<PostDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PostDetailItem | null>(null);
  const [editingPost, setEditingPost] = useState<PostDetailItem | null>(null);

  const reload = useCallback(async () => {
    if (!mounted) return;
    if (bookmarks.length === 0) {
      setSavedPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Sumber tunggal fetch lengkap dengan loop .range() di lib/queries.
      const all = (await fetchAllPosts()) as unknown as PostDetailItem[];
      const filtered = all
        .filter((p) => bookmarks.includes(p.id.toString()))
        .sort((a, b) => Number(b.id) - Number(a.id));
      setSavedPosts(filtered);
    } finally {
      setLoading(false);
    }
  }, [mounted, bookmarks]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleTracked = useCallback(() => {
    if (!selected) return;
    const id = selected.id;
    setSavedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, views: (p.views || 0) + 1 } : p))
    );
  }, [selected]);

  useTrackPostView(mounted ? selected?.id : null, handleTracked);

  if (!mounted) return null;

  return (
    <div className="pt-20 min-h-screen bg-background text-left flex flex-col selection:bg-primary/20 overflow-x-hidden">
      <section className="container mx-auto px-6 max-w-7xl flex-1 pb-24">
        <div className="pt-16 pb-4 text-left border-b border-border/60 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-0.5">
            <span className="text-primary font-black tracking-[0.5em] uppercase text-[8px] block">KOLEKSI PRIBADI</span>
            <h1 className="text-3xl md:text-5xl font-headline text-foreground tracking-tighter uppercase font-black leading-none">Produk Favorit</h1>
          </div>
          <div className="px-5 py-2 rounded-full bg-secondary border border-border text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">
            TOTAL {savedPosts.length} PRODUK TERPANTAU
          </div>
        </div>

        <div className="min-h-[60vh]">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary/10" />
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground">Sinkronisasi Arsip...</p>
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-8 text-center bg-card rounded-[3.5rem] border border-border shadow-inner">
              <div className="w-14 h-14 bg-secondary rounded-[1.5rem] flex items-center justify-center text-muted-foreground shadow-inner">
                <Bookmark size={24} />
              </div>
              <p className="text-muted-foreground font-light text-[11px] uppercase tracking-[0.4em] italic">Daftar favorit Anda masih kosong.</p>
              <Button asChild variant="outline" className="rounded-full px-10 h-11 text-[9px] font-black uppercase tracking-[0.4em] border-border hover:bg-secondary text-foreground">
                <Link href="/karya">MULAI EKSPLORASI</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-12">
              {savedPosts.map((p) => (
                <div key={p.id} className="group flex flex-col gap-3.5 relative cursor-pointer animate-fade-up" onClick={() => setSelected(p)}>
                  <div className="relative aspect-[3/4] rounded-[2.2rem] overflow-hidden border border-border bg-card shadow-sm transition-all duration-700 hover:shadow-2xl hover:-translate-y-1.5">
                    <img
                      src={p.images?.[0]?.url_images || "/favicon_io/apple-touch-icon.png"}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(p.id.toString()); }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 bg-destructive/100/90 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all border-none"
                    >
                      <Trash2 size={14} />
                    </button>
                    {/* CHIP KELOLA (admin/developer): dropdown aksi inline */}
                    <div className="absolute top-3 left-3 z-20">
                      <KaryaManageChip
                        postId={p.id}
                        postTitle={p.title}
                        postIsActive={(p.is_active as boolean | undefined) ?? true}
                        onEdit={() => setEditingPost(p)}
                        onActionComplete={() => void reload()}
                        onDeleteComplete={(id) => {
                          setSavedPosts((prev) => prev.filter((x) => x.id.toString() !== id.toString()));
                          if (selected?.id.toString() === id.toString()) setSelected(null);
                        }}
                      />
                    </div>
                    <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-xl px-2.5 py-1 rounded-lg text-[6.5px] text-white font-black uppercase tracking-[0.2em] border border-white/10 max-w-[70%] truncate z-10">
                      {(p.categories || []).map((c) => c.name).join(' • ')}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-xl px-2 py-0.5 rounded-lg text-[7px] text-white font-black uppercase tracking-widest border border-white/10 z-10 flex items-center gap-1.5">
                      <Eye size={10} /> {formatCompactNumber(p.views || 0)}
                    </div>
                  </div>
                  <h3 className="text-[11px] md:text-[12px] font-black text-foreground uppercase tracking-widest line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SHARED DETAIL DIALOG */}
      <PostDetailDialog
        selected={selected}
        onOpenChange={(v) => { if (!v) setSelected(null); }}
        onBookmarkToggle={toggleBookmark}
        isBookmarked={isBookmarked}
      />

      {/* INLINE EDIT (admin/developer) */}
      <InlineKaryaEditDialog
        post={editingPost}
        onOpenChange={(open) => { if (!open) setEditingPost(null); }}
        onSaved={() => {
          setEditingPost(null);
          void reload();
        }}
      />
    </div>
  );
}
