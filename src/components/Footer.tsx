"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Instagram, MessageCircle, Music2, ArrowRight, Code, MapPin, Phone, Rocket, Globe, Cigarette } from 'lucide-react';
import { siteConfig } from '@/data/site-data';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { BluLogo } from './Logo';
import { useDeveloperInfo } from '@/hooks/use-developer-info';

/**
 * Footer - DARK VAPE STORE (responsive mobile & desktop).
 */

const NAVIGATION = [
  { label: 'Beranda', href: '/' },
  { label: 'Katalog Produk', href: '/layanan' },
  { label: 'Semua Produk', href: '/karya' },
  { label: 'Favorit Saya', href: '/favorit' },
];

const LEGAL = [
  { label: 'Syarat & Ketentuan', href: '/terms' },
  { label: 'Kebijakan Privasi', href: '/privacy' },
  { label: 'Pusat Bantuan', href: '/bantuan' },
];

const SOCIALS = [
  { label: 'Instagram', href: siteConfig.instagram, Icon: Instagram },
  { label: 'WhatsApp', href: siteConfig.whatsapp, Icon: MessageCircle },
  { label: 'TikTok', href: siteConfig.tiktok, Icon: Music2 },
];

export const Footer = () => {
  const { developer, whatsappLink } = useDeveloperInfo();
  const devWhatsapp = useMemo(
    () =>
      `${whatsappLink}?text=${encodeURIComponent(
        `Halo, saya ingin digitalisasi UMKM / membuat website. Mohon info selengkapnya dari ${developer.name}.`
      )}`,
    [whatsappLink, developer.name]
  );

  return (
    <footer className="pt-14 md:pt-20 pb-10 bg-background border-t border-border/60 font-body relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[110px] -mr-36 -mb-36 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 pb-12 border-b border-border/60">

          {/* Brand & Contact */}
          <div className="space-y-5">
            <div className="scale-90 origin-left">
              <BluLogo variant="footer" />
            </div>
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed max-w-[260px]">
              Katalog vape & liquid terpercaya sejak {siteConfig.est}. Menghadirkan perangkat pod, mod device, liquid premium, dan disposable original.
            </p>
            <div className="space-y-2.5">
              <p className="flex items-start gap-2.5 text-[10px] text-muted-foreground font-medium leading-relaxed">
                <MapPin size={14} className="text-primary/60 shrink-0 mt-0.5" />
                <span>{siteConfig.address}</span>
              </p>
              <a href={buildWhatsAppLink(siteConfig.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[10px] text-muted-foreground font-medium hover:text-primary transition-colors">
                <Phone size={14} className="text-primary/60 shrink-0" />
                <span>{siteConfig.phone}</span>
              </a>
            </div>
            <div className="flex gap-2.5 pt-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm group">
                  <Icon size={17} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigasi */}
          <div className="space-y-5">
            <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-70">Menu Navigasi</h2>
            <div className="grid grid-cols-1 gap-3">
              {NAVIGATION.map((link) => (
                <Link key={link.href} href={link.href}
                  className="group text-muted-foreground/80 hover:text-primary text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-125 transition-all" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Informasi */}
          <div className="space-y-5">
            <h2 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.5em] opacity-70">Informasi</h2>
            <div className="grid grid-cols-1 gap-3">
              {LEGAL.map((link) => (
                <Link key={link.href} href={link.href}
                  className="group text-muted-foreground/80 hover:text-primary text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-125 transition-all" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="bg-card border border-border rounded-[2rem] p-7 space-y-4 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-700">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-125 duration-1000 pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <h2 className="text-[10px] font-black text-primary uppercase tracking-widest">Pesan Sekarang</h2>
                <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic font-medium">
                  Cari device atau liquid? Tim kami siap membantu memilih produk yang sesuai kebutuhan Anda.
                </p>
                <a
                  href={siteConfig.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full gap-3 bg-primary text-white h-12 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95"
                >
                  ORDER WHATSAPP <ArrowRight size={14} />
                </a>
                <a
                  href={siteConfig.linktree}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full gap-2 h-10 rounded-2xl border border-border text-muted-foreground text-[9px] font-bold uppercase tracking-widest hover:bg-secondary transition-all"
                >
                  LIHAT SEMUA PRODUK
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA DIGITALISASI UMKM / PEMBUATAN WEBSITE */}
        <div className="mt-12 bg-secondary/60 border border-border rounded-[2.2rem] p-7 md:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full -mr-16 -mt-16 blur-[90px] pointer-events-none" />
          <div className="relative z-10 space-y-2.5 text-center lg:text-left">
            <h2 className="text-[11px] md:text-sm font-black text-primary uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shrink-0">
                <Rocket size={17} />
              </span>
              Go Digitalisasi UMKM
            </h2>
            <p className="text-[11px] md:text-[12px] text-muted-foreground/80 leading-relaxed max-w-xl italic font-medium">
              Ingin membuat website untuk bisnis, katalog online, atau halaman promosi UMKM? Developer kami
              (<span className="inline-flex items-center gap-1 font-bold not-italic"><Code size={11} /> {developer.name}</span>)
              siap membantu mewujudkannya secara profesional.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={devWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-3 bg-primary text-white min-h-[3.25rem] rounded-2xl px-7 text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl active:scale-95"
            >
              <MessageCircle size={15} /> HUBUNGI DEVELOPER <ArrowRight size={14} />
            </a>
            <Link
              href="/kontak"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2 min-h-[3.25rem] rounded-2xl px-7 border border-border text-muted-foreground text-[9px] font-bold uppercase tracking-widest hover:bg-secondary transition-all"
            >
              <Globe size={14} /> KONTAK KAMI
            </Link>
          </div>
        </div>

        <div className="pt-7 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground/60 font-bold text-center md:text-left flex items-center gap-1.5">
            <Cigarette size={11} className="rotate-180" />
            &copy; {new Date().getFullYear()} Vape Store
            <span className="hidden sm:inline"> • Katalog Vape & Liquid</span>
          </p>
          <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
            <Code size={12} className="text-primary" />
            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-[0.3em]">Arsitektur oleh {developer.name}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};