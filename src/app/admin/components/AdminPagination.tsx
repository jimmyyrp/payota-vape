'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** label variant: "default" | "bold-uppercase" | "tiny-kicker" */
  variant?: 'default' | 'bold' | 'tiny' | 'boxed';
  /** extra className untuk pembungkus baris */
  className?: string;
}

/**
 * AdminPagination - baris navigasi halaman bersama untuk data-table admin.
 * Menerima tiga gaya tampilan (default/bold/tiny/boxed) agar bisa dipakai
 * karya, events, users, dan services secara konsisten.
 */
export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'default',
  className,
}: AdminPaginationProps) {
  const first = currentPage === 1;
  const last = currentPage >= totalPages || totalPages === 0;

  const label: React.ReactNode =
    variant === 'bold' ? (
      <p className="text-[10px] font-black text-primary/20 uppercase tracking-[0.3em]">
        HALAMAN {currentPage} DARI {totalPages || 1}
      </p>
    ) : variant === 'tiny' ? (
      <p className="text-[8px] font-bold text-primary/20 uppercase tracking-widest">
        Halaman {currentPage} dari {totalPages || 1}
      </p>
    ) : (
      <p className="text-[9px] font-black text-primary/20 uppercase tracking-widest">
        Halaman {currentPage} dari {totalPages || 1}
      </p>
    );

  const buttonSize =
    variant === 'boxed' ? 'h-9 w-9 rounded-xl border-border/60' :
    variant === 'tiny' ? 'h-8 w-8 p-0 rounded-lg border-border/60 bg-card' :
    'h-10 w-10 p-0 rounded-xl border-border/60 bg-card';

  const iconSize = variant === 'tiny' ? 14 : variant === 'boxed' ? 16 : 18;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {label}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          disabled={first}
          onClick={() => onPageChange(currentPage - 1)}
          className={buttonSize}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={iconSize} />
        </Button>
        <Button
          variant="outline"
          disabled={last}
          onClick={() => onPageChange(currentPage + 1)}
          className={buttonSize}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={iconSize} />
        </Button>
      </div>
    </div>
  );
}