'use client';

/**
 * KaryaManageFab - Floating button dengan dropdown menu untuk kelola karya.
 * Aksi & confirm dialog dipegang usePostManageActions + KaryaManageDialogs.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Edit2, Copy, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
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

interface KaryaManageFabProps {
  postId: number | string;
  postTitle?: string;
  postIsActive?: boolean;
  onActionComplete?: () => void;
  /** Dipanggil setelah karya berhasil dihapus (mis. redirect keluar dari halaman detail). */
  onDeleted?: () => void;
  /** Saat disediakan, "Edit" dibuka di halaman ini (in-place), bukan navigasi /admin/karya. */
  onEdit?: () => void;
}

export const KaryaManageFab: React.FC<KaryaManageFabProps> = ({
  postId,
  postTitle = '',
  postIsActive = true,
  onActionComplete,
  onDeleted,
  onEdit,
}) => {
  const { canManage } = useStaffAuth();
  const router = useRouter();
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
    onDeleted,
  });

  if (!canManage) return null;

  return (
    <>
      <div className="fixed bottom-6 right-4 md:right-8 z-[90]">
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button className="h-12 w-12 rounded-2xl bg-primary text-white shadow-[0_16px_40px_rgba(139,92,246,0.4)] border border-white/10 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
              <MoreHorizontal size={20} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl border-border/60 shadow-xl bg-card mb-2 z-[320]">
            <DropdownMenuItem onClick={() => { setDropdownOpen(false); requestAnimationFrame(() => { if (onEdit) onEdit(); else router.push(`/admin/karya?edit=${postId}`); }); }} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
              <Edit2 size={13} /> {onEdit ? 'Edit di Halaman Ini' : 'Edit (Admin)'}
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
      </div>

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
    </>
  );
};