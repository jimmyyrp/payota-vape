'use client';

/**
 * UsersAdmin - Main orchestrator for team/user management.
 * Search & halaman tersinkron ke URL (?q=&page=) agar tetap di posisi
 * yang sama setelah refresh.
 */

import React, { Suspense, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsersAdmin } from './use-users-admin';
import { UsersDataTable } from './users-data-table';
import { UsersFormDialog } from './users-form-dialog';
import { UsersConfirmDialogs } from './users-confirm-dialogs';

function UsersAdminInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL STATE — agar refresh tetap di halaman & pencarian yang sama.
  const initQ = searchParams?.get('q') ?? '';
  const pageRaw = parseInt(searchParams?.get('page') ?? '1', 10);

  const {
    loading,
    currentUserRole,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredUsers,
    paginatedUsers,
    selectedIds,
    setSelectedIds,
    formData,
    setFormData,
    isAdding,
    setIsAdding,
    editingUser,
    setEditingUser,
    startEdit,
    submitting,
    isProcessing,
    fieldErrors,
    requestSave,
    handleSave,
    deleteConfirmId,
    setDeleteConfirmId,
    bulkDeleteConfirm,
    setBulkDeleteConfirm,
    handleDeleteConfirm,
    handleBulkDelete,
    fetchData,
  } = useUsersAdmin({
    searchTerm: initQ,
    currentPage: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  });

  // Sinkronkan pencarian & halaman aktif ke URL (replace, tanpa reload penuh).
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
      q: searchTerm || null,
      page: currentPage > 1 ? String(currentPage) : null,
    });
  }, [searchTerm, currentPage, syncUrl]);

  return (
    <div className="space-y-6 animate-fade-up text-left pb-10 w-full max-w-full overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/60">
        <h1 className="text-xl font-headline font-bold text-foreground uppercase tracking-tighter">Kelola Tim</h1>
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
              setEditingUser(null);
              setFormData({ username: '', password: '', full_name: '', role: 'staff' });
              setIsAdding(true);
            }}
            className="bg-primary hover:opacity-90 text-white rounded-xl h-11 px-8 text-[10px] font-black uppercase tracking-widest shadow-md border-none w-full md:w-auto"
          >
            <Plus size={16} className="mr-2" /> Registrasi Anggota
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-full lg:max-w-xs">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
        <Input
          placeholder="CARI STAF / ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 rounded-xl bg-card border-none shadow-sm pl-11 text-[16px] md:text-[10px] font-bold uppercase tracking-widest"
        />
      </div>

      {/* DATA TABLE */}
      <UsersDataTable
        paginatedUsers={paginatedUsers}
        filteredUsers={filteredUsers}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        selectedIds={selectedIds}
        isProcessing={isProcessing}
        onPageChange={setCurrentPage}
        onDelete={setDeleteConfirmId}
        onEdit={startEdit}
        onSelectionChange={setSelectedIds}
        onRefresh={fetchData}
      />

      {/* FORM DIALOG */}
      <UsersFormDialog
        isOpen={isAdding}
        onOpenChange={(open) => {
          setIsAdding(open);
          if (!open) setEditingUser(null);
        }}
        formData={formData}
        setFormData={setFormData}
        currentUserRole={currentUserRole}
        editingUser={editingUser}
        fieldErrors={fieldErrors}
        submitting={submitting}
        onSave={() => {
          if (requestSave()) void handleSave();
        }}
      />

      {/* CONFIRM DIALOGS */}
      <UsersConfirmDialogs
        deleteConfirmId={deleteConfirmId}
        onDeleteChange={(open) => {
          if (!open) setDeleteConfirmId(null);
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

export default function UsersAdmin() {
  return (
    <Suspense fallback={null}>
      <UsersAdminInner />
    </Suspense>
  );
}