"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowUpRight, ShoppingBag, X } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductImage } from "./ProductImage";
import { useCart } from "./cart-context";
import { singleProductCheckoutUrl } from "@/lib/cart";

export function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { add, openCart } = useCart();
  return (
    <Dialog.Root open={!!product} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[110] w-[calc(100vw-32px)] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-white/10 bg-[#0D0D0D] shadow-[0_60px_160px_-40px_rgba(0,0,0,1)] outline-none max-h-[calc(100vh-40px)] overflow-y-auto"
          aria-describedby={undefined}
        >
          {product && (
            <>
              <Dialog.Title className="sr-only">{product.name}</Dialog.Title>
              <div className="grid md:grid-cols-2">
              <div className="relative border-b border-white/[0.07] bg-[#0A0A0C] md:border-b-0 md:border-r">
                <div
                  className="absolute inset-0 blur-[90px]"
                  style={{ background: "radial-gradient(circle, rgba(228,228,231,0.16), transparent 70%)" }}
                  aria-hidden
                />
                <div className="relative aspect-square">
                  <ProductImage product={product} className="h-full w-full" />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup produk"
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-foreground backdrop-blur transition-colors hover:bg-black/80"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <div className="flex flex-col p-7 md:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                  {product.category}
                </p>
                <h3 className="mt-3 font-headline text-3xl font-extrabold tracking-tight md:text-4xl">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{product.price}</p>

                <p className="mt-6 text-[15px] leading-relaxed text-foreground/90">
                  {product.description}
                </p>

                <div className="mt-8">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                    Spesifikasi
                  </p>
                  <dl className="mt-4 divide-y divide-white/[0.07] border-t border-b border-white/[0.07]">
                    {product.specs.map((spec) => (
                      <div key={spec.label} className="flex items-center justify-between py-3">
                        <dt className="text-xs text-muted-foreground">{spec.label}</dt>
                        <dd className="text-sm font-semibold text-foreground">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-auto pt-9">
                  <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        add(product, 1);
                        onClose();
                        openCart();
                      }}
                      className="btn-primary w-full"
                    >
                      <ShoppingBag className="h-4 w-4" aria-hidden />
                      Tambah ke Keranjang
                    </button>
                    <a
                      href={singleProductCheckoutUrl({ ...product, qty: 1 })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline w-full"
                    >
                      Beli via WhatsApp
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-inactive group w-full"
                  >
                    <ArrowLeft
                      className="h-4 w-4 transition-transform group-hover:-translate-x-1"
                      aria-hidden
                    />
                    Kembali ke koleksi
                  </button>
                </div>
              </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}