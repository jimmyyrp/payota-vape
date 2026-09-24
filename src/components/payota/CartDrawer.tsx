"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./cart-context";
import { formatIDR, checkoutWhatsappUrl } from "@/lib/cart";

export function CartDrawer() {
  const { items, count, subtotal, open, closeCart, setQty, remove } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closeCart]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[86]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 bg-[#0B0B0C] animate-fade-in"
      >
        <header className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-headline text-lg font-extrabold tracking-tight">Keranjang</h2>
            {count > 0 && (
              <span className="chip border border-white/10 bg-white/[0.04] text-muted-foreground">
                {count} {count === 1 ? "item" : "item"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Tutup keranjang"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground">
              <ShoppingBag className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <p className="font-headline text-lg font-extrabold tracking-tight">
                Keranjang masih kosong
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Jelajahi koleksi dan tambahkan produk favorit Anda di sini — tanpa perlu akun.
              </p>
            </div>
            <Link href="/catalog" onClick={closeCart} className="btn-primary gap-2">
              Lihat Koleksi
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0A0A0C]">
                    <Image
                      src="/default-product.webp"
                      alt={`${item.name} — gambar produk`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-primary">
                          {item.category}
                        </p>
                        <p className="mt-0.5 truncate font-headline text-[15px] font-bold tracking-tight">
                          {item.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`Hapus ${item.name}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-400/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-white/10">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          aria-label={`Kurangi jumlah ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          aria-label={`Tambah jumlah ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                      <p className="text-sm font-bold tabular-nums">
                        {formatIDR(item.priceNumber * item.qty)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t border-white/[0.07] px-5 py-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  Total
                </span>
                <span className="font-headline text-xl font-extrabold tracking-tight tabular-nums">
                  {formatIDR(subtotal)}
                </span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Pembayaran & pengiriman diatur langsung lewat WhatsApp.
              </p>
              <a
                href={checkoutWhatsappUrl(items)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 w-full"
              >
                Checkout via WhatsApp
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}