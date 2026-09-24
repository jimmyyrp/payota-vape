"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LogOut, ExternalLink, LayoutGrid } from "lucide-react";

/**
 * Shell admin: menutup seluruh chrome publik (navbar/footer/age gate)
 * dengan overlay full-screen sendiri.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isLogin = pathname === "/admin/login";

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0B0B0D] text-foreground">
      {!isLogin && (
        <header className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0B0B0D]/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <LayoutGrid className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-headline text-sm font-extrabold tracking-[0.24em]">
                  PAYOTA <span className="text-primary">Admin</span>
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                  Manajemen Konten
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground sm:inline-flex"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Buka Situs
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-red-400/40 hover:text-red-400 disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Logout
              </button>
            </div>
          </div>
        </header>
      )}
      {children}
    </div>
  );
}