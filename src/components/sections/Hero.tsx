'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Cigarette } from 'lucide-react';
import { heroData, siteConfig } from '@/data/site-data';
import Link from 'next/link';

/**
 * Hero - VAPE STORE DARK
 */

export const Hero = () => {
  const scrollToContent = () => {
    const statsSection = document.getElementById('stats-summary');
    if (statsSection) {
      statsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#09090F]"
    >
      <div className="absolute inset-0 z-0">
        <img
          src="/hero.webp"
          alt="Vape Store Katalog"
          width={1920}
          height={1080}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.30] animate-ken-burns transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-background" />
        <div className="absolute -top-24 right-0 w-[36rem] h-[36rem] bg-primary/25 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-24 left-0 w-[28rem] h-[28rem] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      </div>
      
      <div className="relative z-10 container px-6 pt-32 pb-24 text-center space-y-10 max-w-5xl mx-auto flex flex-col items-center">
        <div className="space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-3 animate-fade-up bg-white/10 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 shadow-2xl" style={{ animationDelay: '100ms' }}>
            <Cigarette size={12} className="text-primary fill-primary animate-pulse" />
            <span className="text-white font-black text-[7.5px] md:text-[8.5px] uppercase tracking-[0.8em]">VAPE STORE</span>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl lg:text-[4.8rem] font-headline font-black leading-[1.0] animate-fade-up tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] uppercase" 
            style={{ animationDelay: '300ms' }}
          >
            {heroData.title}
          </h1>
          
          <p 
            className="text-white/80 text-[12px] md:text-[14px] max-w-xl mx-auto font-medium leading-relaxed animate-fade-up italic drop-shadow-lg" 
            style={{ animationDelay: '500ms' }}
          >
            {heroData.subtitle}
          </p>
        </div>
        
        <div 
          className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 animate-fade-up w-full sm:w-auto" 
          style={{ animationDelay: '700ms' }}
        >
          <Button 
            asChild 
            className="bg-primary hover:opacity-90 text-white rounded-2xl px-12 h-14 text-[10px] font-black tracking-[0.4em] uppercase shadow-lg border-none group active:scale-95 w-full sm:w-auto"
          >
            <Link href="/layanan" className="flex items-center justify-center gap-4">
              KATALOG <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            asChild 
            className="bg-white/90 border-white text-foreground hover:bg-card hover:text-primary rounded-2xl px-12 h-14 text-[10px] font-black tracking-[0.4em] uppercase backdrop-blur-xl transition-all active:scale-95 w-full sm:w-auto shadow-2xl"
          >
            <a href={siteConfig.whatsapp} target="_blank" className="flex items-center justify-center gap-4">
              WHATSAPP <Send size={18} />
            </a>
          </Button>

          <button
            type="button"
            onClick={scrollToContent}
            className="hidden sm:flex items-center justify-center mt-2 h-10 w-6 text-white/60 hover:text-white transition-colors animate-bounce"
            aria-label="Scroll Down"
          >
            <span className="w-6 h-10 rounded-full border-2 border-white/40 flex justify-center p-2">
              <span className="w-1.5 h-1.5 bg-card rounded-full shadow-[0_0_10px_white]" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};