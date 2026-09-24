"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert, Lock } from "lucide-react";

const VERIFY_KEY = "payota_age_verified";
const SESSION_KEY = "payota_age_session";
const VALID_FOR_MS = 30 * 24 * 60 * 60 * 1000;

type GateState = "loading" | "verify" | "blocked" | "ok";

export function AgeGate() {
  const pathname = usePathname();
  const [state, setState] = useState<GateState>("loading");

  useEffect(() => {
    // Area admin tidak perlu age gate.
    if (pathname.startsWith("/admin")) {
      setState("ok");
      return;
    }
    try {
      const session = sessionStorage.getItem(SESSION_KEY);
      if (session === "1") {
        setState("ok");
        return;
      }
      const raw = localStorage.getItem(VERIFY_KEY);
      if (raw) {
        const { t } = JSON.parse(raw) as { t: number };
        if (typeof t === "number" && Date.now() - t < VALID_FOR_MS) {
          sessionStorage.setItem(SESSION_KEY, "1");
          setState("ok");
          return;
        }
      }
    } catch {}
    setState("verify");
  }, [pathname]);

  useEffect(() => {
    if (state === "loading" || state === "ok") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [state]);

  if (state === "loading" || state === "ok") return null;

  const handleYes = () => {
    try {
      localStorage.setItem(VERIFY_KEY, JSON.stringify({ t: Date.now() }));
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setState("ok");
  };

  const handleNo = () => setState("blocked");

  const handleExit = () => {
    try {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.replace("https://www.google.com");
      }
    } catch {}
  };

  if (state === "blocked") {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#080808]/95 backdrop-blur-xl p-4">
        <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-[#0D0D0D] p-9 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground">
            <Lock className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="text-xl">Akses Ditolak</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Untuk memasuki situs PAYOTA Anda harus berusia{" "}
            <strong className="text-foreground">minimal 21 tahun</strong>. Akses di bawah umur tidak
            diizinkan.
          </p>
          <button type="button" onClick={handleExit} className="btn-primary mt-7 w-full">
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#080808]/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-[#0D0D0D] p-9 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldAlert className="h-7 w-7" aria-hidden />
        </div>
        <span className="chip border border-primary/30 bg-primary/10 text-primary">21+</span>
        <h2 className="mt-5 text-2xl">PAYOTA</h2>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Gaya Hidup Premium
        </p>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Situs ini menyajikan produk lifestyle premium yang hanya diperuntukkan bagi pengunjung
          berusia <strong className="text-foreground">21 tahun ke atas</strong>. Dengan melanjutkan,
          Anda menyatakan sudah berusia minimal 21 tahun.
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <button type="button" onClick={handleYes} className="btn-primary w-full">
            Ya, Saya Sudah 21+
          </button>
          <button
            type="button"
            onClick={handleNo}
            className="btn-outline w-full text-muted-foreground"
          >
            Tidak, Saya Di Bawah 21
          </button>
        </div>
      </div>
    </div>
  );
}