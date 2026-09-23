'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Lock, AlertTriangle } from 'lucide-react';

const VERIFY_KEY = 'vape_age_verified';
const SESSION_KEY = 'vape_age_session';
const VALID_FOR_MS = 30 * 24 * 60 * 60 * 1000;

type GateState = 'loading' | 'verify' | 'blocked' | 'ok';

export function AgeGate() {
  const [state, setState] = useState<GateState>('loading');

  useEffect(() => {
    try {
      const session = sessionStorage.getItem(SESSION_KEY);
      if (session === '1') {
        setState('ok');
        return;
      }
      const raw = localStorage.getItem(VERIFY_KEY);
      if (raw) {
        const { t } = JSON.parse(raw) as { t: number };
        if (typeof t === 'number' && Date.now() - t < VALID_FOR_MS) {
          sessionStorage.setItem(SESSION_KEY, '1');
          setState('ok');
          return;
        }
      }
    } catch {}
    setState('verify');
  }, []);

  useEffect(() => {
    if (state === 'loading' || state === 'ok') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [state]);

  if (state === 'loading' || state === 'ok') return null;

  const handleYes = () => {
    try {
      localStorage.setItem(VERIFY_KEY, JSON.stringify({ t: Date.now() }));
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {}
    setState('ok');
  };

  const handleNo = () => {
    setState('blocked');
  };

  const handleExit = () => {
    try {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.replace('https://www.google.com');
      }
    } catch {}
  };

  if (state === 'blocked') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07070B]/95 backdrop-blur-xl p-4">
        <div className="w-full max-w-md rounded-[1.8rem] bg-card border border-border shadow-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl uppercase tracking-tighter text-foreground">Akses Ditolak</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Maaf, untuk memasuki website ini Anda harus sudah berusia{' '}
            <strong className="text-foreground">minimal 21 tahun</strong>. Akses pengunjung di bawah
            umur tidak diizinkan.
          </p>
          <button
            type="button"
            onClick={handleExit}
            className="mt-6 h-10 w-full rounded-full bg-primary text-white font-black uppercase tracking-widest text-[9px] hover:opacity-90 transition-all duration-300 active:scale-95"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07070B]/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-md rounded-[1.8rem] bg-card border border-border shadow-2xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.4em] text-primary">
          21+
        </span>
        <h2 className="mt-4 text-xl uppercase tracking-tighter text-foreground">Verifikasi Usia</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Website ini menampilkan informasi produk <strong className="text-foreground">liquid</strong>,{' '}
          <strong className="text-foreground">perangkat vape</strong>, dan aksesoris yang hanya
          diperuntukkan bagi pengunjung berusia <strong className="text-foreground">21 tahun ke atas</strong>.
          Dengan melanjutkan, Anda menyatakan sudah berusia minimal 21 tahun.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleYes}
            className="h-10 w-full rounded-full bg-primary text-white font-black uppercase tracking-widest text-[9px] hover:opacity-90 transition-all duration-300 active:scale-95"
          >
            Ya, Saya Sudah 21+
          </button>
          <button
            type="button"
            onClick={handleNo}
            className="h-10 w-full rounded-full border border-border bg-secondary/50 text-secondary-foreground font-black uppercase tracking-widest text-[9px] hover:bg-secondary transition-all duration-300 active:scale-95"
          >
            Tidak, Saya Di Bawah 21
          </button>
        </div>
        <div className="mt-6 flex items-start gap-2 rounded-2xl bg-muted/40 p-3 text-left">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Peringatan kesehatan: liquid mengandung nikotin yang adiktif. Produk ini bukan untuk
            penggunaan oleh anak di bawah umur.
          </p>
        </div>
      </div>
    </div>
  );
}