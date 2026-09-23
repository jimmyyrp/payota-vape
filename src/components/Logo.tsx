"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Cigarette } from 'lucide-react';

interface LogoProps {
  isScrolled?: boolean;
  variant?: 'header' | 'footer';
}

/**
 * BluLogo v1.0 - VAPE STORE DARK (Logo ikon vape + nama toko)
 */

export function BluLogo({ isScrolled, variant = 'header' }: LogoProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 transition-all duration-500",
      variant === 'footer' ? "flex-col items-center gap-0" : "flex-row"
    )}>
      <div className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center transition-all duration-500 shrink-0 rounded-xl bg-primary text-white shadow-lg">
        <Cigarette size={18} className="rotate-180" aria-hidden="true" />
      </div>

      <div className={cn("flex flex-col", variant === 'footer' && "text-center hidden")}>
        <span className={cn(
          "font-headline font-black uppercase tracking-tighter leading-none transition-all duration-300",
          variant === 'header' 
            ? (isScrolled ? "text-[14px] md:text-[15px] text-foreground" : "text-[16px] md:text-[17px] text-white drop-shadow-lg") 
            : "text-2xl text-foreground"
        )}>
          Vape Store
        </span>
      </div>
    </div>
  );
}