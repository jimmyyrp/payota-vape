'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { duplicatePostById, setPostActiveState } from '@/lib/post-actions';
import { softDeletePost } from '@/lib/queries';

export type ManageBusyAction = 'duplicate' | 'toggle' | 'delete' | null;
export type ManageConfirmType = 'duplicate' | 'toggle' | 'delete' | null;

interface UsePostManageActionsOptions {
  postId: number | string;
  postTitle: string;
  isActive: boolean;
  /** dipanggil setelah duplikasi berhasil. */
  onDuplicateComplete?: () => void;
  /** dipanggil setelah status tayang/draf berubah. */
  onToggleComplete?: () => void;
  /** dipanggil setelah karya dihapus (soft delete). */
  onDeleted?: () => void;
  /**
   * Delay sebelum onDeleted (ms). Dipakai saat muatan kelola berada di dalam
   * dialog detail, agar animasi keluar AlertDialog selesai dulu sebelum
   * dialog induk ditutup (mencegah lapisan aria-hidden/scroll-lock tersisa).
   */
  exitDelayMs?: number;
}

/**
 * usePostManageActions - logika aksi kelola karya (duplikat / tayang-arsip /
 * hapus) + status konfirmasi, dipakai bersama oleh KaryaManageChip/Bar/Fab
 * sehingga perilaku, toast, dan confirm dialog benar-benar satu sumber.
 */
export function usePostManageActions({
  postId,
  postTitle,
  isActive,
  onDuplicateComplete,
  onToggleComplete,
  onDeleted,
  exitDelayMs = 0,
}: UsePostManageActionsOptions) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<ManageBusyAction>(null);
  const [confirmType, setConfirmType] = useState<ManageConfirmType>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDuplicate = useCallback(async () => {
    setConfirmType(null);
    setDropdownOpen(false);
    setBusy('duplicate');
    try {
      const res = await duplicatePostById(postId);
      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Gagal Duplikat', description: res.error });
      } else {
        toast({ title: 'Duplikat Dibuat', description: `"${postTitle}" tersalin sebagai draf di Manajemen Karya.` });
        onDuplicateComplete?.();
      }
    } finally {
      setBusy(null);
    }
  }, [postId, postTitle, onDuplicateComplete, toast]);

  const handleToggle = useCallback(async () => {
    setConfirmType(null);
    setDropdownOpen(false);
    setBusy('toggle');
    try {
      const res = await setPostActiveState(postId, !isActive);
      if (!res.ok) {
        toast({ variant: 'destructive', title: 'Gagal Ubah Status', description: res.error });
      } else {
        toast({ title: isActive ? 'Karya Diarsipkan' : 'Karya Ditayangkan', description: postTitle });
        onToggleComplete?.();
      }
    } finally {
      setBusy(null);
    }
  }, [postId, isActive, postTitle, onToggleComplete, toast]);

  const handleDelete = useCallback(async () => {
    setDropdownOpen(false);
    setBusy('delete');
    try {
      await softDeletePost(Number(postId));
      toast({ title: 'Karya Dihapus', description: `"${postTitle}" dipindahkan ke Sampah.` });
      setConfirmType(null);
      // Tunggu animasi keluar AlertDialog selesai sebelum memicu onDeleted,
      // terutama saat muatan kelola ada di dalam dialog detail, agar tidak ada
      // lapisan modal yang tertinggal dan mengunci halaman.
      if (exitDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, exitDelayMs));
      }
      onDeleted?.();
    } catch (err: unknown) {
      setConfirmType(null);
      toast({
        variant: 'destructive',
        title: 'Gagal Menghapus',
        description: err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga.',
      });
    } finally {
      setBusy(null);
    }
  }, [postId, postTitle, onDeleted, exitDelayMs, toast]);

  /** Tutup dropdown lalu tampilkan confirm dialog yang diminta. */
  const requestConfirm = useCallback((type: ManageConfirmType) => {
    setDropdownOpen(false);
    requestAnimationFrame(() => setConfirmType(type));
  }, []);

  return {
    busy,
    confirmType,
    setConfirmType,
    dropdownOpen,
    setDropdownOpen,
    requestConfirm,
    handleDuplicate,
    handleToggle,
    handleDelete,
  };
}