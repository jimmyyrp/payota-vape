'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 bg-destructive/10 rounded-[2rem] flex items-center justify-center text-destructive mx-auto">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-headline font-bold text-foreground uppercase tracking-tighter">
            Gangguan Sistem
          </h2>
          <p className="text-[11px] text-primary/40 font-medium italic leading-relaxed">
            Terjadi kesalahan tak terduga. Tim teknis telah diberi notifikasi otomatis.
          </p>
        </div>
        <button
          onClick={reset}
          className="bg-primary hover:opacity-90 text-white rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all border-none cursor-pointer"
        >
          MUAT ULANG
        </button>
      </div>
    </div>
  );
}
