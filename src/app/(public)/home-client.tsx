'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Hero } from '@/components/sections/Hero';
import { supabase } from '@/lib/supabase';
import { fetchAllPosts } from '@/lib/queries';

import { CategoryPreview } from '@/components/home/CategoryPreview';
import { VisionSection } from '@/components/home/VisionSection';
import { RecentWorks } from '@/components/home/RecentWorks';
import { CommitmentSection } from '@/components/home/CommitmentSection';
import { InlineKaryaEditDialog } from '@/components/inline-karya-edit-dialog';
import type { Post, Category } from '@/lib/types';

interface CategoryWithCover extends Category {
  coverImage: string;
}

/**
 * HomePage v1.0 - Vape Store
 * Kategori berdasarkan produk dengan foto terbaru, produk pilihan, dan komitmen layanan.
 */

export default function HomePage() {

  const [categories, setCategories] = useState<CategoryWithCover[]>([]);
  const [recentWorks, setRecentWorks] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGlobalData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const [allPosts, catRes] = await Promise.all([
        fetchAllPosts(),
        supabase.from('categories').select('*').is('is_active', true).order('name'),
      ]);

      if (allPosts.length > 0) {
        const sorted = [...allPosts].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setRecentWorks(sorted.slice(0, 12));
      } else {
        setRecentWorks([]);
      }

      if (catRes.data) {
        const filteredCategories = catRes.data
          .map((cat) => {
            const match = allPosts.find((p) =>
              (p.categories || []).some((pc) => pc.id === cat.id) &&
              p.images && p.images.length > 0
            );
            return { ...cat, coverImage: match?.images?.[0]?.url_images || null };
          })
          .filter((cat): cat is CategoryWithCover => cat.coverImage !== null);
        setCategories(filteredCategories);
      }
    } catch (e) {
      console.error("Home Load Error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalData(true);
  }, [fetchGlobalData]);

  const handleWorkDeleted = (postId: number | string) => {
    setRecentWorks((prev) => prev.filter((work) => String(work.id) !== String(postId)));
  };

  return (
    <div className="flex flex-col bg-background selection:bg-primary/20 font-body overflow-x-hidden">
      <main className="flex-1">
        <Hero />

        <CategoryPreview categories={categories} loading={loading} />
        <VisionSection />
        <RecentWorks works={recentWorks} onRefresh={fetchGlobalData} onDelete={handleWorkDeleted} onEdit={(post) => setEditingPost(post)} />
        <InlineKaryaEditDialog
          post={editingPost}
          onOpenChange={(open) => { if (!open) setEditingPost(null); }}
          onSaved={() => {
            setEditingPost(null);
            void fetchGlobalData();
          }}
        />
        <CommitmentSection />
      </main>
    </div>
  );
}