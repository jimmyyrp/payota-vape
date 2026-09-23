'use client';

/**
 * KaryaManageChip - Dropdown menu kelola karya di pojok kartu galeri.
 * Aksi & confirm dialog dipegang usePostManageActions + KaryaManageDialogs.
 */

import React from 'react';
import { MoreHorizontal, Edit2, Copy, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStaffAuth } from '@/hooks/use-staff-auth';
import { usePostManageActions } from '@/hooks/use-post-manage-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KaryaManageDialogs } from '@/components/karya-manage-dialogs';

interface KaryaManageChipProps {
  postId: number | string;
  postTitle?: string;
  postIsActive?: boolean;
  onEdit?: () => void;
  onActionComplete?: () => void;
  /** Dipanggil setelah karya dihapus, sebelum onActionComplete (keluar dari dialog induk bila ada). */
  onDeleteComplete?: (postId: number | string) => void;
  className?: string;
}

export const KaryaManageChip: React.FC<KaryaManageChipProps> = ({
  postId,
  postTitle = '',
  postIsActive = true,
  onEdit,
  onActionComplete,
  onDeleteComplete,
  className,
}) => {
  const { canManage } = useStaffAuth();
  const isActive = postIsActive;

  const {
    busy,
    confirmType,
    setConfirmType,
    dropdownOpen,
    setDropdownOpen,
    requestConfirm,
    handleDuplicate,
    handleToggle,
    handleDelete,
  } = usePostManageActions({
    postId,
    postTitle,
    isActive,
    onDuplicateComplete: onActionComplete,
    onToggleComplete: onActionComplete,
    // Tunggu animasi keluar 280ms bila chip di dalam dialog detail, agar
    // teardown modal bersarang tidak membalap dan mengunci halaman.
    exitDelayMs: 280,
    onDeleted: () => {
      onDeleteComplete?.(postId);
      onActionComplete?.();
    },
  });

  if (!canManage) return null;

  return (
    <div onClick={(e) => e.stopPropagation()} className={cn('z-20', className)}>
      {/* modal={false}: hindari layer modal ketiga (aria-hidden + scroll-lock)
          yang bisa membalap teardown dialog detail saat aksi selesai. */}
      <DropdownMenu modal={false} open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Kelola karya ini"
            title="Kelola karya ini"
            className="w-9 h-9 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg flex items-center justify-center text-white hover:bg-primary hover:border-primary hover:scale-110 transition-all"
          >
            <MoreHorizontal size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 rounded-2xl border-border/60 shadow-xl bg-card z-[320]">
          <DropdownMenuItem onClick={() => { setDropdownOpen(false); requestAnimationFrame(() => { if (onEdit) onEdit(); }); }} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
            <Edit2 size={13} /> {onEdit ? 'Edit di Halaman Ini' : 'Edit di Admin'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => requestConfirm('duplicate')} disabled={busy !== null} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
            {busy === 'duplicate' ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />} Duplikat
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => requestConfirm('toggle')} disabled={busy !== null} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
            {busy === 'toggle' ? <Loader2 size={13} className="animate-spin" /> : isActive ? <EyeOff size={13} /> : <Eye size={13} />} {isActive ? 'Arsipkan' : 'Tayangkan'}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-primary/5" />
          <DropdownMenuItem onClick={() => requestConfirm('delete')} disabled={busy !== null} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
            <Trash2 size={13} /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <KaryaManageDialogs
        postTitle={postTitle}
        isActive={isActive}
        busy={busy}
        confirmType={confirmType}
        setConfirmType={setConfirmType}
        onDuplicate={handleDuplicate}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  );
};