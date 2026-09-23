'use client';

/**
 * KaryaConfirmDialogs - Konfirmasi hapus + panel Sampah.
 * Fitur lengkap: pulihkan/hapus per item, pulihkan/hapus semua,
 * pilih banyak + aksi masal. Responsive bottom-sheet on mobile.
 */

import React, { useState } from 'react';
import { Trash2, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type { KaryaPost } from './use-karya-admin';

interface KaryaConfirmDialogsProps {
  deleteId: number | null;
  onDeleteChange: (open: boolean) => void;
  onDelete: () => void;
  isTrashOpen: boolean;
  onTrashOpenChange: (open: boolean) => void;
  trashedItems: KaryaPost[];
  onRestore: (id: number) => void;
  onRestoreAll: () => Promise<void> | void;
  onPermaIdChange: (id: number | null) => void;
  onConfirmPermanent: () => void;
  onConfirmPermanentMany: (ids: number[]) => Promise<number>;
  bulkDeleteConfirm: boolean;
  onBulkDeleteChange: (open: boolean) => void;
  onBulkDeleteConfirm: () => void;
  selectedCount: number;
  isProcessing: boolean;
}

export const KaryaConfirmDialogs: React.FC<KaryaConfirmDialogsProps> = ({
  deleteId,
  onDeleteChange,
  onDelete,
  isTrashOpen,
  onTrashOpenChange,
  trashedItems,
  onRestore,
  onRestoreAll,
  onPermaIdChange,
  onConfirmPermanent,
  onConfirmPermanentMany,
  bulkDeleteConfirm,
  onBulkDeleteChange,
  onBulkDeleteConfirm,
  selectedCount,
  isProcessing,
}) => {
  const [pendingPermaId, setPendingPermaId] = useState<number | null>(null);
  const [selectedTrashIds, setSelectedTrashIds] = useState<number[]>([]);
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmRestoreAll, setConfirmRestoreAll] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const hasItems = trashedItems.length > 0;
  const allSelected = hasItems && trashedItems.every((item) => selectedTrashIds.includes(item.id));
  const someSelected = selectedTrashIds.length > 0;

  const toggleAll = () => setSelectedTrashIds(allSelected ? [] : trashedItems.map((item) => item.id));
  const toggleTrash = (id: number) => setSelectedTrashIds((ids) => ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]);

  const processMany = async () => {
    const ids = [...selectedTrashIds];
    setSelectedTrashIds([]);
    setConfirmAll(false);
    await onConfirmPermanentMany(ids);
  };

  const processDeleteAll = async () => {
    const allIds = trashedItems.map((item) => item.id);
    setConfirmDeleteAll(false);
    setSelectedTrashIds([]);
    await onConfirmPermanentMany(allIds);
    onTrashOpenChange(false);
  };

  const processRestoreAll = async () => {
    setConfirmRestoreAll(false);
    setSelectedTrashIds([]);
    await onRestoreAll();
    onTrashOpenChange(false);
  };

  return (
    <>
      {/* ========== DELETE CONFIRMATION (SOFT DELETE) ========== */}
      <AlertDialog open={!!deleteId} onOpenChange={onDeleteChange}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Trash2 size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Hapus ke Sampah?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest italic mb-6 leading-relaxed">
              Karya akan dipindahkan ke folder retensi. Masih bisa dipulihkan dari panel Sampah.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">
              BATAL
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={(e) => { e.preventDefault(); onDelete(); }}
              className="bg-destructive/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'MEMPROSES...' : 'YA, HAPUS'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== PANEL SAMPAH ========== */}
      <Dialog open={isTrashOpen} onOpenChange={onTrashOpenChange}>
        <DialogContent className="md:max-w-lg p-0 bg-card shadow-4xl overflow-hidden flex flex-col max-h-[85dvh] md:max-h-[85vh]" onCloseAutoFocus={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()}>
          {/* Header */}
          <DialogHeader className="px-5 py-4 md:px-6 md:py-5 shrink-0 border-b border-border/60">
            <DialogTitle className="text-sm font-headline uppercase font-bold tracking-tight flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trash2 size={16} /> Sampah Karya
              </span>
              {hasItems && (
                <span className="text-[9px] font-black text-primary/30 font-mono bg-primary/5 px-2 py-0.5 rounded-md">
                  {trashedItems.length}
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-[9px] text-primary/30 uppercase tracking-widest italic">
              Pulihkan untuk mengembalikan sebagai draf, atau hapus permanen beserta aset gambarnya.
            </DialogDescription>
          </DialogHeader>

          {/* Toolbar */}
          {hasItems && (
            <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-primary/[0.02] px-5 py-3 md:px-6">
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded border border-primary/30 transition-colors">
                  {allSelected && <Check size={11} />}
                </span>
                {allSelected ? 'Batalkan Semua' : 'Pilih Semua'}
              </button>
              <div className="flex items-center gap-1.5">
                {someSelected && (
                  <button
                    type="button"
                    onClick={() => { onTrashOpenChange(false); setConfirmAll(true); }}
                    className="flex items-center gap-1.5 rounded-xl bg-destructive/100 px-3 py-2 text-[8px] font-black uppercase tracking-wider text-white active:scale-95 transition-all shadow-sm"
                  >
                    <Trash2 size={11} /> Hapus ({selectedTrashIds.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons: Hapus Semua + Pulihkan Semua */}
          {hasItems && (
            <div className="flex gap-2 px-5 py-3 md:px-6 border-b border-border/60 bg-card">
              <Button
                onClick={() => { onTrashOpenChange(false); setConfirmRestoreAll(true); }}
                disabled={isProcessing}
                variant="outline"
                className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-primary/10 text-primary hover:bg-primary/5 active:scale-95 transition-all disabled:opacity-50"
              >
                <RotateCcw size={13} className="mr-1.5" /> Pulihkan Semua
              </Button>
              <Button
                onClick={() => { onTrashOpenChange(false); setConfirmDeleteAll(true); }}
                disabled={isProcessing}
                variant="destructive"
                className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                <Trash2 size={13} className="mr-1.5" /> Hapus Semua
              </Button>
            </div>
          )}

          {/* Item List */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 md:px-6 py-4 md:py-5">
            {trashedItems.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 bg-primary/5 rounded-[1.8rem] flex items-center justify-center">
                  <RotateCcw size={32} className="text-primary/10" />
                </div>
                <p className="text-[10px] text-primary/30 font-black uppercase tracking-widest">Sampah kosong</p>
                <p className="text-[9px] text-primary/20">Karya yang dihapus akan muncul di sini</p>
              </div>
            ) : (
              <div className="space-y-2">
                {trashedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-border/60 bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors"
                  >
                    <Checkbox
                      checked={selectedTrashIds.includes(item.id)}
                      onCheckedChange={() => toggleTrash(item.id)}
                      aria-label={`Pilih ${item.title}`}
                    />
                    <div className="w-12 h-9 relative rounded-lg overflow-hidden border border-border/60 shrink-0 bg-primary/5">
                      <img
                        src={item.images?.[0]?.url_images || `https://picsum.photos/seed/fee_${item.id}/200/150`}
                        alt={item.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[10px] uppercase truncate">{item.title}</p>
                      <p className="text-[8px] text-primary/20 font-mono">#{item.id}</p>
                    </div>

                    {pendingPermaId === item.id ? (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onConfirmPermanent();
                            setPendingPermaId(null);
                          }}
                          disabled={isProcessing}
                          title="Konfirmasi hapus permanen"
                          className="h-8 px-2.5 rounded-lg bg-destructive/100 text-white text-[8px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-sm disabled:opacity-50"
                        >
                          HAPUS
                        </button>
                        <button
                          onClick={() => {
                            onPermaIdChange(null);
                            setPendingPermaId(null);
                          }}
                          className="h-8 px-2.5 rounded-lg bg-primary/5 text-primary/60 text-[8px] font-black uppercase tracking-wider hover:bg-primary/10 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => onRestore(item.id)}
                          disabled={isProcessing}
                          title="Pulihkan karya"
                          className="h-8 px-2.5 rounded-lg bg-primary/5 text-primary text-[8px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-primary/10 transition-colors active:scale-95 disabled:opacity-50"
                        >
                          <RotateCcw size={11} /> Pulihkan
                        </button>
                        <button
                          onClick={() => {
                            onPermaIdChange(item.id);
                            setPendingPermaId(item.id);
                          }}
                          disabled={isProcessing}
                          title="Hapus permanen"
                          className="h-8 px-2 rounded-lg bg-destructive/10 text-destructive text-[8px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-destructive/15 transition-colors active:scale-95 disabled:opacity-50"
                        >
                          Permanen
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== KONFIRMASI: HAPUS TERPILIH ========== */}
      <AlertDialog open={confirmAll} onOpenChange={(open) => { if (!open) { setConfirmAll(false); onTrashOpenChange(true); } }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <AlertTriangle size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Hapus Permanen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest leading-relaxed mb-6">
              {selectedTrashIds.length} karya dan seluruh aset gambarnya akan dihapus permanen dari server. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">
              BATAL
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={(event) => { event.preventDefault(); void processMany(); }}
              className="bg-destructive/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'MEMPROSES...' : 'YA, HAPUS PERMANEN'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== KONFIRMASI: HAPUS SEMUA SAMPAH ========== */}
      <AlertDialog open={confirmDeleteAll} onOpenChange={(open) => { if (!open) { setConfirmDeleteAll(false); onTrashOpenChange(true); } }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Trash2 size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Hapus Semua Sampah?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest leading-relaxed mb-6">
              Seluruh {trashedItems.length} karya di sampah beserta aset gambarnya akan dihapus permanen dari server. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">
              BATAL
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={(event) => { event.preventDefault(); void processDeleteAll(); }}
              className="bg-destructive/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'MEMPROSES...' : 'YA, HAPUS SEMUA'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== KONFIRMASI: PULIHKAN SEMUA ========== */}
      <AlertDialog open={confirmRestoreAll} onOpenChange={(open) => { if (!open) { setConfirmRestoreAll(false); onTrashOpenChange(true); } }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-success/10 text-success rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <RotateCcw size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Pulihkan Semua?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest leading-relaxed mb-6">
              Seluruh {trashedItems.length} karya akan dikembalikan ke daftar utama sebagai draf nonaktif.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">
              BATAL
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={(event) => { event.preventDefault(); void processRestoreAll(); }}
              className="bg-success/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'MEMPROSES...' : 'YA, PULIHKAN SEMUA'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ========== BULK DELETE (SOFT - dari main table) ========== */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={(open) => { if (!open) onBulkDeleteChange(false); }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Trash2 size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold tracking-tighter">
              Hapus Masal?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-primary/30 text-[10px] font-light italic uppercase tracking-wider mb-8 leading-relaxed">
              {selectedCount} karya pilihan akan dipindahkan ke Sampah. Masih bisa dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 text-foreground border-none flex-1">
              BATAL
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={(e) => { e.preventDefault(); onBulkDeleteConfirm(); }}
              className="bg-destructive/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? 'MEMPROSES...' : 'YA, HAPUS KE SAMPAH'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
