"use client";

import { useState } from "react";
import { ArrowUpRight, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { useCart } from "./cart-context";
import { parsePrice, formatIDR, singleProductCheckoutUrl } from "@/lib/cart";

export function AddToCartPanel({ product }: { product: Product }) {
  const { add, openCart } = useCart();
  const [qty, setQty] = useState(1);

  const lineTotal = parsePrice(product.price) * qty;

  const handleAdd = () => {
    add(product, qty);
    openCart();
  };

  return (
    <div className="mt-10 max-w-lg rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-4">
        <div
          role="group"
          aria-label="Jumlah pesanan"
          className="flex items-center rounded-full border border-white/10 bg-[#0D0D0D]"
        >
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Kurangi jumlah"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <span className="min-w-[2rem] text-center font-headline text-lg font-bold tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            aria-label="Tambah jumlah"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <p className="font-headline text-xl font-extrabold tracking-tight tabular-nums">
          {formatIDR(lineTotal)}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={handleAdd} className="btn-primary flex-1">
          <ShoppingBag className="h-4 w-4" aria-hidden />
          Tambah ke Keranjang
        </button>
        <a
          href={singleProductCheckoutUrl({ ...product, qty })}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline flex-1"
        >
          Beli via WhatsApp
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Pesan tanpa akun — keranjang tersimpan otomatis di perangkat Anda, pembayaran & pengiriman
        diatur lewat WhatsApp.
      </p>
    </div>
  );
}