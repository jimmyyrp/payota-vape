'use client';

/**
 * UsersConfirmDialogs - konfirmasi hapus tunggal & masal personel.
 */

import React from 'react';
import { ConfirmActionDialog } from '../components/ConfirmActionDialog';

interface UsersConfirmDialogsProps {
  deleteConfirmId: number | null;
  onDeleteChange: (open: boolean) => void;
  onDeleteConfirm: () => void;
  bulkDeleteConfirm: boolean;
  onBulkDeleteChange: (open: boolean) => void;
  onBulkDeleteConfirm: () => void;
  selectedCount: number;
  isProcessing?: boolean;
}

export const UsersConfirmDialogs: React.FC<UsersConfirmDialogsProps> = ({
  deleteConfirmId,
  onDeleteChange,
  onDeleteConfirm,
  bulkDeleteConfirm,
  onBulkDeleteChange,
  onBulkDeleteConfirm,
  selectedCount,
  isProcessing = false,
}) => {
  return (
    <>
      {/* SINGLE DELETE */}
      <ConfirmActionDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && onDeleteChange(false)}
        title="Hapus Personel?"
        description="Seluruh izin akses personel ini akan dicabut secara permanen."
        confirmLabel="HAPUS AKSES"
        isProcessing={isProcessing}
        onConfirm={onDeleteConfirm}
      />

      {/* BULK DELETE */}
      <ConfirmActionDialog
        open={bulkDeleteConfirm}
        onOpenChange={onBulkDeleteChange}
        title="Hapus Masal?"
        description={`Menghapus ${selectedCount} personel pilihan secara permanen.`}
        confirmLabel="HAPUS SEMUA"
        isProcessing={isProcessing}
        onConfirm={onBulkDeleteConfirm}
      />
    </>
  );
};