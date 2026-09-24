"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Reveal } from "./Reveal";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !value.includes("@")) return;
    setDone(true);
  };

  return (
    <section className="container-px py-24 lg:py-32" aria-label="Kabar terbaru">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#0D0D0D] px-6 py-16 text-center md:px-16 md:py-20">
          <div
            className="absolute inset-0 bg-grid opacity-20"
            aria-hidden
          />
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
              Dapatkan info koleksi baru
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Cerita desain, rilis studio, dan akses awal — langsung ke email Anda. Tanpa spam,
              hanya koleksi.
            </p>

            {done ? (
              <p className="mx-auto mt-9 flex max-w-md items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-foreground">
                <Check className="h-4 w-4 text-primary" aria-hidden />
                Terima kasih — email Anda sudah terdaftar.
              </p>
            ) : (
              <form
                onSubmit={submit}
                className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Alamat email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda..."
                  className="h-12 flex-1 rounded-full border border-white/10 bg-[#080808] px-6 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-white/25 focus:outline-none"
                />
                <button type="submit" className="btn-primary h-12">
                  Berlangganan
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </form>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}