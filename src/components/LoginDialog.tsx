'use client';

import React, { useState } from 'react';
import { Loader2, Star, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * LoginDialog - Staff login portal, dynamically loaded.
 * Kartu terpusat (centered) di mobile maupun desktop.
 * Fokus awal dimatikan agar keyboard tidak muncul otomatis saat dibuka.
 */
export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    try {
      const { data, error: queryError } = await supabase.rpc('login_user', { p_username: username.trim(), p_password: password });
      if (queryError || !data || data.length === 0) {
        toast({ variant: "destructive", title: "Otorisasi Gagal", description: "Kredensial tidak valid." });
        setLoading(false);
        return;
      }
      const userData = data[0];
      localStorage.setItem('fee_admin_auth', 'true');
      localStorage.setItem('fee_user_role', userData.role);
      localStorage.setItem('fee_user_name', userData.full_name);
      localStorage.setItem('fee_user_id', String(userData.id));
      localStorage.setItem('fee_user_username', userData.username);
      if (userData.session_token) {
        localStorage.setItem('fee_session_token', userData.session_token);
      }
      onOpenChange(false);
      toast({ title: "Akses Berhasil", description: `Halo, ${userData.full_name}.` });
      router.push('/admin');
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Error", description: "Gangguan sistem pusat." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        mobilePosition="center"
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[calc(100%-2rem)] sm:w-full md:!w-[420px] md:!max-w-[420px] md:!rounded-[2rem] border-none p-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-card shadow-5xl flex flex-col max-h-[92dvh] md:max-h-[90vh] md:h-fit focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
        <div className="bg-primary pt-8 pb-6 px-6 sm:px-8 text-center text-white relative shrink-0">
          <DialogTitle className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-none">STAFF PORTAL</DialogTitle>
          <DialogDescription className="text-white/50 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-2 font-bold italic">Otorisasi Tim Vape Store</DialogDescription>
        </div>
        <form onSubmit={handleLogin} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-5 bg-card">
           <div className="space-y-2 text-left">
              <label className="text-xs font-bold uppercase text-primary/40 ml-1 tracking-widest">ID Pengguna</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan ID pengguna" className="h-12 rounded-2xl bg-primary/5 border-none px-5 text-sm font-bold text-primary shadow-inner" required />
           </div>
           <div className="space-y-2 text-left">
              <label className="text-xs font-bold uppercase text-primary/40 ml-1 tracking-widest">Kode Rahasia</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kode rahasia"
                  className="h-12 rounded-2xl bg-primary/5 border-none pl-5 pr-12 text-sm font-bold text-primary shadow-inner"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan kode rahasia" : "Tampilkan kode rahasia"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-xl text-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
           </div>
           <Button disabled={loading} type="submit" className="w-full h-14 bg-primary hover:opacity-90 text-white font-black rounded-2xl transition-all shadow-xl text-sm uppercase tracking-widest mt-4 border-none active:scale-95 group">
             {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
               <span className="flex items-center gap-3 justify-center">MASUK SISTEM <Star size={16} className="group-hover:rotate-180 transition-transform duration-700" /></span>
             )}
           </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};