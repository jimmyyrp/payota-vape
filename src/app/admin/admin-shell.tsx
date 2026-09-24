"use client";

/**
 * Shell admin: menutup seluruh chrome publik (navbar/footer/age gate)
 * dengan overlay full-screen sendiri. Branding, navigasi & logout
 * ditangani di dalam halaman masing-masing (AdminDashboard).
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0B0B0D] text-foreground">
      {children}
    </div>
  );
}