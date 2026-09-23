'use client';

/**
 * UsersFormDialog - Add new user/staff form dialog.
 * Responsive: bottom-sheet on mobile, centered popup on desktop.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ErrorBanner, FieldHint, INVALID_RING } from '@/components/ui/form-validation';
import { cn } from '@/lib/utils';
import type { UserFormData, UserFieldErrors } from './use-users-admin';
import type { UserItem } from './use-users-admin';

interface UsersFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  currentUserRole: string;
  editingUser: UserItem | null;
  fieldErrors: UserFieldErrors;
  submitting: boolean;
  onSave: () => void;
}

export const UsersFormDialog: React.FC<UsersFormDialogProps> = ({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  currentUserRole,
  editingUser,
  fieldErrors,
  submitting,
  onSave,
}) => {
  const isEdit = !!editingUser;
  const errorList = Object.values(fieldErrors).filter(Boolean) as string[];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] md:max-h-[85vh] md:max-w-[400px] flex flex-col bg-card shadow-5xl border-none overflow-hidden p-0" onCloseAutoFocus={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="bg-primary px-6 py-5 md:px-8 md:py-8 text-white relative shrink-0">
          <DialogTitle className="text-base md:text-lg font-headline font-bold uppercase tracking-widest relative z-10">
            {isEdit ? 'Ubah Data Staf' : 'Staf Baru'}
          </DialogTitle>
          <DialogDescription className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/40 relative z-10 font-medium">
            {isEdit
              ? `Perbarui profil & otoritas untuk ${editingUser?.username}.`
              : 'Panel pendaftaran otorisasi tim operasional Vape Store.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 md:px-8 md:py-8 md:pt-6 space-y-5">
          {errorList.length > 0 && <ErrorBanner errors={errorList} className="rounded-2xl" />}

          {/* FULL NAME */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">Nama Lengkap</Label>
            <Input
              value={formData.full_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
              className={cn(
                'h-12 rounded-2xl bg-primary/5 border-none px-5 shadow-inner text-sm font-bold text-foreground',
                fieldErrors.full_name && INVALID_RING
              )}
              placeholder="E.G. AHMAD ARSITEK"
            />
            <FieldHint message={fieldErrors.full_name} />
          </div>

          {/* USERNAME & PASSWORD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">ID Pengguna</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                className={cn(
                  'h-12 rounded-2xl bg-primary/5 border-none px-5 shadow-inner text-sm font-bold text-foreground',
                  fieldErrors.username && INVALID_RING
                )}
                placeholder="USERNAME"
              />
              <FieldHint message={fieldErrors.username} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">
                Kode Rahasia {isEdit && <span className="normal-case text-primary/20">(kosongkan jika tetap)</span>}
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className={cn(
                  'h-12 rounded-2xl bg-primary/5 border-none px-5 shadow-inner text-sm font-bold',
                  fieldErrors.password && INVALID_RING
                )}
                placeholder={isEdit ? '••••••' : 'MIN. 6 KARAKTER'}
              />
              <FieldHint message={fieldErrors.password} />
            </div>
          </div>

          {/* ROLE */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">Otoritas Sistem</Label>
            <Select value={formData.role} onValueChange={(val) => setFormData((prev) => ({ ...prev, role: val }))}>
              <SelectTrigger
                className={cn(
                  'h-12 rounded-2xl bg-primary/5 border-none px-5 text-sm font-black uppercase shadow-inner ring-0 focus:ring-0',
                  fieldErrors.role && INVALID_RING
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-5xl p-2 bg-card z-[320]">
                <SelectItem value="staff" className="text-[16px] md:text-[10px] font-black uppercase py-3 rounded-xl hover:bg-primary/5">
                  CONTENT STAFF
                </SelectItem>
                <SelectItem value="admin" className="text-[16px] md:text-[10px] font-black uppercase py-3 rounded-xl hover:bg-primary/5 text-primary">
                  SUPER ADMIN
                </SelectItem>
                {currentUserRole === 'developer' && (
                  <SelectItem value="developer" className="text-[16px] md:text-[10px] font-black uppercase py-3 rounded-xl hover:bg-primary/5 text-purple-600">
                    SYSTEM DEVELOPER
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FieldHint message={fieldErrors.role} />
          </div>
        </div>

        {/* ACTIONS - sticky footer */}
        <div className="shrink-0 p-5 md:p-8 pt-4 border-t border-border/60 flex gap-3 bg-card">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-[10px] font-black uppercase text-primary/30 hover:text-primary/30 hover:bg-primary/5 h-12 px-4 flex-1"
          >
            Batal
          </Button>
          <Button
            disabled={submitting}
            onClick={onSave}
            className="bg-primary hover:opacity-90 text-white rounded-[1.5rem] h-12 px-6 md:px-8 text-[10px] font-black uppercase shadow-2xl border-none transition-all flex-[1.5] active:scale-95"
          >
            {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : isEdit ? 'SIMPAN PERUBAHAN' : 'AKTIFKAN AKSES'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
