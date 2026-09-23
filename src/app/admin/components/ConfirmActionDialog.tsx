'use client';

import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export type ConfirmDialogIcon = 'trash' | 'warning';

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: ConfirmDialogIcon;
  isProcessing?: boolean;
  processingLabel?: string;
  onConfirm: () => void;
  /** aksesori tambahan di bawah deskripsi (mis. peringatan khusus). */
  children?: React.ReactNode;
}

/**
 * ConfirmActionDialog - dialog konfirmasi aksi destruktif bersama untuk
 * seluruh data-table admin (hapus tunggal & masal) agar tampilan & perilaku
 * seragam dan tidak digandakan per modul.
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'HAPUS',
  cancelLabel = 'BATAL',
  icon = 'trash',
  isProcessing = false,
  processingLabel = 'MEMPROSES...',
  onConfirm,
  children,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        mobilePosition="center"
        className="p-8 md:p-10 bg-card shadow-4xl text-center"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
          {icon === 'warning' ? <AlertTriangle size={32} /> : <Trash2 size={32} />}
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold tracking-tighter">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-primary/30 text-[10px] font-light italic uppercase tracking-wider mb-6 leading-relaxed">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        {children}
        <div className="flex gap-2">
          <AlertDialogCancel
            disabled={isProcessing}
            className="rounded-xl h-12 text-[10px] font-black bg-primary/5 text-foreground border-none flex-1"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!isProcessing) onConfirm();
            }}
            disabled={isProcessing}
            className="bg-destructive/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? processingLabel : confirmLabel}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}