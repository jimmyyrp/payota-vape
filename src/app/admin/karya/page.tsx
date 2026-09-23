'use client';

/**
 * KaryaAdmin - Main orchestrator for Karya management.
 * Composes: useKaryaAdmin hook, KaryaDataTable, KaryaFormDialog, KaryaConfirmDialogs.
 * Fitur manajemen lengkap: tab status (Semua/Tayang/Draf), duplikat,
 * tayang/arsip cepat, sampah (pulihkan & hapus permanen).
 * Deep-link: /admin/karya?edit={id} langsung membuka modal Ubah — dipakai
 * chip kelola di galeri publik, beranda, dan FAB halaman detail.
 */

import React, { Suspense, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKaryaAdmin, RATIOS } from './use-karya-admin';
import { KaryaDataTable } from './karya-data-table';
import type { StatusFilter } from './karya-data-table';
import { KaryaFormDialog } from '@/components/karya-form-dialog';
import { KaryaConfirmDialogs } from './karya-confirm-dialogs';

function KaryaAdminInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL STATE — dibaca saat mount agar refresh/tombol kembali tetap berada
  // di halaman & filter yang sama (mis. ?page=5).
  const statusRaw = searchParams?.get('status');
  const initStatus: StatusFilter =
    statusRaw === 'active' || statusRaw === 'draft' ? statusRaw : 'all';
  const initQ = searchParams?.get('q') ?? '';
  const initCat = searchParams?.get('cat') ?? 'all';
  const initSub = searchParams?.get('sub') ?? 'all';
  const pageRaw = parseInt(searchParams?.get('page') ?? '1', 10);

  const {
    // Data
    categories,
    subCategories,
    loading,
    isProcessing,
    trashedItems,
    // Filter
    searchTerm,
    setSearchTerm,
    catFilter,
    setCatFilter,
    subCatFilter,
    setSubCatFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredItems,
    paginatedItems,
    items,
    // Sampah
    isTrashOpen,
    setIsTrashOpen,
    permanentDeleteId,
    setPermanentDeleteId,
    handleRestore,
    handleRestoreAll,
    handlePermanentDelete,
    handlePermanentDeleteMany,
    // Form
    formData,
    setFormData,
    editingItem,
    isAdding,
    setIsAdding,
    isSubmitting,
    isUploadingImage,
    fieldErrors,
    requestSave,
    isChanged,
    resetForm,
    startEdit,
    handleSave,
    // Duplikat & status
    duplicatingId,
    handleDuplicate,
    handleToggleActive,
    // Delete
    deleteId,
    setDeleteId,
    handleSoftDelete,
    selectedIds,
    setSelectedIds,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    handleBulkDelete,
    // Crop
    cropState,
    setCropState,
    handleCropComplete,
    applyCrop,
    openCropDialog,
    removeGalleryImage,
    // Drag & Drop
    reorderGallery,
  } = useKaryaAdmin({
    statusFilter: initStatus,
    searchTerm: initQ,
    catFilter: initCat,
    subCatFilter: initSub,
    currentPage: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  });

  const counts: Record<StatusFilter, number> = React.useMemo(
    () => ({
      all: items.length,
      active: items.filter((i) => i.is_active).length,
      draft: items.filter((i) => !i.is_active).length,
    }),
    [items]
  );

  // DEEP-LINK ?edit={id}: setelah data siap, buka modal Ubah lalu bersihkan
  // param edit saja — status/q/cat/sub/page tetap dipertahankan.
  const editParam = searchParams?.get('edit');
  const handledEditRef = useRef<string | null>(null);

  // Sinkronkan filter & halaman aktif ke URL (replace, tanpa reload penuh)
  // agar refresh / tombol kembali mengembalikan posisi yang sama.
  const syncUrl = useCallback((params: Record<string, string | null>) => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === '') url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  // Lewati render pertama: URL sudah memuat state saat mount, jangan menimpa.
  const skipUrlSyncRef = useRef(true);
  useEffect(() => {
    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      return;
    }
    syncUrl({
      status: statusFilter === 'all' ? null : statusFilter,
      q: searchTerm || null,
      cat: catFilter === 'all' ? null : catFilter,
      sub: subCatFilter === 'all' ? null : subCatFilter,
      page: currentPage > 1 ? String(currentPage) : null,
    });
  }, [statusFilter, searchTerm, catFilter, subCatFilter, currentPage, syncUrl]);

  useEffect(() => {
    if (!editParam || loading || items.length === 0) return;
    if (handledEditRef.current === editParam) return;
    handledEditRef.current = editParam;
    const target = items.find((i) => String(i.id) === editParam);
    if (target) startEdit(target);
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    router.replace(url.pathname + url.search);
  }, [editParam, loading, items, startEdit, router]);

  return (
    <div className="space-y-6 animate-fade-up text-left pb-10 md:pb-10 w-full max-w-full overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/60">
        <h1 className="text-xl font-headline font-bold text-foreground uppercase tracking-tighter">
          Manajemen Karya
        </h1>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              onClick={() => setBulkDeleteConfirm(true)}
              disabled={isProcessing}
              variant="destructive"
              className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hidden md:flex disabled:opacity-50"
            >
              HAPUS ({selectedIds.length})
            </Button>
          )}
          <Button
            onClick={(e) => {
              (e.currentTarget as HTMLElement).blur();
              resetForm();
              setIsAdding(true);
            }}
            className="bg-primary hover:opacity-90 text-white rounded-xl h-12 px-8 text-[10px] font-black uppercase tracking-widest border-none shadow-md w-full md:w-auto"
          >
            <Plus size={16} className="mr-2" /> TERBITKAN BARU
          </Button>
        </div>
      </div>

      {/* DATA TABLE */}
      <KaryaDataTable
        paginatedItems={paginatedItems}
        filteredItems={filteredItems}
        categories={categories}
        loading={loading}
        searchTerm={searchTerm}
        catFilter={catFilter}
        subCategories={subCategories}
        subCatFilter={subCatFilter}
        currentPage={currentPage}
        totalPages={totalPages}
        counts={counts}
        trashedCount={trashedItems.length}
        duplicatingId={duplicatingId}
        statusFilter={statusFilter}
        selectedIds={selectedIds}
        isProcessing={isProcessing}
        onStatusFilterChange={setStatusFilter}
        onSearchChange={setSearchTerm}
        onCatFilterChange={setCatFilter}
        onSubCatFilterChange={setSubCatFilter}
        onPageChange={setCurrentPage}
        onEdit={startEdit}
        onDelete={setDeleteId}
        onDuplicate={(item) => void handleDuplicate(item)}
        onToggleActive={(item) => void handleToggleActive(item)}
        onOpenTrash={() => setIsTrashOpen(true)}
        onSelectionChange={setSelectedIds}
      />

      {/* FORM + CROP DIALOGS */}
      <KaryaFormDialog
        isOpen={isAdding}
        onOpenChange={setIsAdding}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        subCategories={subCategories}
        isSubmitting={isSubmitting}
        isUploadingImage={isUploadingImage}
        isChanged={isChanged}
        fieldErrors={fieldErrors}
        onSave={() => {
          if (requestSave()) void handleSave();
        }}
        cropState={cropState}
        setCropState={setCropState}
        onCropComplete={handleCropComplete}
        onApplyCrop={applyCrop}
        onOpenCropDialog={openCropDialog}
        onRemoveImage={removeGalleryImage}
        onReorderGallery={reorderGallery}
        ratios={RATIOS}
      />

      {/* MOBILE FLOATING SELECTION BAR */}
      {selectedIds.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-primary/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-5 py-3 pb-safe">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-[10px] font-black">
                {selectedIds.length}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/50">
                dipilih
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds([])}
                className="h-10 px-4 rounded-xl bg-primary/5 text-primary/60 text-[9px] font-black uppercase tracking-widest hover:bg-primary/10 transition-colors"
              >
                BATAL
              </button>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={isProcessing}
                className="h-10 px-5 rounded-xl bg-destructive/100 text-white text-[9px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Trash2 size={13} /> HAPUS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION + SAMPAH */}
      <KaryaConfirmDialogs
        deleteId={deleteId}
        onDeleteChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onDelete={handleSoftDelete}
        isTrashOpen={isTrashOpen}
        onTrashOpenChange={setIsTrashOpen}
        trashedItems={trashedItems}
        onRestore={(id) => void handleRestore(id)}
        onRestoreAll={() => handleRestoreAll()}
        onPermaIdChange={setPermanentDeleteId}
        onConfirmPermanent={() => void handlePermanentDelete()}
        onConfirmPermanentMany={handlePermanentDeleteMany}
        bulkDeleteConfirm={bulkDeleteConfirm}
        onBulkDeleteChange={setBulkDeleteConfirm}
        onBulkDeleteConfirm={handleBulkDelete}
        selectedCount={selectedIds.length}
        isProcessing={isProcessing}
      />
    </div>
  );
}

export default function KaryaAdmin() {
  return (
    <Suspense fallback={null}>
      <KaryaAdminInner />
    </Suspense>
  );
}
