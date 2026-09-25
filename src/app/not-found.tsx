import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Halaman Tidak Ditemukan",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-px flex min-h-screen flex-col items-center justify-center gap-10 py-24 text-center lg:flex-row lg:gap-16 lg:text-left">
      {/* Visual 404 */}
      <div className="relative w-full max-w-md shrink-0 animate-scale-in">
        <div
          className="absolute inset-0 -z-10 rounded-full blur-[120px]"
          style={{ background: "radial-gradient(circle, rgba(228,228,231,0.14), transparent 70%)" }}
          aria-hidden
        />
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/[0.07] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
          <Image
            src="/404.webp"
            alt="Ilustrasi halaman tidak ditemukan"
            fill
            sizes="(min-width: 1024px) 480px, 92vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Copy */}
      <div className="flex max-w-md flex-col items-center gap-6 lg:items-start">
        <p className="animate-fade-up text-[11px] font-bold uppercase tracking-[0.32em] text-primary">
          404 — Halaman Tidak Ditemukan
        </p>
        <h1
          className="animate-fade-up font-headline font-extrabold uppercase tracking-tighter"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.02, animationDelay: "80ms" }}
        >
          Anda tersesat
          <br />
          di sini.
        </h1>
        <p
          className="animate-fade-up text-sm leading-relaxed text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          Halaman yang Anda cari tidak ada atau sudah dipindahkan. Tidak apa-apa — mari kembali ke
          koleksi utama.
        </p>
        <div
          className="animate-fade-up flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          style={{ animationDelay: "240ms" }}
        >
          <Link href="/" className="btn-primary">
            Kembali ke Beranda
          </Link>
          <Link href="/catalog" className="btn-outline">
            Lihat Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}
