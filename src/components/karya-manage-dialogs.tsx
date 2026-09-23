'use client';

/**
 * KaryaManageDialogs - confirm dialog bersama (duplikat / tayang-arsip /
 * hapus) untuk KaryaManageChip, KaryaManageBar, dan KaryaManageFab.
 * Logika aksi ada di usePostManageActions.
 */

import React from 'react';
import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ManageBusyAction, ManageConfirmType } from '@/hooks/use-post-manage-actions';

interface KaryaManageDialogsProps {
  postTitle: string;
  isActive: boolean;
  busy: ManageBusyAction;
  confirmType: ManageConfirmType;
  setConfirmType: (type: ManageConfirmType) => void;
  onDuplicate: () => void;
  onToggle: () => void;
  onDelete: () => void;
  /**
   * true saat muatan kelola berada di dalam dialog detail → alert dialog
   * butuh z-index lebih tinggi agar tidak tertutup lapisan dialog induk.
   */
  elevated?: boolean;
}

export const KaryaManageDialogs: React.FC<KaryaManageDialogsProps> = ({
  postTitle,
  isActive,
  busy,
  confirmType,
  setConfirmType,
  onDuplicate,
  onToggle,
  onDelete,
  elevated = false,
}) => {
  const contentClass = cn('p-8 md:p-10 bg-card shadow-4xl text-center', elevated && '!z-[410]');

  return (
    <>
      {/* CONFIRM: DUPLIKAT */}
      <AlertDialog open={confirmType === 'duplicate'} onOpenChange={(v) => { if (!v) setConfirmType(null); }}>
        <AlertDialogContent overlayClassName={elevated ? '!z-[400]' : undefined} className={contentClass} onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
            <Copy size={24} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Duplikat Karya?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest italic mb-6 leading-relaxed">
              &quot;{postTitle}&quot; akan disalin sebagai draf baru di Manajemen Karya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">BATAL</AlertDialogCancel>
            <AlertDialogAction onClick={onDuplicate} className="bg-primary text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all">YA, DUPLIKAT</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRM: TOGGLE STATUS */}
      <AlertDialog open={confirmType === 'toggle'} onOpenChange={(v) => { if (!v) setConfirmType(null); }}>
        <AlertDialogContent overlayClassName={elevated ? '!z-[400]' : undefined} className={contentClass} onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className={cn('w-14 h-14 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4', isActive ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success')}>
            {isActive ? <EyeOff size={24} /> : <Eye size={24} />}
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              {isActive ? 'Arsipkan Karya?' : 'Tayangkan Karya?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest italic mb-6 leading-relaxed">
              &quot;{postTitle}&quot; {isActive ? 'akan disembunyikan dari galeri publik.' : 'akan ditampilkan di galeri publik.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">BATAL</AlertDialogCancel>
            <AlertDialogAction onClick={onToggle} className={cn('text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all', isActive ? 'bg-warning/100' : 'bg-success/100')}>
              {isActive ? 'YA, ARSIPKAN' : 'YA, TAYANGKAN'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRM: HAPUS */}
      <AlertDialog open={confirmType === 'delete'} onOpenChange={(v) => { if (!v) setConfirmType(null); }}>
        <AlertDialogContent overlayClassName={elevated ? '!z-[400]' : undefined} className={contentClass} onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-14 h-14 bg-destructive/10 text-destructive rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
            <Trash2 size={24} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Hapus Karya Ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest italic mb-6 leading-relaxed">
              &quot;{postTitle}&quot; akan dipindahkan ke Sampah. Masih bisa dipulihkan dari Manajemen Karya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={busy !== null} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">BATAL</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} disabled={busy !== null} className="bg-destructive/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all">YA, HAPUS</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};