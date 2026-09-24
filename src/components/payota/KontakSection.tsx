"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, Instagram, MapPin, MessageCircle } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { CONTACT, whatsappUrlWithMessage } from "@/lib/contact";

const CARDS = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: CONTACT.whatsappDisplay,
    note: "Respon cepat selama jam buka",
    href: whatsappUrlWithMessage("Halo PAYOTA Solok, saya mau bertanya tentang produk."),
    action: "Chat Sekarang",
    external: true,
    accent: "#E4E4E7",
  },
  {
    icon: Clock,
    title: "Jam Buka",
    value: CONTACT.openLabel,
    note: CONTACT.openTime,
    href: CONTACT.whatsappUrl,
    action: "Tanya via WA",
    external: true,
    accent: "#FAFAFA",
  },
  {
    icon: MapPin,
    title: "Lokasi Toko",
    value: CONTACT.mapsLabel,
    note: "Arahkan dengan Google Maps",
    href: CONTACT.mapsUrl,
    action: "Buka Maps",
    external: true,
    accent: "#A1A1AA",
  },
  {
    icon: Instagram,
    title: "Instagram",
    value: `@${CONTACT.instagramHandle}`,
    note: "Update produk & koleksi terbaru",
    href: CONTACT.instagramUrl,
    action: "Ikuti Kami",
    external: true,
    accent: "#D4D4D8",
  },
];

export function KontakSection() {
  return (
    <section
      id="kontak"
      className="container-px scroll-mt-24 border-t border-white/[0.06] bg-[#0B0B0D] py-24 lg:py-32"
      aria-label="Kontak"
    >
      <SectionHeader
        kicker="Kontak"
        title="Mari Terhubung"
        right={
          <p className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:block">
            {CONTACT.openLabel} · {CONTACT.openTime}
          </p>
        }
      />

      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#0D0D0D] px-6 py-16 text-center md:px-16 md:py-16">
          <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
          <div
            className="absolute left-1/2 top-0 h-64 w-[560px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent)" }}
            aria-hidden
          />
          <div className="absolute inset-0 grain" aria-hidden />

          <div className="relative">
            <h3
              className="mx-auto max-w-xl font-headline font-extrabold uppercase tracking-tighter"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
            >
              Tanya produk, cek stok, atau pesan
            </h3>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Obrolan langsung dengan tim PAYOTA untuk konsultasi koleksi, ketersediaan, dan
              pengiriman — dibalas cepat di jam buka. Cerita & rilis terbaru ada di Instagram.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={whatsappUrlWithMessage(
                  "Halo PAYOTA Solok, saya mau tanya soal koleksi.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary h-12"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Chat WhatsApp
              </a>
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 px-7 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-white/30"
              >
                <Instagram className="h-4 w-4" aria-hidden />
                Ikuti Instagram
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-24">
        {CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 80}>
            <Link
              href={card.href}
              target={card.external ? "_blank" : undefined}
              rel={card.external ? "noopener noreferrer" : undefined}
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#0D0D0D] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16]"
            >
              <div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-[50px] transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `${card.accent}2b` }}
                aria-hidden
              />
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10"
                style={{ color: card.accent, background: `${card.accent}14` }}
              >
                <card.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
                {card.title}
              </p>
              <p className="mt-1.5 font-headline text-lg font-bold tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{card.note}</p>
              <span className="mt-auto flex items-center gap-1.5 pt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-primary">
                {card.action}
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}