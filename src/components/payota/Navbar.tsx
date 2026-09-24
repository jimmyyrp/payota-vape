"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Menu, X, CornerDownLeft, User, ShoppingBag } from "lucide-react";
import { useCatalog } from "./catalog-context";
import { useCart } from "./cart-context";
import { CartDrawer } from "./CartDrawer";
import { LoginForm } from "@/app/admin/login/login-form";

const NAV_LINKS = [
  { label: "Koleksi", href: "/#collections" },
  { label: "Katalog", href: "/catalog" },
  { label: "Tentang", href: "/#about" },
  { label: "Kontak", href: "/#kontak" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10">
        <Image
          src="/favicon_io/android-chrome-192x192.png"
          alt="Logo PAYOTA"
          fill
          sizes="36px"
          className="object-cover"
          priority
        />
      </span>
      <span className="font-headline text-xl font-extrabold tracking-[0.32em] text-foreground">
        PAYOTA
      </span>
    </span>
  );
}

/**
 * Modal login admin — membuka form dari header tanpa perlu pindah halaman.
 */
function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div role="dialog" aria-modal="true" aria-label="Masuk admin" className="relative w-full max-w-sm animate-fade-up">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup login"
          className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0D0D0D] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <LoginForm autoFocus />
      </div>
    </div>
  );
}

/**
 * Panel pencarian yang muncul saat ikon search diklik.
 */
function SearchOverlay() {
  const { query, setQuery, searchOpen, closeSearch } = useCatalog();
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = query.trim().length > 0;

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSearch]);

  if (!searchOpen) return null;

  const submit = () => {
    closeSearch();
    document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[80] animate-fade-in border-b border-white/10 bg-[#080808]/90 backdrop-blur-2xl">
      <div className="container-px">
        <div className="flex h-[72px] items-center gap-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Cari koleksi..."
            aria-label="Cari koleksi"
            className="h-full flex-1 bg-transparent font-headline text-lg font-semibold tracking-tight text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {visible && (
            <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Cari langsung
            </span>
          )}
          {visible && (
            <button
              type="button"
              onClick={submit}
              className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/10 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-white/30"
            >
              <CornerDownLeft className="h-3.5 w-3.5" aria-hidden />
              Cari
            </button>
          )}
          <button
            type="button"
            onClick={closeSearch}
            aria-label="Tutup pencarian"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const { searchOpen, openSearch } = useCatalog();
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const elevated = scrolled || menuOpen || searchOpen;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[70]">
        <div
          className={`flex h-[72px] items-center border-b transition-all duration-300 ${
            elevated
              ? "border-white/10 bg-[#080808]/85 backdrop-blur-2xl"
              : "border-transparent bg-transparent"
          }`}
        >
          <div className="container-px flex w-full items-center justify-between">
            <Link href="/" aria-label="PAYOTA home">
              <Logo />
            </Link>

            <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
              {NAV_LINKS.map((link) => {
                const active = link.href === "/catalog" && pathname.startsWith("/catalog");
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative text-[11px] font-bold uppercase tracking-[0.22em] transition-colors ${
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={openCart}
                aria-label="Buka keranjang belanja"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                <ShoppingBag className="h-[18px] w-[18px]" aria-hidden />
                {count > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold leading-none text-primary-foreground tabular-nums">
                    {count}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                aria-label="Masuk admin"
                title="Masuk admin"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                <User className="h-[18px] w-[18px]" aria-hidden />
              </button>
              <button
                type="button"
                onClick={openSearch}
                aria-label="Buka pencarian"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
              >
                <Search className="h-[18px] w-[18px]" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Buka menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground lg:hidden"
              >
                <Menu className="h-[18px] w-[18px]" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <CartDrawer />

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[95] lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute inset-x-0 top-0 transform border-b border-white/10 bg-[#0D0D0D] transition-transform duration-300 ease-out ${
            menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="container-px flex h-[72px] items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-white/[0.06]"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <nav className="container-px flex flex-col gap-1 pb-8 pt-2" aria-label="Mobile">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`group flex items-center justify-between border-b border-white/[0.06] py-4 font-headline text-2xl font-bold tracking-tight text-foreground transition-colors hover:text-primary animate-fade-up`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {link.label}
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </Link>
            ))}
            <p className="pt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              PAYOTA — Gaya Hidup Premium
            </p>
          </nav>
        </div>
      </div>
    </>
  );
}