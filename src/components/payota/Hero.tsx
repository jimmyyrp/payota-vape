"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/data/products";

export function Hero({ featured }: { featured: Product | null }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden" aria-label="Hero">
      {/* Latar dekoratif */}
      <div className="absolute inset-0" aria-hidden>
        <Image
          src="/background.webp"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/70 via-[#080808]/40 to-[#080808]" />
        <div className="absolute inset-0 bg-grid opacity-[0.35]" />
        <div
          className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.10), transparent)" }}
        />
        <div
          className="absolute right-[-180px] top-1/3 h-[460px] w-[460px] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(closest-side, rgba(228,228,231,0.07), transparent)" }}
        />
        <div className="absolute inset-0 grain" />
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{ background: "linear-gradient(to top, hsl(0 0% 3.1%), transparent)" }}
        />
      </div>

      <div className="container-px relative grid min-h-screen items-center gap-14 pb-20 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-36">
        {/* Kiri: copy */}
        <div className="max-w-2xl">
          <span className="chip animate-fade-up border border-white/10 bg-white/[0.03] text-muted-foreground">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            Koleksi Terkurasi · 2026
          </span>

          <h1
            className="mt-7 animate-fade-up font-headline font-extrabold uppercase tracking-tighter"
            style={{
              fontSize: "clamp(2.1rem, 6vw, 5.15rem)",
              lineHeight: 0.98,
              animationDelay: "80ms",
            }}
          >
            Dirancang
            <br />
            untuk
            <br />
            <span className="text-gradient">keseharian.</span>
          </h1>

          <p
            className="mt-7 max-w-md animate-fade-up text-base leading-relaxed text-muted-foreground"
            style={{ animationDelay: "160ms" }}
          >
            Koleksi PAYOTA — rangkaian objek lifestyle premium yang dikurasi, dibangun dari detail
            yang halus, material yang tenang, dan desain yang disengaja. Tidak ada yang berlebihan.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <button type="button" onClick={() => scrollTo("collections")} className="btn-primary">
              Jelajahi Koleksi
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" onClick={() => scrollTo("featured")} className="btn-outline">
              Lihat Unggulan
            </button>
          </div>

          <dl
            className="mt-14 hidden max-w-md animate-fade-up grid-cols-3 gap-6 border-t border-white/[0.08] pt-7 sm:grid"
            style={{ animationDelay: "320ms" }}
          >
            {[
              ["08", "Koleksi"],
              ["24+", "Konsep desain"],
              ["04", "Kategori"],
            ].map(([num, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-headline text-2xl font-extrabold tracking-tight text-foreground">
                  {num}
                </dd>
                <dd className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Kanan: product render */}
        <div className="relative animate-scale-in" style={{ animationDelay: "200ms" }}>
          {featured ? (
            <div className="relative">
              <div
                className="absolute inset-0 -z-10 rounded-full blur-[120px]"
                style={{ background: "radial-gradient(circle, rgba(228,228,231,0.16), transparent 70%)" }}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
                <div className="relative aspect-video">
                  <Image
                    src="/hero.webp"
                    alt={`${featured.name} visual`}
                    fill
                    sizes="(min-width: 1024px) 42vw, 92vw"
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-[2rem] border border-white/[0.07] bg-[#0A0A0C]/80 text-muted-foreground">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
                Pratinjau koleksi
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}