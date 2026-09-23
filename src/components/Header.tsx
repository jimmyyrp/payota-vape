'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Star, LayoutDashboard, UserCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { navLinks, siteConfig } from '@/data/site-data';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { BluLogo } from './Logo';
import { useBookmarks } from '@/hooks/use-bookmarks';

const LoginDialog = dynamic(
  () => import('./LoginDialog').then((mod) => mod.LoginDialog),
  { ssr: false }
);

const MobileNav = dynamic(
  () => import('./MobileNav').then((mod) => mod.MobileNav),
  { ssr: false }
);

/**
 * Header - DARK VAPE STORE
 */

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { bookmarks } = useBookmarks();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    const auth = typeof window !== 'undefined' ? localStorage.getItem('fee_admin_auth') : null;
    setIsLoggedIn(auth === 'true');
    if (searchParams?.get('login') === '1' && auth !== 'true') {
      setIsLoginOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('login');
      window.history.replaceState({}, '', url.toString());
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [searchParams]);

  const isHomePage = pathname === '/' || pathname === '';
  const shouldBeSolid = isHomePage ? scrolled : true;

  if (!mounted) return null;

  return (
    <div className="fixed top-0 w-full z-[200] transition-all duration-500">
      <nav className={cn(
        "w-full transition-all duration-500 px-4 md:px-8 lg:px-12",
        shouldBeSolid 
          ? "bg-background/95 backdrop-blur-xl py-1.5 border-b border-border/60 shadow-sm" 
          : "bg-transparent py-4 md:py-6"
      )}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between min-w-0">
          <div className="flex min-w-0 items-center gap-4 lg:gap-10">
            <Link href="/" className="hover:scale-105 transition-transform shrink-0">
              <BluLogo isScrolled={shouldBeSolid} />
            </Link>

            <div className="hidden lg:flex min-w-0 items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={cn(
                  "text-[9px] font-black uppercase tracking-[0.4em] transition-all relative group py-1.5",
                  shouldBeSolid ? "text-foreground/60 hover:text-foreground" : "text-white/80 hover:text-white drop-shadow-lg",
                  pathname === link.href && (shouldBeSolid ? "text-primary" : "text-white")
                )}>
                  {link.label}
                  <span className={cn(
                    "absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-500 group-hover:w-full",
                    pathname === link.href && "w-full"
                  )} />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <Link href="/favorit" aria-label="Favorit Saya" className={cn(
              "relative w-8 h-8 rounded-xl flex items-center justify-center transition-all border",
              shouldBeSolid ? "bg-card text-primary border-border hover:bg-secondary" : "bg-white/10 text-white border-white/10 backdrop-blur-xl shadow-lg"
            )}>
              <Star size={14} className={cn(bookmarks.length > 0 && "fill-primary text-primary")} />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[6px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-md border border-background">
                  {bookmarks.length}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <Button asChild variant="outline" className="rounded-xl w-8 h-8 p-0 border-border text-primary bg-card shadow-sm hover:bg-secondary">
                <Link href="/admin" aria-label="Panel Admin"><LayoutDashboard size={14} /></Link>
              </Button>
            ) : (
              <Button onClick={(e) => { (e.currentTarget as HTMLElement).blur(); setIsLoginOpen(true); }} variant="ghost" className={cn("rounded-xl w-8 h-8 p-0 transition-colors", shouldBeSolid ? "text-foreground/40 hover:text-foreground hover:bg-secondary" : "text-white/40 hover:text-white hover:bg-white/10")} aria-label="Login staff">
                <UserCircle size={18} />
              </Button>
            )}

            <div className="hidden md:flex items-center gap-2.5">
              <Button asChild className={cn(
                "rounded-full px-6 h-8 text-[8px] font-black uppercase tracking-[0.3em] shadow-md border-none active:scale-95",
                shouldBeSolid ? "bg-primary text-white hover:opacity-90" : "bg-white text-foreground hover:bg-white/90"
              )}>
                <a href={siteConfig.whatsapp} target="_blank">PESAN WA</a>
              </Button>
            </div>

            <MobileNav shouldBeSolid={shouldBeSolid} pathname={pathname || '/'} isLoggedIn={isLoggedIn} onLoginClick={() => setIsLoginOpen(true)} />
          </div>
        </div>

        <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      </nav>
    </div>
  );
};