'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star, Home, Images, Briefcase, HelpCircle,
  LayoutDashboard, LogIn, ChevronRight, Cigarette,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { navLinks, siteConfig } from '@/data/site-data';
import { BluLogo } from './Logo';

interface MobileNavProps {
  shouldBeSolid: boolean;
  pathname: string;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
}

/** Ikon per tautan navigasi utama (urutan sama dengan navLinks). */
const NAV_ICONS: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  '/': Home,
  '/layanan': Briefcase,
  '/karya': Images,
  '/bantuan': HelpCircle,
};

export const MobileNav: React.FC<MobileNavProps> = ({ shouldBeSolid, pathname, isLoggedIn = false, onLoginClick }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const openLogin = () => {
    setSheetOpen(false);
    window.setTimeout(() => onLoginClick?.(), 350);
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Buka menu navigasi"
          onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()}
          className={cn("lg:hidden rounded-xl h-8 w-8 border transition-colors", shouldBeSolid ? "text-primary border-border hover:bg-secondary" : "text-white border-white/20 bg-white/10 backdrop-blur-xl shadow-lg hover:bg-white/20")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="bg-background border-border p-0 w-[86%] max-w-[380px] sm:w-[380px] z-[250] flex flex-col">
        <div className="sr-only"><SheetTitle>Navigasi Utama</SheetTitle><SheetDescription>Akses layanan Vape Store.</SheetDescription></div>

        <div className="flex-1 overflow-y-auto px-6 pt-16 pb-6 flex flex-col gap-6">

          <div className="flex items-center gap-3.5 pb-5 border-b border-border/60">
            <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
              <BluLogo variant="footer" />
            </div>
            <div className="leading-none">
              <h2 className="text-base font-headline font-black text-foreground uppercase tracking-tight">Vape Store</h2>
              <p className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.35em] mt-1.5">Katalog Vape Terlengkap</p>
            </div>
          </div>

          <nav className="flex flex-col">
            {navLinks.map((link) => {
              const Icon = NAV_ICONS[link.href];
              const active = pathname === link.href;
              return (
                <SheetClose key={link.href} asChild>
                  <Link href={link.href} aria-current={active ? 'page' : undefined} className={cn(
                    "flex items-center gap-3.5 py-3 border-b border-border/40 transition-all group",
                    active ? "text-primary" : "text-foreground/70 hover:text-primary"
                  )}>
                    <span className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                      active ? "bg-primary/15 text-primary" : "bg-card text-foreground/40 group-hover:text-primary"
                    )}>
                      {Icon ? <Icon size={14} /> : <Star size={12} />}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">{link.label}</span>
                    {active && <Star size={9} className="ml-auto fill-primary text-primary" />}
                  </Link>
                </SheetClose>
              );
            })}

            <SheetClose asChild>
              <Link href="/favorit" className={cn(
                "flex items-center gap-3.5 py-3 transition-all group",
                pathname === '/favorit' ? "text-primary" : "text-foreground/70 hover:text-primary"
              )}>
                <span className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                  pathname === '/favorit' ? "bg-primary/15 text-primary" : "bg-card text-foreground/40 group-hover:text-primary"
                )}>
                  <Star size={14} />
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">Favorit Saya</span>
              </Link>
            </SheetClose>
          </nav>

          <div className="space-y-2">
            <p className="text-[7px] font-black text-muted-foreground/50 uppercase tracking-[0.4em] px-1">Akun Tim</p>
            {isLoggedIn ? (
              <SheetClose asChild>
                <Link href="/admin" className="flex items-center justify-between w-full h-12 px-4 bg-secondary border border-border rounded-2xl text-primary active:scale-[0.98] transition-transform">
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard size={15} />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Panel Admin</span>
                  </span>
                  <ChevronRight size={14} className="text-muted-foreground/40" />
                </Link>
              </SheetClose>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={(e) => { (e.currentTarget as HTMLElement).blur(); openLogin(); }}
                  className="flex items-center justify-between w-full h-12 px-4 bg-primary text-white rounded-2xl shadow-lg border-none active:scale-[0.98] transition-transform"
                >
                  <span className="flex items-center gap-2.5">
                    <LogIn size={15} />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Login Staff</span>
                  </span>
                  <ChevronRight size={14} className="text-white/50" />
                </Button>
                <p className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] px-1 leading-relaxed">
                  Khusus karyawan - masuk lewat ID pengguna dan kode akses.
                </p>
              </>
            )}
          </div>

          <div className="mt-auto space-y-3 pt-2">
            <SheetClose asChild>
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full h-[52px] bg-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.35em] shadow-lg active:scale-[0.98] transition-all group"
              >
                ORDER WHATSAPP <Cigarette size={14} className="ml-2.5 group-hover:rotate-180 transition-transform duration-700" />
              </a>
            </SheetClose>
            <p className="text-center text-[7px] font-bold text-muted-foreground/30 uppercase tracking-[0.45em]">Vape Store • {siteConfig.est}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};