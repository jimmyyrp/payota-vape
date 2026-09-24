"use client";

import { SearchX, PackageX } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-12 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onOpen={onOpen} />
      ))}
    </div>
  );
}

export function EmptyState({
  searching,
  onReset,
}: {
  searching: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-[#0D0D0D] px-6 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-muted-foreground">
        {searching ? (
          <SearchX className="h-6 w-6" aria-hidden />
        ) : (
          <PackageX className="h-6 w-6" aria-hidden />
        )}
      </div>
      <h3 className="mt-6 text-xl">
        {searching ? "Tidak ada hasil" : "Belum ada produk di koleksi ini"}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {searching
          ? "Tidak ada yang cocok dengan pencarian Anda. Coba kata kunci atau kategori lain."
          : "Coba kategori lain, atau kembali lagi nanti — koleksi selalu berkembang."}
      </p>
      <button type="button" onClick={onReset} className="btn-outline mt-8">
        Reset filter
      </button>
    </div>
  );
}