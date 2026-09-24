"use client";

import { MessageCircle, Instagram, Clock, MapPin, ArrowUpRight } from "lucide-react";
import { CONTACT, whatsappUrlWithMessage } from "@/lib/contact";
import { Reveal } from "./Reveal";

/**
 * Band "Tetap Terhubung" — bukan newsletter email (tidak ada infrastruktur
 * mailer). Kontak langsung via WhatsApp + Instagram + info jam & lokasi.
 */
export function Newsletter() {
  return (
    <section className="container-px py-24 lg:py-32" aria-label="Kontak dan ikuti PAYOTA">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#0D0D0D] px-6 py-16 text-center md:px-16 md:py-20">
          <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
          <div
            className="absolute left-1/2 top-0 h-64 w-[560px] -translate-x-1/2 rounded-full blur-[120px]"
            style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.08), transparent)" }}
            aria-hidden
          />
          <div className="absolute inset-0 grain" aria-hidden />

          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-primary">
              Tetap Terhubung
            </p>
            <h2
              className="mx-auto mt-5 max-w-xl font-headline font-extrabold uppercase tracking-tighter"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
            >
              Tanya produk, cek stok, atau pesan
            </h2>
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

            <div className="mx-auto mt-8 flex max-w-lg flex-col items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:flex-row sm:gap-6">
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
                {CONTACT.openLabel} · {CONTACT.openTime}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-white/20 sm:block" aria-hidden />
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
                {CONTACT.mapsLabel}
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}