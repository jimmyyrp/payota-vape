
"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs, siteConfig } from '@/data/site-data';
import { Button } from '@/components/ui/button';
import { MessageCircle, MapPin, Globe, Smartphone, Download, Share, Sparkles } from 'lucide-react';

/**
 * HelpContactPage v148.0 - COMPACT & HIGH CONTRAST
 */

export default function HelpContactPage() {
  return (
    <div className="pt-24 md:pt-32 min-h-screen bg-background text-left selection:bg-primary/20 overflow-x-hidden">
      {/* Title Section */}
      <section className="pb-6 px-6 border-b border-border/60 mb-10">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
             <div className="flex items-center gap-3 text-primary mb-0.5">
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shadow-inner"><Sparkles size={16} /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">PUSAT INFORMASI</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-headline text-foreground tracking-tighter uppercase font-black">Bantuan & Kontak</h1>
          </div>
          <div className="px-5 py-1.5 rounded-full bg-secondary border border-border text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">
             RESPONS TERCEPAT
          </div>
        </div>
      </section>

      <section className="py-4 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-start">
            
            {/* Left Column: FAQ */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary/40">
                    <Globe size={14} />
                    <h2 className="text-[9px] font-black uppercase tracking-[0.4em]">TANYA JAWAB</h2>
                  </div>
                  <h3 className="text-xl font-headline text-foreground uppercase font-black tracking-tight">Informasi Umum</h3>
                </div>

                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border-none px-6 py-1 bg-card rounded-[1.8rem] shadow-sm hover:shadow-md transition-all group">
                      <AccordionTrigger className="text-left font-bold text-foreground hover:no-underline text-[11px] md:text-[12px] uppercase tracking-[0.1em] py-5 group-data-[state=open]:text-primary transition-colors">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground font-medium text-[11px] md:text-[12px] leading-relaxed pb-6 italic border-t border-border/60 pt-4 mt-1">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* PWA Section */}
              <div id="pwa-guide" className="space-y-6 pt-12 border-t border-border/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary/40">
                    <Smartphone size={14} />
                    <h2 className="text-[9px] font-black uppercase tracking-[0.4em]">APLIKASI DIGITAL</h2>
                  </div>
                  <h3 className="text-xl font-headline text-foreground uppercase font-black tracking-tight">Panduan Instalasi</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card p-6 rounded-[2rem] space-y-3 border border-border shadow-sm">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <Download size={14} className="text-primary" /> Android / Chrome
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic">
                      Buka menu browser dan pilih <span className="font-black text-primary">"Instal Aplikasi"</span> untuk akses instan ke katalog Vape Store.
                    </p>
                  </div>
                  <div className="bg-card p-6 rounded-[2rem] space-y-3 border border-border shadow-sm">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <Share size={14} className="text-primary" /> iPhone / Safari
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic">
                      Klik ikon <Share size={10} className="inline" /> dan pilih <span className="font-black text-primary">"Add to Home Screen"</span> untuk ikon cepat di layar.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contact */}
            <div className="space-y-10 lg:sticky lg:top-40 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary/40">
                  <MessageCircle size={14} />
                  <h2 className="text-[9px] font-black uppercase tracking-[0.4em]">KONSULTASI</h2>
                </div>
                <h3 className="text-xl font-headline text-foreground uppercase font-black tracking-tight">Hubungi Tim Kami</h3>
              </div>
              
              <div className="grid gap-6">
                <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-border space-y-4 group hover:shadow-xl transition-all duration-700">
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform"><MessageCircle size={20} /></div>
                  <div className="space-y-1">
                    <h4 className="font-black text-foreground text-[10px] uppercase tracking-[0.4em]">Layanan WhatsApp</h4>
                    <p className="text-primary/80 text-[13px] font-bold tracking-widest">{siteConfig.phone}</p>
                  </div>
                </div>
                
                <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-border space-y-4 group hover:shadow-xl transition-all duration-700">
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
                  <div className="space-y-1">
                    <h4 className="font-black text-foreground text-[10px] uppercase tracking-[0.4em]">Alamat Toko</h4>
                    <p className="text-muted-foreground text-[12px] font-medium leading-relaxed italic">{siteConfig.address}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full bg-primary hover:opacity-90 text-white rounded-[2rem] h-16 shadow-2xl transition-all text-[11px] font-black uppercase tracking-[0.4em] active:scale-95 border-none group">
                  <a href={siteConfig.whatsapp} target="_blank" className="flex items-center justify-center gap-4">
                    MULAI KONSULTASI <MessageCircle size={18} className="group-hover:rotate-12 transition-transform" />
                  </a>
                </Button>
                <p className="text-center text-[9px] text-muted-foreground/50 font-bold uppercase tracking-[0.5em] mt-6 italic">EST {siteConfig.est}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="pb-24" />
    </div>
  );
}
