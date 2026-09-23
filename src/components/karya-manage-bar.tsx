'use client';

/**
 * KaryaManageBar - Dropdown menu 3 titik untuk admin/developer di dialog
 * detail karya publik. Aksi & confirm dialog dipegang usePostManageActions +
 * KaryaManageDialogs (dengan z-index tinggi karena berada dalam dialog induk).
 */

import React from 'react';
import { useRouter } from 'next/navigation';
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

interface KaryaManageBarProps {
  post: { id: number | string; title: string; is_active?: boolean };
  onChanged?: () => void;
  onDeleted?: () => void;
  /** Saat disediakan, "Edit" dibuka di halaman ini (in-place), bukan navigasi /admin/karya. */
  onEdit?: () => void;
  className?: string;
}

export const KaryaManageBar: React.FC<KaryaManageBarProps> = ({ post, onChanged, onDeleted, onEdit, className }) => {
  const router = useRouter();
  const { canManage } = useStaffAuth();
  const isActive = post.is_active ?? true;

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
    postId: post.id,
    postTitle: post.title,
    isActive,
    onDuplicateComplete: onChanged,
    onToggleComplete: onChanged,
    exitDelayMs: 280,
    onDeleted,
  });

  if (!canManage) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-[7px] font-black text-primary/25 uppercase tracking-[0.3em]">Kelola:</span>

      {/* modal={false}: jangan membuat layer modal ketiga (aria-hidden + scroll-lock)
          yang membalap teardown dialog detail saat aksi selesai -> mencegah halaman
          terkunci/tak bisa diklik (mis. tombol pagination) setelah dialog ditutup. */}
      <DropdownMenu modal={false} open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="h-9 w-9 rounded-xl flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/5 transition-all border border-primary/10" title="Opsi kelola">
            <MoreHorizontal size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 rounded-2xl border-border/60 shadow-xl bg-card z-[320]">
          <DropdownMenuItem onClick={() => { setDropdownOpen(false); requestAnimationFrame(() => { if (onEdit) onEdit(); else router.push(`/admin/karya?edit=${post.id}`); }); }} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
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

      <KaryaManageDialogs
        postTitle={post.title}
        isActive={isActive}
        busy={busy}
        confirmType={confirmType}
        setConfirmType={setConfirmType}
        onDuplicate={handleDuplicate}
        onToggle={handleToggle}
        onDelete={handleDelete}
        elevated
      />
    </div>
  );
};