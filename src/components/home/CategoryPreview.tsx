
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CategoryPreviewProps {
  categories: { id: number; name: string; coverImage: string | null }[];
  loading: boolean;
}

export const CategoryPreview = ({ categories, loading }: CategoryPreviewProps) => {
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="container mx-auto max-w-7xl">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="text-center md:text-left space-y-1">
            <span className="text-primary font-black text-[9px] uppercase tracking-[0.6em]">PILIHAN UTAMA</span>
            <h2 className="text-3xl md:text-5xl font-headline font-black text-foreground uppercase tracking-tighter">Katalog Kategori</h2>
            </div>
            <Button asChild variant="ghost" className="text-primary/40 hover:text-primary hover:bg-primary/5 text-[10px] font-black uppercase tracking-[0.3em] gap-2 p-0 h-auto group">
               <Link href="/layanan" className="flex items-center">LIHAT SEMUA <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
         </div>

         {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/5] rounded-[1.8rem] bg-secondary animate-pulse" />)}
            </div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {categories.slice(0, 12).map((cat) => (
                 <Link key={cat.id} href={`/karya?category=${cat.id}`} className="group relative aspect-[4/5] rounded-[1.8rem] overflow-hidden bg-card border border-border shadow-sm transition-all duration-1000 hover:shadow-2xl hover:-translate-y-1">
                     {cat.coverImage && (
                       <img src={cat.coverImage} alt={cat.name} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                     )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-6 left-6 right-6">
                       <h4 className="text-white font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] leading-tight">{cat.name}</h4>
                    </div>
                 </Link>
               ))}
            </div>
         )}
      </div>
    </section>
  );
};
