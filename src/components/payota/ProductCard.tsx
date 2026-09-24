"use client";

import { useState } from "react";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductImage } from "./ProductImage";
import { useCart } from "./cart-context";

export function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (p: Product) => void;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const quickAdd = () => {
    add(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="group relative flex flex-col">
      <button
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Lihat ${product.name}`}
        className="relative block w-full overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-[#0A0A0C] text-left transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-white/[0.16] group-hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9),0_0_40px_-16px_rgba(255,255,255,0.30)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
            <ProductImage product={product} className="h-full w-full" />
          </div>
          {product.badge && (
            <span className="absolute left-3 top-3 chip border border-white/10 bg-black/60 text-white backdrop-blur">
              {product.badge}
            </span>
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={quickAdd}
        aria-label={`Tambah ${product.name} ke keranjang`}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0D0D0D] text-foreground shadow-[0_12px_30px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-white/40 hover:scale-110 active:scale-95"
      >
        {added ? (
          <Check className="h-4 w-4 text-primary" aria-hidden />
        ) : (
          <Plus className="h-4 w-4" aria-hidden />
        )}
      </button>

      <div className="mt-5 flex flex-1 flex-col">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
          {product.category}
        </p>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <h3 className="font-headline text-lg font-bold tracking-tight text-foreground">
            {product.name}
          </h3>
          <ArrowUpRight
            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
            aria-hidden
          />
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
          {product.tagline}
        </p>
      </div>
    </article>
  );
}