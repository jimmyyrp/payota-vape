'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Cigarette } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { siteConfig } from '@/data/site-data';

export const VisionSection = () => {
  return (
    <section className="py-16 md:py-20 px-6 bg-secondary/30 border-y border-border/60">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="space-y-6 text-left">
            <div className="space-y-4">
              <span className="inline-block px-5 py-2 rounded-full bg-primary/10 text-primary font-black text-[8px] uppercase tracking-[0.5em] border border-primary/20">EST {siteConfig.est}</span>
              <h2 className="text-4xl md:text-6xl font-headline font-black text-foreground tracking-tighter leading-[1.0] uppercase">
                Proteksi Terbaik Untuk
                <span className="text-primary"> Pengalaman Vaping Anda.</span>
              </h2>
            </div>
            <p className="text-muted-foreground text-[13px] md:text-[14px] leading-relaxed italic font-medium border-l-2 border-primary/20 pl-6">
              "Dari pod system hingga liquid premium, kami menyediakan perangkat original dengan harga yang bersahabat."
            </p>
            <div className="pt-2">
              <Button asChild className="bg-primary hover:opacity-90 text-white rounded-[1.5rem] h-14 px-10 text-[10px] font-black uppercase tracking-widest shadow-2xl border-none group active:scale-95 transition-all">
                <Link href="/karya" className="flex items-center gap-4">JELAJAHI VAPE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" /></Link>
              </Button>
            </div>
          </div>

          <div className="relative group">
            <div className="aspect-video relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-card bg-card transition-all duration-1000 group-hover:shadow-3xl">
              <img src="/hero.webp" alt="Vape Store" width={1920} height={1080} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-1000" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};