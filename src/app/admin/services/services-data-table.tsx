'use client';

/**
 * ServicesDataTable - Renders paginated list of category/sub-category items.
 * Uses DropdownMenu 3-dot for actions with confirmation dialog for delete.
 */

import React, { useState } from 'react';
import { Edit2, Trash2, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatPrice } from '@/lib/formatters';
import type { ServicesTab, ServiceItem } from './use-services-admin';
import { AdminPagination } from '../components/AdminPagination';

interface ServicesDataTableProps {
  paginatedItems: ServiceItem[];
  filteredItems: ServiceItem[];
  loading: boolean;
  activeTab: ServicesTab;
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  selectedIds: number[];
  isProcessing?: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (item: ServiceItem) => void;
  onDelete: (id: number) => void;
  onSelectionChange: (ids: number[]) => void;
}

export const ServicesDataTable: React.FC<ServicesDataTableProps> = ({
  paginatedItems,
  filteredItems,
  loading,
  activeTab,
  searchTerm,
  currentPage,
  totalPages,
  selectedIds,
  isProcessing = false,
  onSearchChange,
  onPageChange,
  onEdit,
  onDelete,
  onSelectionChange,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);

  const isSubTab = activeTab === 'sub_categories';

  const toggleSelection = (id: number) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]
    );
  };

  const toggleAll = () => {
    onSelectionChange(selectedIds.length === paginatedItems.length ? [] : paginatedItems.map((i) => i.id));
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const ActionDropdown = ({ item }: { item: ServiceItem }) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="h-7 w-7 text-primary/20 hover:text-primary flex items-center justify-center transition-all hover:bg-primary/5 rounded-lg" title="Opsi">
          <MoreHorizontal size={14} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl border-border/60 shadow-lg bg-card">
        <DropdownMenuItem onClick={() => setTimeout(() => { const a = document.activeElement; if (a && a instanceof HTMLElement) a.blur(); onEdit(item); }, 0)} className="rounded-lg text-[8px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
          <Edit2 size={12} /> Ubah
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setDeleteTarget(item)} className="rounded-lg text-[8px] font-bold uppercase tracking-widest text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
          <Trash2 size={12} /> Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-2 md:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card p-3 rounded-2xl border border-border/60 flex items-center justify-between shadow-sm">
              <div className="space-y-1.5 ml-6">
                <div className="h-2 w-6 rounded bg-primary/[0.04] animate-pulse" />
                <div className="h-3 w-28 rounded bg-primary/[0.04] animate-pulse" />
                <div className="h-2 w-20 rounded bg-primary/[0.04] animate-pulse" />
              </div>
              <div className="h-7 w-7 rounded-lg bg-primary/[0.04] animate-pulse" />
            </div>
          ))}
        </div>
        <div className="hidden md:block bg-card rounded-[1.5rem] shadow-sm border border-border/60 overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-3 bg-primary/[0.02]">
            <div className="h-4 w-4 rounded bg-primary/[0.04] animate-pulse" />
            <div className="h-3 w-12 rounded bg-primary/[0.04] animate-pulse" />
            <div className="h-3 w-40 rounded bg-primary/[0.04] animate-pulse" />
            <div className="h-3 w-24 rounded bg-primary/[0.04] animate-pulse" />
            <div className="flex-1" />
            <div className="h-3 w-16 rounded bg-primary/[0.04] animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3 border-b border-border/60">
              <div className="h-4 w-4 rounded bg-primary/[0.04] animate-pulse" />
              <div className="h-3 w-8 rounded bg-primary/[0.04] animate-pulse" />
              <div className="h-3.5 w-32 rounded bg-primary/[0.04] animate-pulse" />
              <div className="flex-1" />
              <div className="h-7 w-7 rounded-lg bg-primary/[0.04] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MOBILE CARDS */}
      <div className="grid grid-cols-1 gap-2 md:hidden">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="bg-card p-3 rounded-2xl border border-border/60 flex items-center justify-between shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedIds.includes(item.id)}
                onCheckedChange={() => toggleSelection(item.id)}
                className="h-4 w-4 rounded-md"
              />
            </div>
            <div className="space-y-0.5 ml-6">
              <span className="text-[6px] text-primary/20 font-mono">#{item.id}</span>
              <h4 className="text-[9px] font-bold text-foreground uppercase">{item.name}</h4>
              {isSubTab && (
                <div className="flex items-center gap-2">
                  <p className="text-[6px] text-primary font-black uppercase whitespace-nowrap">
                    {(item as { categories?: { name: string } }).categories?.name}
                  </p>
                  <span className="text-primary/10">•</span>
                  <p className="text-[6px] text-primary/40 font-black whitespace-nowrap">
                    {formatPrice((item as { price?: number }).price || 0)}
                  </p>
                </div>
              )}
            </div>
            <ActionDropdown item={item} />
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-card rounded-[1.5rem] shadow-sm border border-border/60 overflow-x-auto no-scrollbar">
        <Table className="min-w-[700px]">
          <TableHeader className="bg-primary/5">
            <TableRow className="border-none h-9">
              <TableHead className="w-12 pl-6">
                <Checkbox
                  checked={selectedIds.length === paginatedItems.length && paginatedItems.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="font-black text-primary/40 uppercase text-[7px] tracking-[0.3em]">Indeks</TableHead>
              <TableHead className="font-black text-primary/40 uppercase text-[7px] tracking-[0.3em]">Identitas Katalog</TableHead>
              {isSubTab && (
                <TableHead className="font-black text-primary/40 uppercase text-[7px] tracking-[0.3em]">Kategori Induk</TableHead>
              )}
              {isSubTab && (
                <TableHead className="font-black text-primary/40 uppercase text-[7px] tracking-[0.3em]">Estimasi Mulai</TableHead>
              )}
              <TableHead className="w-20 text-right pr-6">Opsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id} className="border-border/60 hover:bg-primary/5 transition-colors">
                <TableCell className="pl-6">
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => toggleSelection(item.id)}
                  />
                </TableCell>
                <TableCell className="py-2 font-mono text-[7px] text-primary/20">#{item.id}</TableCell>
                <TableCell className="py-2 font-bold text-foreground text-[9px] uppercase tracking-widest whitespace-nowrap">
                  {item.name}
                </TableCell>
                {isSubTab && (
                  <TableCell className="py-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[7px] font-black uppercase border border-border/60 whitespace-nowrap">
                      {(item as { categories?: { name: string } }).categories?.name}
                    </span>
                  </TableCell>
                )}
                {isSubTab && (
                  <TableCell className="py-2 font-black text-[8px] text-primary whitespace-nowrap">
                    {formatPrice((item as { price?: number }).price || 0)}
                  </TableCell>
                )}
                <TableCell className="py-2 pr-6 text-right">
                  <div className="flex justify-end">
                    <ActionDropdown item={item} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        variant="tiny"
        className="flex-wrap gap-3 pt-4"
      />

      {/* CONFIRM: HAPUS */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Trash2 size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Hapus Katalog Ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest italic mb-6 leading-relaxed">
              &quot;{deleteTarget?.name}&quot; akan dihapus permanen dari katalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">BATAL</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); if (!isProcessing) handleConfirmDelete(); }}
              disabled={isProcessing}
              className="bg-destructive/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isProcessing ? 'MEMPROSES...' : 'YA, HAPUS'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
