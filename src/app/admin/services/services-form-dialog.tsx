'use client';

/**
 * ServicesFormDialog - Add/Edit form for categories and sub-categories.
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
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ErrorBanner, FieldHint, INVALID_RING } from '@/components/ui/form-validation';
import { cn } from '@/lib/utils';
import type { ServicesTab, ServiceItem, ServiceFormData, CategoryItem, ServiceFieldErrors } from './use-services-admin';

interface ServicesFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab: ServicesTab;
  editingItem: ServiceItem | null;
  formData: ServiceFormData;
  setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
  categories: CategoryItem[];
  fieldErrors: ServiceFieldErrors;
  isSubmitting: boolean;
  onSave: () => void;
}

export const ServicesFormDialog: React.FC<ServicesFormDialogProps> = ({
  isOpen,
  onOpenChange,
  activeTab,
  editingItem,
  formData,
  setFormData,
  categories,
  fieldErrors,
  isSubmitting,
  onSave,
}) => {
  const isSubTab = activeTab === 'sub_categories';
  const errorList = Object.values(fieldErrors).filter(Boolean) as string[];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[400px] border-none p-0 overflow-hidden bg-card shadow-4xl text-left max-h-[85dvh] md:max-h-[85vh] flex flex-col" onCloseAutoFocus={(e) => e.preventDefault()} onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="bg-primary px-6 py-5 md:px-8 md:py-6 text-white relative shrink-0">
          <div className="space-y-1">
            <DialogTitle className="text-base md:text-lg font-headline uppercase font-bold tracking-widest">
              {editingItem ? 'Ubah Katalog' : 'Katalog Baru'}
            </DialogTitle>
            <DialogDescription className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/40">
              Pengaturan struktur kategori operasional untuk sistem layanan.
            </DialogDescription>
          </div>
        </DialogHeader>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 md:px-8 md:py-6 space-y-5">
          {errorList.length > 0 && <ErrorBanner errors={errorList} className="rounded-2xl" />}

          {/* PARENT CATEGORY (sub_categories only) */}
          {isSubTab && (
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">Kategori Induk</Label>
              <Select
                value={formData.category_id}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, category_id: val }))}
              >
                <SelectTrigger
                  className={cn(
                    'h-12 rounded-2xl bg-primary/5 border-none px-4 text-sm font-black uppercase shadow-inner ring-0 focus:ring-0',
                    fieldErrors.category_id && INVALID_RING
                  )}
                >
                  <SelectValue placeholder="Pilih Induk..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-5xl bg-card p-2 z-[320]">
                  {categories.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id.toString()}
                      className="text-[16px] md:text-[10px] font-bold uppercase py-3 rounded-xl hover:bg-primary/5"
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldHint message={fieldErrors.category_id} />
            </div>
          )}

          {/* NAME */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">Nama Katalog</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className={cn(
                'h-12 rounded-2xl bg-primary/5 border-none px-4 shadow-inner text-sm font-bold text-foreground',
                fieldErrors.name && INVALID_RING
              )}
            />
            <FieldHint message={fieldErrors.name} />
          </div>

          {/* PRICE (sub_categories only) */}
          {isSubTab && (
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-primary/30 ml-1">Estimasi Mulai (IDR)</Label>
              <Input
                type="number"
                min={0}
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className={cn(
                  'h-12 rounded-2xl bg-primary/5 border-none px-4 shadow-inner text-sm font-black text-primary',
                  fieldErrors.price && INVALID_RING
                )}
              />
              <FieldHint message={fieldErrors.price} />
            </div>
          )}

          {/* ACTIVE TOGGLE */}
          <div className="flex items-center gap-3 pt-1">
            <Checkbox
              id="svc_is_active"
              checked={formData.is_active}
              onCheckedChange={(v) => setFormData((prev) => ({ ...prev, is_active: !!v }))}
            />
            <label htmlFor="svc_is_active" className="text-[10px] font-black uppercase text-primary/30 cursor-pointer">
              Aktif &amp; tampil di halaman publik
            </label>
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
            disabled={isSubmitting}
            onClick={onSave}
            className="bg-primary hover:opacity-90 text-white rounded-[1.5rem] h-12 px-6 md:px-8 text-[10px] font-black uppercase shadow-2xl border-none transition-all flex-[1.5] active:scale-95"
          >
            {isSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'SIMPAN'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
