import { requireAdmin } from "@/lib/admin-auth";
import { listAllProducts, listAllCategories } from "@/lib/payota-admin";
import { AdminDashboard } from "./admin-dashboard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await requireAdmin();

  const [products, categories] = await Promise.all([
    listAllProducts(),
    listAllCategories(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight">
          Dashboard Produk
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Masuk sebagai{" "}
          <span className="font-semibold text-foreground capitalize">{session.role}</span>. Kelola
          katalog PAYOTA — perubahan langsung tampil di situs.
        </p>
      </div>

      <AdminDashboard
        initialProducts={products}
        initialCategories={categories}
      />
    </main>
  );
}