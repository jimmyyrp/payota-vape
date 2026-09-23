'use client';

/**
 * UsersDataTable - Renders paginated list of user/team members.
 * Uses DropdownMenu 3-dot for actions with confirmation dialog for delete.
 */

import React, { useState } from 'react';
import { Trash2, Edit2, UserX, ShieldCheck, Terminal, MoreHorizontal } from 'lucide-react';
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
import { cn } from '@/lib/utils';
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
import type { UserItem } from './use-users-admin';
import { AdminPagination } from '../components/AdminPagination';

function getRoleBadge(role: string) {
  const base = 'px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-[0.2em] border flex items-center gap-1.5 whitespace-nowrap';
  if (role === 'developer') {
    return { className: cn(base, 'bg-purple-50 text-purple-600 border-purple-50'), icon: Terminal };
  }
  if (role === 'admin') {
    return { className: cn(base, 'bg-primary/10 text-primary border-primary/10'), icon: ShieldCheck };
  }
  return { className: cn(base, 'bg-blue-50 text-blue-600 border-blue-50'), icon: null };
}

interface UsersDataTableProps {
  paginatedUsers: UserItem[];
  filteredUsers: UserItem[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  selectedIds: number[];
  isProcessing?: boolean;
  onPageChange: (page: number) => void;
  onEdit: (user: UserItem) => void;
  onDelete: (id: number) => void;
  onSelectionChange: (ids: number[]) => void;
  onRefresh: () => void;
}

export const UsersDataTable: React.FC<UsersDataTableProps> = ({
  paginatedUsers,
  filteredUsers,
  loading,
  currentPage,
  totalPages,
  selectedIds,
  isProcessing = false,
  onPageChange,
  onEdit,
  onDelete,
  onSelectionChange,
  onRefresh,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);

  const toggleSelection = (id: number) => {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]
    );
  };

  const toggleAll = () => {
    onSelectionChange(selectedIds.length === paginatedUsers.length ? [] : paginatedUsers.map((u) => u.id));
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const ActionDropdown = ({ user }: { user: UserItem }) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="h-9 w-9 text-primary/30 hover:text-primary flex items-center justify-center transition-all hover:bg-primary/5 rounded-xl" title="Opsi">
          <MoreHorizontal size={15} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 rounded-xl border-border/60 shadow-lg bg-card">
        <DropdownMenuItem onClick={() => setTimeout(() => { const a = document.activeElement; if (a && a instanceof HTMLElement) a.blur(); onEdit(user); }, 0)} className="rounded-lg text-[8px] font-bold uppercase tracking-widest text-primary/60 cursor-pointer">
          <Edit2 size={12} /> Ubah
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setDeleteTarget(user)} className="rounded-lg text-[8px] font-bold uppercase tracking-widest text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
          <Trash2 size={12} /> Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card p-4 rounded-[2rem] border border-border/60 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded bg-primary/[0.04] animate-pulse" />
                  <div className="w-10 h-10 rounded-xl bg-primary/[0.04] animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 rounded bg-primary/[0.04] animate-pulse" />
                    <div className="h-2.5 w-20 rounded bg-primary/[0.04] animate-pulse" />
                  </div>
                </div>
                <div className="h-9 w-9 rounded-xl bg-primary/[0.04] animate-pulse" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border/60">
                <div className="h-5 w-20 rounded-md bg-primary/[0.04] animate-pulse" />
                <div className="h-2.5 w-16 rounded bg-primary/[0.04] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block bg-card rounded-[2rem] shadow-sm border border-border/60 overflow-hidden">
          <div className="flex items-center gap-6 px-8 py-3 bg-primary/[0.02]">
            <div className="h-4 w-4 rounded bg-primary/[0.04] animate-pulse" />
            <div className="h-3 w-28 rounded bg-primary/[0.04] animate-pulse" />
            <div className="h-3 w-24 rounded bg-primary/[0.04] animate-pulse" />
            <div className="h-3 w-20 rounded bg-primary/[0.04] animate-pulse" />
            <div className="flex-1" />
            <div className="h-3 w-16 rounded bg-primary/[0.04] animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-8 py-3 border-b border-border/60">
              <div className="h-4 w-4 rounded bg-primary/[0.04] animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/[0.04] animate-pulse" />
                <div className="h-3.5 w-28 rounded bg-primary/[0.04] animate-pulse" />
              </div>
              <div className="h-3 w-20 rounded bg-primary/[0.04] animate-pulse" />
              <div className="h-5 w-20 rounded-md bg-primary/[0.04] animate-pulse" />
              <div className="flex-1" />
              <div className="h-9 w-9 rounded-xl bg-primary/[0.04] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="bg-card rounded-[2.5rem] shadow-sm border border-border/60 overflow-hidden py-32 flex flex-col items-center justify-center space-y-6 text-center">
        <div className="w-20 h-20 bg-primary/5 rounded-[2.5rem] flex items-center justify-center text-primary/20 shadow-inner">
          <UserX size={40} />
        </div>
        <h2 className="text-sm font-headline font-bold text-foreground uppercase tracking-widest">Daftar Tim Kosong</h2>
        <Button
          onClick={onRefresh}
          variant="outline"
          className="rounded-xl h-12 px-8 border-border/60 text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all"
        >
          REFRESH DATA
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* MOBILE CARDS */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginatedUsers.map((u) => (
          <div key={u.id} className="bg-card p-4 rounded-[2rem] border border-border/60 shadow-sm flex flex-col gap-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.includes(u.id)}
                  onCheckedChange={() => toggleSelection(u.id)}
                />
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-[12px] border border-primary/10">
                  {u.full_name?.charAt(0)}
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-foreground text-[11px] uppercase tracking-wider">{u.full_name}</p>
                  <p className="font-mono text-[9px] text-primary/30">@{u.username}</p>
                </div>
              </div>
              <ActionDropdown user={u} />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              {(() => {
                const badge = getRoleBadge(u.role);
                const Icon = badge.icon;
                return (
                  <span className={badge.className}>
                    {Icon && <Icon size={10} />}
                    {u.role.toUpperCase()}
                  </span>
                );
              })()}
              <span className="text-[8px] text-primary/20 font-bold uppercase">
                {new Date(u.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-card rounded-[2rem] shadow-sm border border-border/60 overflow-x-auto no-scrollbar">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-primary/5">
            <TableRow className="border-none h-12">
              <TableHead className="w-12 pl-8">
                <Checkbox
                  checked={selectedIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40">Nama Personel</TableHead>
              <TableHead className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40">ID Akses</TableHead>
              <TableHead className="text-[8px] font-black uppercase tracking-[0.3em] text-primary/40 text-center">Otoritas</TableHead>
              <TableHead className="w-20 text-right pr-8">Opsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((u) => (
              <TableRow key={u.id} className="border-border/60 hover:bg-primary/5 transition-colors">
                <TableCell className="pl-8">
                  <Checkbox
                    checked={selectedIds.includes(u.id)}
                    onCheckedChange={() => toggleSelection(u.id)}
                  />
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-[11px] uppercase border border-primary/10">
                      {u.full_name?.charAt(0)}
                    </div>
                    <p className="font-bold text-foreground text-[11px] uppercase tracking-wider whitespace-nowrap">
                      {u.full_name}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="py-3 font-mono text-[10px] text-primary/40">@{u.username}</TableCell>
                <TableCell className="py-3 text-center">
                  {(() => {
                    const badge = getRoleBadge(u.role);
                    const Icon = badge.icon;
                    return (
                      <span className={cn(badge.className, 'mx-auto w-fit')}>
                        {Icon && <Icon size={10} />}
                        {u.role.toUpperCase()}
                      </span>
                    );
                  })()}
                </TableCell>
                <TableCell className="py-3 pr-8 text-right">
                  <div className="flex justify-end">
                    <ActionDropdown user={u} />
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
        variant="bold"
        className="pt-6 px-4"
      />

      {/* CONFIRM: HAPUS */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-4xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[1.8rem] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Trash2 size={32} />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-headline text-foreground uppercase font-bold">
              Hapus Personel Ini?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[10px] text-primary/30 uppercase tracking-widest italic mb-6 leading-relaxed">
              &quot;{deleteTarget?.full_name}&quot; akan dihapus permanen dari daftar tim.
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
