'use client';

/**
 * ServicesConfirmDialogs - konfirmasi hapus tunggal & masal katalog.
 */

import React from 'react';
import { ConfirmActionDialog } from '../components/ConfirmActionDialog';

interface ServicesConfirmDialogsProps {
  deleteId: number | null;
  onDeleteChange: (open: boolean) => void;
  onDeleteConfirm: () => void;
  bulkDeleteConfirm: boolean;
  onBulkDeleteChange: (open: boolean) => void;
  onBulkDeleteConfirm: () => void;
  selectedCount: number;
  isProcessing?: boolean;
}

export const ServicesConfirmDialogs: React.FC<ServicesConfirmDialogsProps> = ({
  deleteId,
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
        open={!!deleteId}
        onOpenChange={onDeleteChange}
        icon="warning"
        title="Hapus Katalog?"
        description="Tindakan ini permanen pada server."
        isProcessing={isProcessing}
        onConfirm={onDeleteConfirm}
      />

      {/* BULK DELETE */}
      <ConfirmActionDialog
        open={bulkDeleteConfirm}
        onOpenChange={onBulkDeleteChange}
        icon="warning"
        title="Hapus Masal?"
        description={`Menghapus ${selectedCount} katalog pilihan secara permanen.`}
        isProcessing={isProcessing}
        onConfirm={onBulkDeleteConfirm}
      />
    </>
  );
};