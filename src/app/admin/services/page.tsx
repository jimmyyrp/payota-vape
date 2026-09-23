'use client';

/**
 * ServicesAdmin - Main orchestrator for category/sub-category management.
 * Composes: useServicesAdmin hook, ServicesDataTable, ServicesFormDialog, ServicesConfirmDialogs.
 */

import React, { Suspense, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServicesAdmin, type ServicesTab } from './use-services-admin';
import { ServicesDataTable } from './services-data-table';
import { ServicesFormDialog } from './services-form-dialog';
import { ServicesConfirmDialogs } from './services-confirm-dialogs';

function ServicesAdminInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL STATE — agar tab, pencarian & halaman tetap sama setelah refresh.
  const tabRaw = searchParams?.get('tab');
  const initTab: ServicesTab = tabRaw === 'sub_categories' || tabRaw === 'categories' ? tabRaw : 'categories';
  const initQ = searchParams?.get('q') ?? '';
  const pageRaw = parseInt(searchParams?.get('page') ?? '1', 10);

  const {
    // Tabs
    activeTab,
    setActiveTab,
    // Data
    categories,
    loading,
    // Filter
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredItems,
    paginatedItems,
    // Selection
    selectedIds,
    setSelectedIds,
    // Form
    formData,
    setFormData,
    editingItem,
    setEditingItem,
    isAdding,
    setIsAdding,
    isSubmitting,
    isProcessing,
    fieldErrors,
    requestSave,
    handleSave,
    // Delete
    deleteId,
    setDeleteId,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    handleDeleteTrigger,
    handleDeleteConfirm,
    handleBulkDelete,
  } = useServicesAdmin({
    activeTab: initTab,
    searchTerm: initQ,
    currentPage: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  });

  // Sinkronkan tab, pencarian & halaman aktif ke URL (replace, tanpa reload).
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
      tab: activeTab === 'categories' ? null : activeTab,
      q: searchTerm || null,
      page: currentPage > 1 ? String(currentPage) : null,
    });
  }, [activeTab, searchTerm, currentPage, syncUrl]);

  return (
    <div className="space-y-6 animate-fade-up text-left pb-10 w-full max-w-full overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/60">
        <h1 className="text-xl font-headline font-bold text-foreground uppercase tracking-tighter">
          Katalog Layanan
        </h1>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              onClick={() => setBulkDeleteConfirm(true)}
              variant="destructive"
              disabled={isProcessing}
              className="h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50"
            >
              HAPUS ({selectedIds.length})
            </Button>
          )}
          <Button
            onClick={(e) => {
              (e.currentTarget as HTMLElement).blur();
              setEditingItem(null);
              setFormData({ name: '', category_id: '', price: '0', is_active: true });
              setIsAdding(true);
            }}
            className="bg-primary hover:opacity-90 text-white rounded-xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-md border-none w-full md:w-auto"
          >
            <Plus size={16} className="mr-2" /> Tambah {activeTab === 'categories' ? 'Kategori' : 'Sub'}
          </Button>
        </div>
      </div>

      {/* SEARCH & TABS */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1 w-full max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
          <Input
            placeholder="CARI KATALOG..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-xl bg-card border-none shadow-sm pl-11 text-[16px] md:text-[10px] font-bold uppercase tracking-widest"
          />
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'categories' | 'sub_categories')} className="w-full md:w-auto">
          <TabsList className="bg-card p-1 rounded-xl shadow-sm border border-border/60 h-11">
            <TabsTrigger value="categories" className="rounded-lg px-4 h-full text-[9px] font-black uppercase tracking-widest">
              KATEGORI
            </TabsTrigger>
            <TabsTrigger value="sub_categories" className="rounded-lg px-4 h-full text-[9px] font-black uppercase tracking-widest">
              SUB-KATEGORI
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* DATA TABLE */}
      <ServicesDataTable
        paginatedItems={paginatedItems}
        filteredItems={filteredItems}
        loading={loading}
        activeTab={activeTab}
        searchTerm={searchTerm}
        currentPage={currentPage}
        totalPages={totalPages}
        selectedIds={selectedIds}
        isProcessing={isProcessing}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
        onEdit={(item) => {
          setEditingItem(item);
          setFormData({
            name: item.name,
            category_id: (item as { category_id?: number }).category_id?.toString() || '',
            price: ((item as { price?: number }).price || 0).toString(),
            is_active: (item as { is_active?: boolean }).is_active ?? true,
          });
          setIsAdding(true);
        }}
        onDelete={handleDeleteTrigger}
        onSelectionChange={setSelectedIds}
      />

      {/* FORM DIALOG */}
      <ServicesFormDialog
        isOpen={isAdding}
        onOpenChange={setIsAdding}
        activeTab={activeTab}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
        onSave={() => {
          if (requestSave()) void handleSave();
        }}
      />

      {/* CONFIRM DIALOGS */}
      <ServicesConfirmDialogs
        deleteId={deleteId}
        onDeleteChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onDeleteConfirm={handleDeleteConfirm}
        bulkDeleteConfirm={bulkDeleteConfirm}
        onBulkDeleteChange={setBulkDeleteConfirm}
        onBulkDeleteConfirm={handleBulkDelete}
        selectedCount={selectedIds.length}
        isProcessing={isProcessing}
      />
    </div>
  );
}

export default function ServicesAdmin() {
  return (
    <Suspense fallback={null}>
      <ServicesAdminInner />
    </Suspense>
  );
}
