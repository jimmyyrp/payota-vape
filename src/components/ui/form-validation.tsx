'use client';

/**
 * FormValidation - Komponen validasi inline yang konsisten untuk semua
 * dialog form admin. Validasi tampil DI DALAM modal (bukan toast di luar).
 *
 * - ErrorBanner : kotak merah ringkas di ATAS konten form, berisi daftar
 *                 semua field yang belum valid.
 * - FieldHint   : teks kecil merah tepat di bawah field bermasalah.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorBannerProps {
  /** Daftar pesan error; komponen tak render apa pun jika kosong. */
  errors: string[];
  className?: string;
}

export function ErrorBanner({ errors, className }: ErrorBannerProps) {
  if (errors.length === 0) return null;
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3',
        className
      )}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
      <div className="space-y-0.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-destructive">
          Perlu dilengkapi dulu
        </p>
        <ul className="space-y-0.5">
          {errors.map((e) => (
            <li key={e} className="text-[10px] font-bold text-destructive leading-relaxed">
              &bull; {e}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export interface FieldHintProps {
  message?: string;
  className?: string;
}

export function FieldHint({ message, className }: FieldHintProps) {
  if (!message) return null;
  return (
    <p className={cn('text-[9px] font-black uppercase tracking-wider text-destructive ml-1', className)}>
      {message}
    </p>
  );
}

/** Kelas ring merah untuk Input/SelectTrigger/box yang sedang invalid. */
export const INVALID_RING = 'ring-2 ring-destructive/40 bg-destructive/10/60';
