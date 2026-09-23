
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, ChevronRight, Cigarette } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchAllPosts } from '@/lib/queries';
import Link from 'next/link';
import { formatPrice } from '@/lib/formatters';
import type { Post, SubCategory } from '@/lib/types';

/**
 * ServicesPage - VAPE STORE KATALOG KATEGORI
 */

export default function ServicesPage() {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [products, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: subRes } = await supabase
          .from('sub_categories')
          .select('*, categories(name)')
          .is('deleted_at', null)
          .order('name');

        const allPosts = await fetchAllPosts();

        if (subRes) setSubCategories((subRes || []) as SubCategory[]);
        setPosts(allPosts);
      } catch (err) {
        console.error("Katalog Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const subCategoryData = useMemo(() => {
    if (subCategories.length === 0) return [];
    
    return subCategories
      .map(sub => {
        const relatedPosts = products.filter(p => 
          (p.sub_categories || []).some((sc: any) => sc.id === sub.id)
        );
        const featuredPost = relatedPosts.length > 0 ? relatedPosts[0] : null;
        return { ...sub, featuredPost, count: relatedPosts.length };
      })
      .filter(item => item.count > 0) as (SubCategory & { featuredPost: Post | null; count: number })[];
  }, [subCategories, products]);

  return (
    <div className="pt-20 min-h-screen bg-background text-left selection:bg-primary/20 overflow-x-hidden">
      
      {/* PAGE HEADER */}
      <section className="container mx-auto px-6 max-w-7xl pt-16 pb-6 border-b border-border/60 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
           <div className="flex items-center gap-2 text-primary mb-1">
              <Cigarette size={16} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em]">KOLEKSI VAPE</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-headline text-foreground tracking-tighter uppercase font-black">Katalog Produk</h1>
        </div>
        <div className="px-6 py-2 rounded-full bg-secondary border border-border text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
           {subCategoryData.length} VARIAN AKTIF
        </div>
      </section>

      <section className="container mx-auto px-6 max-w-7xl pb-24">
        <div className="min-h-[50vh]">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Sinkronisasi Katalog...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-12">
              {subCategoryData.map((sub) => (
                <Link 
                  key={sub.id} 
                  href={`/karya?sub_category=${sub.id}`}
                  className="group flex flex-col gap-3 relative animate-fade-up"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-card border border-border shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-1.5">
                    <img
                      src={sub.featuredPost?.images?.[0]?.url_images || "/favicon_io/apple-touch-icon.png"}
                      alt={sub.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-0 transition-opacity" />
                    <div className="absolute bottom-5 left-5 right-5 space-y-1 z-10">
                      <p className="text-[7px] font-black text-white/60 uppercase tracking-[0.4em] leading-none">HARGA MULAI</p>
                      <p className="text-[11px] md:text-[12px] font-black text-white uppercase tracking-tight leading-none truncate">{formatPrice(sub.price || 0)}</p>
                    </div>
                  </div>
                  <div className="px-2 space-y-1 text-left">
                    <h3 className="text-[11px] md:text-[12px] font-black text-foreground uppercase tracking-widest leading-tight truncate group-hover:text-primary transition-colors">{sub.name}</h3>
                    <div className="inline-flex items-center gap-1.5 text-[8px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] group-hover:text-primary transition-all">LIHAT PRODUK <ChevronRight size={10} /></div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
