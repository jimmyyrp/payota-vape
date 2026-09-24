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
  await requireAdmin();

  const [products, categories] = await Promise.all([
    listAllProducts(),
    listAllCategories(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <h1 className="sr-only">Dashboard Admin PAYOTA</h1>
      <AdminDashboard
        initialProducts={products}
        initialCategories={categories}
      />
    </main>
  );
}