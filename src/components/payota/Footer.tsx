"use client";

import Link from "next/link";
import { CONTACT, whatsappUrlWithMessage } from "@/lib/contact";

const GROUPS = [
  {
    heading: "Jelajahi",
    links: [
      { label: "Koleksi", href: "/#collections" },
      { label: "Katalog", href: "/catalog" },
      { label: "Tentang", href: "/#about" },
      { label: "Jurnal", href: "/#journal" },
    ],
  },
  {
    heading: "Perusahaan",
    links: [
      { label: "Tentang", href: "/#about" },
      { label: "Kontak", href: "/#kontak" },
      { label: "WhatsApp", href: whatsappUrlWithMessage("Halo PAYOTA Solok, saya mau bertanya."), external: true },
      { label: "Lokasi Toko", href: CONTACT.mapsUrl, external: true },
    ],
  },
  {
    heading: "Sosial",
    links: [
      { label: "Instagram", href: CONTACT.instagramUrl, external: true },
      { label: "Lokasi", href: CONTACT.mapsUrl, external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#0A0A0C]">
      <div className="container-px grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:py-20">
        <div>
          <span className="font-headline text-lg font-extrabold tracking-[0.32em] text-foreground">
            PAYOTA
          </span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Gaya Hidup Premium. Koleksi objek keseharian yang dikurasi, dirancang dengan kesederhanaan
            dan difinishing tanpa kompromi.
          </p>
        </div>

        {GROUPS.map((group) => (
          <nav key={group.heading} aria-label={group.heading}>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
              {group.heading}
            </p>
            <ul className="mt-5 space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="container-px flex flex-col gap-3 py-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 PAYOTA. Semua hak dilindungi.</p>
          <p className="uppercase tracking-[0.22em]">
            {CONTACT.openLabel} · {CONTACT.openTime}
          </p>
        </div>
      </div>
    </footer>
  );
}