'use client';

/**
 * KaryaDataTable - Renders paginated list of Karya items.
 * Uses DropdownMenu 3-dot for actions with confirmation dialogs.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Edit2, Trash2, SearchX, Search, Copy, ExternalLink, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from '@/lib/utils';
import { formatCompactNumber } from '@/lib/formatters';
import type { KaryaPost, CategoryEntry, SubCategoryEntry } from './use-karya-admin';
import { AdminPagination } from '../components/AdminPagination';

export type StatusFilter = 'all' | 'active' | 'draft';

interface KaryaDataTableProps {
  paginatedItems: KaryaPost[];
  filteredItems: KaryaPost[];
  categories: CategoryEntry[];
  subCategories: SubCategoryEntry[];
  loading: boolean;
  searchTerm: string;
  catFilter: string;
  subCatFilter: string;
  currentPage: number;
  totalPages: number;
  counts: Record<StatusFilter, number>;
  trashedCount: number;
  duplicatingId: number | null;
  statusFilter: StatusFilter;
  selectedIds: number[];
  isProcessing: boolean;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSearchChange: (value: string) => void;
  onCatFilterChange: (value: string) => void;
  onSubCatFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (item: KaryaPost) => void;
  onDelete: (id: number) => void;
  onDuplicate: (item: KaryaPost) => void;
  onToggleActive: (item: KaryaPost) => void;
  onOpenTrash: () => void;
  onSelectionChange: (ids: number[]) => void;
}

type ConfirmType = 'duplicate' | 'toggle' | 'delete' | null;

export const KaryaDataTable: React.FC<KaryaDataTableProps> = ({
  paginatedItems,
  filteredItems,
  categories,
  subCategories,
  loading,
  searchTerm,
  catFilter,
  subCatFilter,
  currentPage,
  totalPages,
  counts,
  trashedCount,
  duplicatingId,
  statusFilter,
  selectedIds,
  isProcessing,
  onStatusFilterChange,
  onSearchChange,
  onCatFilterChange,
  onSubCatFilterChange,
  onPageChange,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleActive,
  onOpenTrash,
  onSelectionChange,
}) => {
  const [confirmType, setConfirmType] = useState<ConfirmType>(null);
  const [confirmItem, setConfirmItem] = useState<KaryaPost | null>(null);

  const toggleSelection = (id: number) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]
    );
  };

  const toggleAll = () => {
    onSelectionChange(selectedIds.length === paginatedItems.length ? [] : paginatedItems.map((i) => i.id));
  };

  const STATUS_TABS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Semua' },
    { value: 'active', label: 'Tayang' },
    { value: 'draft', label: 'Draf' },
  ];

  const openConfirm = (type: ConfirmType, item: KaryaPost) => {
    setConfirmType(type);
    setConfirmItem(item);
  };

  const handleConfirm = () => {
    if (!confirmItem || isProcessing) return;
    if (confirmType === 'duplicate') onDuplicate(confirmItem);
    else if (confirmType === 'toggle') onToggleActive(confirmItem);
    else if (confirmType === 'delete') onDelete(confirmItem.id);
    setConfirmType(null);
    setConfirmItem(null);
  };

  const ActionDropdown = ({ item }: { item: KaryaPost }) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="h-9 w-9 text-primary/30 hover:text-primary flex items-center justify-center transition-all hover:bg-primary/5 rounded-xl" title="Opsi">
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl border-border/60 shadow-xl bg-card">
        {item.is_active && (
          <DropdownMenuItem asChild className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
            <Link href={`/karya/${item.id}`} target="_blank">
              <ExternalLink size={13} /> Lihat Publik
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => { setTimeout(() => { const a = document.activeElement; if (a && a instanceof HTMLElement) a.blur(); onEdit(item); }, 0); }} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
          <Edit2 size={13} /> Ubah
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openConfirm('duplicate', item)} disabled={duplicatingId === item.id} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
          <Copy size={13} className={duplicatingId === item.id ? 'animate-pulse' : ''} /> Duplikat
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openConfirm('toggle', item)} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
          {item.is_active ? <EyeOff size={13} /> : <Eye size={13} />} {item.is_active ? 'Arsipkan' : 'Tayangkan'}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-primary/5" />
        <DropdownMenuItem onClick={() => openConfirm('delete', item)} className="rounded-xl text-[9px] font-bold uppercase tracking-widest text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
          <Trash2 size={13} /> Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* TAB STATUS + TOMBOL SAMPAH */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="hidden md:flex bg-card rounded-xl p-1 border border-border/60 shadow-sm">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatusFilterChange(tab.value)}
              className={`px-4 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                statusFilter === tab.value ? 'bg-primary text-white shadow-md' : 'text-primary/40 hover:text-primary'
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-md font-mono ${
                  statusFilter === tab.value ? 'bg-white/20 text-white' : 'bg-primary/5'
                }`}
              >
                {counts[tab.value]}
              </span>
            </button>
          ))}
        </div>
        <div className="md:hidden flex-1 min-w-0">
          <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
            <SelectTrigger className="h-11 rounded-xl bg-card border-none shadow-sm w-full px-4 text-[10px] font-black uppercase tracking-widest text-primary">
              <SelectValue placeholder="STATUS KARYA" />
            </SelectTrigger>
            <SelectContent align="start">
              {STATUS_TABS.map((tab) => (
                <SelectItem key={tab.value} value={tab.value} className="text-[10px] font-black uppercase tracking-widest">
                  {tab.label} ({counts[tab.value]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={onOpenTrash}
          className="ml-auto h-11 rounded-xl bg-card border-border/60 shadow-sm text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary"
        >
          <Trash2 size={14} className="mr-2" /> Sampah
          {trashedCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive font-mono">{trashedCount}</span>
          )}
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center min-w-0 w-full">
        <div className="relative flex-1 w-full min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
          <Input
            placeholder="CARI JUDUL PRODUK..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full min-w-0 rounded-xl bg-card border-none shadow-sm pl-11 pr-4 text-[13px] md:text-[10px] font-bold uppercase focus:ring-2 focus:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <Select value={catFilter} onValueChange={onCatFilterChange}>
          <SelectTrigger className="h-11 rounded-xl bg-card border-none shadow-sm w-full lg:w-44 text-[13px] md:text-[9px] font-bold uppercase min-w-0">
            <SelectValue placeholder="KATEGORI" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[13px] md:text-[9px] font-bold uppercase">
              SEMUA KATEGORI
            </SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()} className="text-[13px] md:text-[9px] font-bold uppercase">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={subCatFilter} onValueChange={onSubCatFilterChange}>
          <SelectTrigger className="h-11 rounded-xl bg-card border-none shadow-sm w-full lg:w-48 text-[13px] md:text-[9px] font-bold uppercase min-w-0">
            <SelectValue placeholder="SUBKATEGORI" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[13px] md:text-[9px] font-bold uppercase">
              SEMUA SUBKATEGORI
            </SelectItem>
            {subCategories
              .filter((sc) => catFilter === 'all' || sc.category_id === Number(catFilter))
              .map((sc) => (
                <SelectItem key={sc.id} value={sc.id.toString()} className="text-[13px] md:text-[9px] font-bold uppercase">
                  {sc.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* LOADING & EMPTY STATE */}
      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card p-4 rounded-[2rem] border border-border/60 shadow-sm flex gap-4 items-center">
                <div className="w-16 h-12 rounded-xl bg-primary/[0.04] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-2/3 rounded bg-primary/[0.04] animate-pulse" />
                  <div className="h-2.5 w-1/3 rounded bg-primary/[0.04] animate-pulse" />
                </div>
                <div className="h-9 w-9 rounded-xl bg-primary/[0.04] animate-pulse" />
              </div>
            ))}
          </div>
          <div className="hidden md:block bg-card rounded-[2rem] shadow-sm border border-border/60 overflow-hidden">
            <div className="flex items-center gap-6 px-8 py-3 bg-primary/[0.02]">
              <div className="h-3 w-12 rounded bg-primary/[0.04] animate-pulse" />
              <div className="h-3 w-36 rounded bg-primary/[0.04] animate-pulse" />
              <div className="h-3 w-24 rounded bg-primary/[0.04] animate-pulse" />
              <div className="flex-1" />
              <div className="h-3 w-20 rounded bg-primary/[0.04] animate-pulse" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-8 py-3 border-b border-border/60">
                <div className="w-14 h-10 rounded-xl bg-primary/[0.04] animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 rounded bg-primary/[0.04] animate-pulse" style={{ width: `${40 + Math.random() * 30}%` }} />
                  <div className="h-2.5 w-16 rounded bg-primary/[0.04] animate-pulse" />
                </div>
                <div className="h-5 w-12 rounded-md bg-primary/[0.04] animate-pulse" />
                <div className="h-9 w-9 rounded-xl bg-primary/[0.04] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-card rounded-[2rem] py-32 flex flex-col items-center justify-center space-y-4 text-center border border-border/60">
          <SearchX size={40} className="text-primary/10" />
          <p className="text-[10px] text-primary/30 font-black uppercase tracking-widest">Arsip tidak ditemukan</p>
        </div>
      ) : (
        <>
          {/* MOBILE SELECT ALL BAR */}
          <div className="flex items-center justify-between gap-3 md:hidden bg-card rounded-2xl p-3 border border-border/60 shadow-sm">
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
            >
              <span className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                selectedIds.length === paginatedItems.length && paginatedItems.length > 0
                  ? 'bg-primary border-primary shadow-sm'
                  : 'border-primary/30 bg-card'
              }`}>
                {selectedIds.length === paginatedItems.length && paginatedItems.length > 0 && (
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                )}
              </span>
              {selectedIds.length === paginatedItems.length && paginatedItems.length > 0 ? 'Batalkan Semua' : 'Pilih Semua'}
            </button>
            {selectedIds.length > 0 && (
              <span className="text-[9px] font-black text-primary/40 font-mono">
                {selectedIds.length} dipilih
              </span>
            )}
          </div>

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {paginatedItems.map((item) => (
              <div
                key={item.id}
                className={`bg-card p-4 rounded-[2rem] border shadow-sm flex gap-4 items-center animate-fade-up transition-all ${
                  selectedIds.includes(item.id)
                    ? 'border-primary/30 bg-primary/[0.04] ring-1 ring-primary/10'
                    : 'border-border/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleSelection(item.id)}
                  className={`shrink-0 relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
                    selectedIds.includes(item.id)
                      ? 'bg-primary border-primary shadow-sm'
                      : 'border-primary/20 bg-card'
                  }`}
                  aria-label={`Pilih ${item.title}`}
                >
                  {selectedIds.includes(item.id) && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                </button>
                <div className="w-16 h-12 relative rounded-xl overflow-hidden border border-border/60 shrink-0">
                  <img
                    src={item.images?.[0]?.url_images || `https://picsum.photos/seed/fee_${item.id}/400/300`}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground text-[11px] uppercase truncate">{item.title}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[8px] text-primary font-black uppercase flex items-center gap-1">
                      <Eye size={10} /> {formatCompactNumber(item.views)}
                    </span>
                    <span className="text-[8px] text-primary/20 font-mono">#{item.id}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <ActionDropdown item={item} />
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-card rounded-[2rem] shadow-sm border border-border/60 overflow-x-auto no-scrollbar">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-primary/5">
                <TableRow className="border-none h-11">
                  <TableHead className="w-12 pl-8">
                    <button
                      type="button"
                      onClick={toggleAll}
                      className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                        selectedIds.length === paginatedItems.length && paginatedItems.length > 0
                          ? 'bg-primary border-primary shadow-sm'
                          : 'border-primary/30 hover:border-border/600 bg-card'
                      }`}
                    >
                      {selectedIds.length === paginatedItems.length && paginatedItems.length > 0 && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                    </button>
                  </TableHead>
                  <TableHead className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40">Visual</TableHead>
                  <TableHead className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40">Identitas Karya</TableHead>
                  <TableHead className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40">Atribut</TableHead>
                  <TableHead className="w-20 text-right pr-8">Opsi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id} className="border-border/60 hover:bg-primary/5 transition-colors">
                    <TableCell className="py-3 pl-8">
                      <button
                        type="button"
                        onClick={() => toggleSelection(item.id)}
                        className={`relative flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
                          selectedIds.includes(item.id)
                            ? 'bg-primary border-primary shadow-sm'
                            : 'border-primary/30 hover:border-border/600 bg-card'
                        }`}
                        aria-label={`Pilih ${item.title}`}
                      >
                        {selectedIds.includes(item.id) && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                      </button>
                    </TableCell>
                    <TableCell className="py-3 pl-8">
                      <div className="w-14 h-10 relative rounded-xl overflow-hidden border border-border/60 bg-primary/5 shadow-inner">
                        <img
                          src={item.images?.[0]?.url_images || `https://picsum.photos/seed/fee_${item.id}/400/300`}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="font-bold text-foreground text-[11px] uppercase truncate max-w-[250px]">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[8px] text-primary font-black uppercase flex items-center gap-1">
                          <Eye size={10} /> {formatCompactNumber(item.views)}
                        </span>
                        <span className="text-[8px] text-primary/20 font-mono">#{item.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {!item.is_active && (
                          <span className="px-2 py-1 rounded-md bg-destructive/10 text-destructive text-[7px] font-black uppercase tracking-wider whitespace-nowrap border border-destructive/20">
                            DRAFT
                          </span>
                        )}
                        {(item.categories || []).slice(0, 1).map((c) => (
                          <span
                            key={c.id}
                            className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[7px] font-black uppercase tracking-wider whitespace-nowrap"
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 pr-8 text-right">
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
            variant="boxed"
            className="p-4 border-t border-border/60 bg-card rounded-b-[2rem]"
          />
        </>
      )}

      {/* ========== CONFIRM DIALOGS ========== */}

      {/* CONFIRM: DUPLIKAT */}
      <AlertDialog open={confirmType === 'duplicate'} onOpenChange={(v) => { if (!v) { setConfirmType(null); setConfirmItem(null); } }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Copy size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Duplikat Karya?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest italic mb-6 leading-relaxed">
              &quot;{confirmItem?.title}&quot; akan disalin sebagai draf baru di Manajemen Karya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">BATAL</AlertDialogCancel>
            <AlertDialogAction disabled={isProcessing} onClick={(e) => { e.preventDefault(); handleConfirm(); }} className="bg-primary text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50">YA, DUPLIKAT</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRM: TOGGLE STATUS */}
      <AlertDialog open={confirmType === 'toggle'} onOpenChange={(v) => { if (!v) { setConfirmType(null); setConfirmItem(null); } }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className={cn('w-16 h-16 rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner', confirmItem?.is_active ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success')}>
            {confirmItem?.is_active ? <EyeOff size={32} /> : <Eye size={32} />}
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              {confirmItem?.is_active ? 'Arsipkan Karya?' : 'Tayangkan Karya?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest italic mb-6 leading-relaxed">
              &quot;{confirmItem?.title}&quot; {confirmItem?.is_active ? 'akan disembunyikan dari galeri publik.' : 'akan ditampilkan di galeri publik.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">BATAL</AlertDialogCancel>
            <AlertDialogAction disabled={isProcessing} onClick={(e) => { e.preventDefault(); handleConfirm(); }} className={cn('text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50', confirmItem?.is_active ? 'bg-warning/100' : 'bg-success/100')}>
              {confirmItem?.is_active ? 'YA, ARSIPKAN' : 'YA, TAYANGKAN'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRM: HAPUS */}
      <AlertDialog open={confirmType === 'delete'} onOpenChange={(v) => { if (!v) { setConfirmType(null); setConfirmItem(null); } }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Trash2 size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Hapus Karya Ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest italic mb-6 leading-relaxed">
              &quot;{confirmItem?.title}&quot; akan dipindahkan ke Sampah. Masih bisa dipulihkan dari Manajemen Karya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel disabled={isProcessing} className="rounded-xl h-12 text-[10px] font-black bg-primary/5 border-none flex-1">BATAL</AlertDialogCancel>
            <AlertDialogAction disabled={isProcessing} onClick={(e) => { e.preventDefault(); handleConfirm(); }} className="bg-destructive/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all disabled:opacity-50">YA, HAPUS</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
