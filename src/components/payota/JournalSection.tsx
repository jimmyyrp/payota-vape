"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";

const POSTS = [
  {
    index: "01",
    tag: "Desain",
    title: "Seni Bentuk Minimal",
    accent: "#E4E4E7",
    gradient: "linear-gradient(150deg, rgba(255,255,255,0.10), rgba(8,8,8,0) 65%)",
  },
  {
    index: "02",
    tag: "Gaya Hidup",
    title: "Dirancang untuk Momen Keseharian",
    accent: "#A1A1AA",
    gradient: "linear-gradient(150deg, rgba(255,255,255,0.07), rgba(8,8,8,0) 65%)",
  },
  {
    index: "03",
    tag: "Studio",
    title: "Di Balik Koleksi PAYOTA",
    accent: "#D4D4D8",
    gradient: "linear-gradient(150deg, rgba(161,161,170,0.16), rgba(8,8,8,0) 65%)",
  },
];

export function JournalSection() {
  return (
    <section id="journal" className="scroll-mt-24 border-y border-white/[0.06] bg-[#0B0B0D] py-24 lg:py-32">
      <div className="container-px">
        <SectionHeader kicker="Jurnal" title="Cerita dari studio" />

        <div className="grid gap-8 md:grid-cols-3">
          {POSTS.map((post, i) => (
            <Reveal key={post.index} delay={i * 100}>
              <article className="group cursor-pointer">
                <div
                  className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-white/[0.07]"
                  style={{ background: "#0A0A0C" }}
                >
                  <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
                  <div className="absolute inset-0" style={{ background: post.gradient }} aria-hidden />
                  <div
                    className="absolute -bottom-6 -right-4 font-headline text-[9rem] font-extrabold leading-none text-white/[0.05] transition-all duration-500 group-hover:text-white/[0.09]"
                    aria-hidden
                  >
                    {post.index}
                  </div>
                  <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-foreground opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                      {post.tag}
                    </p>
                    <h3 className="mt-2 font-headline text-xl font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}