
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, ChevronLeft, ChevronRight, LogOut, Users, Settings, Terminal, LayoutDashboard, ImageIcon, Briefcase, MessageSquare, HelpCircle, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToasterProvider } from '@/components/toaster-provider';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string }>({ name: 'Admin', role: 'staff' });
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = localStorage.getItem('fee_admin_auth');
    if (auth !== 'true') {
      router.push('/?login=1');
    } else {
      setUser({
        name: localStorage.getItem('fee_user_name') || 'Administrator',
        role: localStorage.getItem('fee_user_role') || 'staff'
      });
    }
  }, [router]);

  const handleLogout = () => {
    const token = localStorage.getItem('fee_session_token');
    if (token) {
      fetch('/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => { /* fire-and-forget */ });
    }
    localStorage.removeItem('fee_admin_auth'); 
    localStorage.removeItem('fee_user_role');
    localStorage.removeItem('fee_user_name');
    localStorage.removeItem('fee_session_token');
    setIsLogoutConfirmOpen(false);
    router.push('/'); 
  };

  const navigation = useMemo(() => {
    const baseNav = [
      { label: 'Dasbor', href: '/admin', icon: LayoutDashboard },
      { label: 'Manajemen Produk', href: '/admin/karya', icon: ImageIcon },

      { label: 'Katalog Layanan', href: '/admin/services', icon: Briefcase },
      { label: 'Testimoni', href: '/admin/testimonials', icon: MessageSquare },
    ];
    
    const extendedNav = [...baseNav];
    
    if (user.role === 'admin' || user.role === 'developer') {
      extendedNav.push({ label: 'Kelola Tim', href: '/admin/users', icon: Users });
      extendedNav.push({ label: 'Pengaturan', href: '/admin/settings', icon: Settings });
      extendedNav.push({ label: 'Log Aktivitas', href: '/admin/logs', icon: History });
    }

    if (user.role === 'developer') {
      extendedNav.push({ label: 'Developer', href: '/admin/developer', icon: Terminal });
    }

    extendedNav.push({ label: 'Panduan', href: '/admin/panduan', icon: HelpCircle });

    return extendedNav;
  }, [user.role]);

  if (!mounted) return null;

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-card text-primary border-r border-border/60">
      <div className={cn("border-b border-border/60 flex items-center gap-4 shrink-0", isMobile ? "p-5" : "p-8")}>
        <div className="flex flex-col">
          <span className="font-headline font-bold text-[13px] uppercase tracking-[0.4em] text-primary leading-none">Vape Store Portal</span>
          <span className="text-[9px] font-bold text-primary/20 uppercase tracking-[0.3em] mt-2">{user.role}</span>
        </div>
      </div>
      <nav className={cn("flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1.5", isMobile ? "px-3 mt-4" : "px-4 mt-8")}>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const content = (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 rounded-2xl transition-all group w-full",
              isMobile ? "px-4 py-3" : "px-5 py-3.5",
              isActive ? "bg-primary text-white shadow-xl" : "text-primary/40 hover:text-primary hover:bg-primary/5"
            )}>
              <item.icon size={18} className={cn(isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          );

          return isMobile ? (
            <SheetClose key={item.href} asChild>
              {content}
            </SheetClose>
          ) : (
            <div key={item.href}>{content}</div>
          );
        })}
      </nav>
      <div className={cn("mt-auto border-t border-border/60 shrink-0", isMobile ? "p-4" : "p-6")}>
        <Button variant="ghost" onClick={(e) => { (e.currentTarget as HTMLElement).blur(); setIsLogoutConfirmOpen(true); }} 
          className="w-full justify-start text-primary/20 hover:text-destructive hover:bg-destructive/10 rounded-2xl h-12 px-5">
          <LogOut size={18} className="mr-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
        </Button>
      </div>
    </div>
  );

  const isBodyLocked = mobileNavOpen || isLogoutConfirmOpen;

  return (
    <div className="h-screen w-full bg-background flex overflow-hidden font-body selection:bg-primary/10" aria-hidden={isBodyLocked || undefined}>
      <aside className={cn("hidden md:flex flex-col transition-all duration-500", isSidebarOpen ? "w-64" : "w-0 overflow-hidden")}>
        <NavContent />
      </aside>
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-card border-b border-border/60 flex items-center justify-between px-8 shrink-0 z-40">
          <div className="flex items-center gap-4">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" onPointerDown={(e) => (e.currentTarget as HTMLElement).blur()} className="md:hidden text-primary/40 hover:text-primary/40 hover:bg-primary/5 h-10 w-10 rounded-xl border border-border/60"><Menu size={20} /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none w-64 bg-card">
                <div className="sr-only"><SheetTitle>Navigasi</SheetTitle><SheetDescription>Admin Portal</SheetDescription></div>
                <NavContent isMobile />
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex text-primary/20 hover:text-primary/20 hover:bg-primary/5 h-9 w-9 transition-all">
              {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-primary leading-none uppercase tracking-widest">{user.name}</p>
              <p className="text-[8px] text-primary/30 uppercase font-bold tracking-[0.3em] mt-1.5">{user.role}</p>
            </div>
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-primary/5 text-primary font-bold text-[11px] uppercase shadow-inner border border-primary/10">{user.name.charAt(0)}</div>
          </div>
        </header>
        <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8 no-scrollbar bg-background">
          <div className="max-w-7xl mx-auto min-h-[70vh]">{children}</div>
        </main>
      </div>

      <AlertDialog open={isLogoutConfirmOpen} onOpenChange={setIsLogoutConfirmOpen}>
        <AlertDialogContent className="p-8 md:p-10 bg-card shadow-5xl text-center" onCloseAutoFocus={(e) => e.preventDefault()}>
           <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-[1.8rem] flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} />
           </div>
           <AlertDialogTitle className="text-base font-headline text-primary uppercase font-bold">Keluar Sistem?</AlertDialogTitle>
           <AlertDialogDescription className="text-primary/30 text-[10px] font-medium italic uppercase tracking-widest mt-1 mb-8">
             Sesi Anda akan berakhir secara aman. Pastikan seluruh perubahan data telah tersimpan.
           </AlertDialogDescription>
           <div className="flex gap-2">
             <AlertDialogCancel className="rounded-xl h-12 text-[10px] font-black bg-primary/5 text-primary border-none flex-1">BATAL</AlertDialogCancel>
             <AlertDialogAction onClick={handleLogout} className="bg-destructive/100 text-white rounded-xl h-12 flex-1 text-[10px] font-black border-none shadow-lg active:scale-95 transition-all">YA, KELUAR</AlertDialogAction>
           </div>
        </AlertDialogContent>
      </AlertDialog>
      <ToasterProvider />
    </div>
  );
}
