"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/data/products";
import { ProductImage } from "./ProductImage";
import { Reveal } from "./Reveal";

export function FeaturedProduct({ product }: { product: Product | null }) {
  if (!product) return null;

  return (
    <section id="featured" className="scroll-mt-24 border-y border-white/[0.06] bg-[#0B0B0D]" aria-label="Produk unggulan">
      <div className="container-px grid items-center gap-12 py-24 lg:grid-cols-2 lg:gap-20 lg:py-32">
        <Reveal className="relative order-2 lg:order-1">
          <div
            className="absolute inset-0 -z-10 rounded-full blur-[130px]"
            style={{ background: product.glowSoft }}
            aria-hidden
          />
          <div className="overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#0A0A0C]">
            <div className="aspect-[4/5]">
              <ProductImage product={product} className="h-full w-full" />
            </div>
          </div>
          <div
            className="absolute -right-3 bottom-6 hidden rounded-full border border-white/10 bg-[#0D0D0D]/90 px-5 py-3 backdrop-blur md:block"
            aria-hidden
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              Edisi bernomor
            </p>
            <p className="mt-0.5 font-headline text-sm font-bold text-foreground">
              Unggulan · {new Date().getFullYear()}
            </p>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary">Unggulan</p>
            <h2
              className="mt-5 font-headline font-extrabold uppercase tracking-tighter"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
            >
              {product.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{product.tagline}</p>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <dl className="mt-8 grid max-w-md grid-cols-2 gap-x-8 gap-y-5 border-t border-white/[0.07] pt-7">
              {product.specs.slice(0, 4).map((spec) => (
                <div key={spec.label}>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <Link href={`/product/${product.id}`} className="btn-primary group mt-10">
              Lihat Detail
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}