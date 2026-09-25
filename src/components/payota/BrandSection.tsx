"use client";

import { Reveal } from "./Reveal";

const STATS = [
  ["08", "Koleksi"],
  ["24+", "Konsep desain"],
  ["04", "Kategori produk"],
] as const;

export function BrandSection() {
  return (
    <section id="about" className="container-px scroll-mt-24 py-24 lg:py-32" aria-label="Tentang PAYOTA">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary">
            Tentang PAYOTA
          </p>
          <h2
            className="mt-6 font-headline font-extrabold uppercase tracking-tighter"
            style={{ fontSize: "clamp(2.4rem, 6.5vw, 5rem)", lineHeight: 1.02 }}
          >
            Sedikit gangguan.
            <br />
            <span className="text-gradient">Lebih berkarakter.</span>
          </h2>
        </Reveal>

        <div className="flex flex-col justify-end">
          <Reveal delay={120}>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              PAYOTA adalah konsep kurasi modern yang berfokus pada desain yang matang, detail
              yang halus, dan pengalaman keseharian yang bersih. Setiap objek dalam lini ini
              disederhanakan menjadi hal yang benar-benar penting — lalu difinishing hingga mencapai
              standar yang pantas kami banggakan.
            </p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/[0.07] pt-8">
              {STATS.map(([num, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-headline text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl">
                    {num}
                  </dd>
                  <dd className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}