"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Boxes,
  Tags,
  X,
  RefreshCw,
  Save,
  CheckCircle2,
  LayoutGrid,
  ExternalLink,
  LogOut,
  Lightbulb,
} from "lucide-react";
import type { ProductSpec } from "@/data/products";
import { ProductImageSetter } from "./product-image-setter";

interface DbProduct {
  id: number;
  slug: string;
  index: number;
  category: string;
  name: string;
  tagline: string;
  description: string;
  specs: ProductSpec[] | string;
  art: string;
  glow: string;
  glow_soft: string;
  badge: string | null;
  featured: boolean;
  price: string;
  is_active: boolean;
  image: string | null;
  created_at: string;
  updated_at: string;
}

interface DbCategory {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  is_active: boolean;
}

interface ProductInput {
  slug: string;
  index: number;
  category: string;
  name: string;
  tagline: string;
  description: string;
  specs: ProductSpec[];
  art: string;
  glow: string;
  glowSoft: string;
  badge: string;
  featured: boolean;
  price: string;
  isActive: boolean;
  image: string;
}

type Toast = { kind: "ok" | "err"; text: string } | null;

interface ConfirmAction {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

const ART_OPTIONS = [
  "device", "slim", "pod", "air", "orb", "dock", "shield", "strap", "carry", "studio", "one",
];

const BADGE_OPTIONS = ["", "Unggulan", "Baru", "Terbatas"];

const EMPTY_FORM: ProductInput = {
  slug: "",
  index: 0,
  category: "Perangkat",
  name: "",
  tagline: "",
  description: "",
  specs: [],
  art: "device",
  glow: "#E4E4E7",
  glowSoft: "rgba(228,228,231,0.14)",
  badge: "",
  featured: false,
  price: "",
  isActive: true,
  image: "",
};

function parseSpecs(raw: ProductSpec[] | string): ProductSpec[] {
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowToInput(row: DbProduct): ProductInput {
  return {
    slug: row.slug,
    index: row.index,
    category: row.category,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    specs: parseSpecs(row.specs),
    art: row.art,
    glow: row.glow,
    glowSoft: row.glow_soft,
    badge: row.badge ?? "",
    featured: row.featured,
    price: row.price,
    isActive: row.is_active,
    image: row.image ?? "",
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/payota\s*/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Glow lembut (rgba) diturunkan otomatis dari hex glow — tanpa input manual. */
function softGlowFromHex(hex: string): string {
  const match = /^#?([a-f\d]{6})$/i.exec((hex ?? "").trim());
  if (!match) return "rgba(228,228,231,0.14)";
  const num = parseInt(match[1], 16);
  return `rgba(${(num >> 16) & 255},${(num >> 8) & 255},${num & 255},0.14)`;
}

const inputClass =
  "h-10 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 text-base text-foreground outline-none transition-colors focus:border-primary";
const textareaClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-primary";
const labelClass =
  "text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground";
const checkboxClass = "peer flex items-center justify-center";

export function AdminDashboard({
  initialProducts,
  initialCategories,
}: {
  initialProducts: DbProduct[];
  initialCategories: DbCategory[];
}) {
  const [products, setProducts] = useState<DbProduct[]>(initialProducts);
  const [categories, setCategories] = useState<DbCategory[]>(initialCategories);
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [toast, setToast] = useState<Toast>(null);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: 0,
    slug: "",
    name: "",
    tagline: "",
    isActive: true,
  });
  const [savingCategory, setSavingCategory] = useState(false);
  const [pendingCategoryName, setPendingCategoryName] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const router = useRouter();

  const performLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* token tetap dibersihkan di cookie */
    }
    router.replace("/admin/login");
  };

  const requestLogout = () => {
    setConfirm({
      title: "Keluar dari dashboard?",
      description:
        "Sesi admin di perangkat ini akan diakhiri. Anda perlu login lagi untuk membuka dashboard.",
      confirmLabel: "Logout",
      danger: true,
      onConfirm: performLogout,
    });
  };

  const showToast = useCallback((kind: "ok" | "err", text: string) => {
    setToast({ kind, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, index: products.length + 1 });
    setFormOpen(true);
  };

  const openEdit = (row: DbProduct) => {
    setEditingId(row.id);
    setForm(rowToInput(row));
    setFormOpen(true);
  };

  const saveProduct = async () => {
    setSaving(true);
    try {
      const body = {
        ...form,
        slug: form.slug === slugify(form.name) ? "" : form.slug,
        glowSoft: softGlowFromHex(form.glow),
      };
      const res = await fetch(editingId ? `/api/admin/products/${editingId}` : "/api/admin/products", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal menyimpan.");
      const updated = [...products.filter((p) => p.id !== data.product.id), data.product]
        .sort((a, b) => a.index - b.index || a.id - b.id);
      setProducts(updated);
      setFormOpen(false);
      showToast("ok", editingId ? "Produk diperbarui." : "Produk dibuat.");
    } catch (error) {
      showToast("err", (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: DbProduct) => {
    const next = rowToInput(row);
    next.isActive = !row.is_active;
    try {
      const res = await fetch(`/api/admin/products/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal.");
      setProducts((prev) =>
        prev.map((p) => (p.id === row.id ? data.product : p)),
      );
      showToast("ok", next.isActive ? "Produk diaktifkan." : "Produk dinonaktifkan.");
    } catch (error) {
      showToast("err", (error as Error).message);
    }
  };

  const toggleFeatured = async (row: DbProduct) => {
    const next = rowToInput(row);
    next.featured = !row.featured;
    try {
      const res = await fetch(`/api/admin/products/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal.");
      setProducts((prev) =>
        prev.map((p) => (p.id === row.id ? data.product : p)),
      );
      showToast("ok", next.featured ? "Ditandai sebagai unggulan." : "Unggulan dihapus.");
    } catch (error) {
      showToast("err", (error as Error).message);
    }
  };

  const requestToggleActive = (row: DbProduct) => {
    if (row.is_active) {
      setConfirm({
        title: "Nonaktifkan produk?",
        description: `"${row.name}" tidak akan tampil di situs publik (katalog, beranda, dan pencarian) sampai diaktifkan kembali.`,
        confirmLabel: "Nonaktifkan",
        onConfirm: () => toggleActive(row),
      });
    } else {
      toggleActive(row);
    }
  };

  const requestDeleteProduct = (row: DbProduct) => {
    setConfirm({
      title: "Hapus produk?",
      description: `"${row.name}" akan dihapus permanen dari katalog. Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: "Hapus Produk",
      danger: true,
      onConfirm: () => removeProduct(row.id),
    });
  };

  const requestDeleteCategory = (row: DbCategory) => {
    setConfirm({
      title: "Hapus kategori?",
      description: `"${row.name}" akan dihapus permanen dan tidak lagi dipakai sebagai filter di situs.`,
      confirmLabel: "Hapus Kategori",
      danger: true,
      onConfirm: () => removeCategory(row.id),
    });
  };

  const removeProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal menghapus.");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("ok", "Produk dihapus.");
    } catch (error) {
      showToast("err", (error as Error).message);
    }
  };

  const openCategoryCreate = () => {
    setCategoryForm({ id: 0, slug: "", name: "", tagline: "", isActive: true });
    setCategoryOpen(true);
  };

  const openCategoryEdit = (row: DbCategory) => {
    setCategoryForm({
      id: row.id,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      isActive: row.is_active,
    });
    setCategoryOpen(true);
  };

  const saveCategory = async () => {
    setSavingCategory(true);
    try {
      const res = await fetch(
        categoryForm.id ? `/api/admin/categories/${categoryForm.id}` : "/api/admin/categories",
        {
          method: categoryForm.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...categoryForm,
            slug: categoryForm.slug === slugify(categoryForm.name) ? "" : categoryForm.slug,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal menyimpan.");
      const updated = [
        ...categories.filter((c) => c.id !== data.category.id),
        data.category,
      ].sort((a, b) => a.id - b.id);
      setCategories(updated);
      setCategoryOpen(false);
      if (pendingCategoryName !== null && categoryForm.id === 0) {
        setForm((f) => ({ ...f, category: data.category.name }));
        setPendingCategoryName(null);
      }
      showToast("ok", categoryForm.id ? "Kategori diperbarui." : "Kategori dibuat.");
    } catch (error) {
      showToast("err", (error as Error).message);
    } finally {
      setSavingCategory(false);
    }
  };

  const removeCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal menghapus.");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast("ok", "Kategori dihapus.");
    } catch (error) {
      showToast("err", (error as Error).message);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.includes(q),
    );
  }, [products, search]);

  const activeCount = products.filter((p) => p.is_active).length;
  const featuredCount = products.filter((p) => p.featured && p.is_active).length;
  const inactiveCount = products.length - activeCount;
  const activePercent = products.length
    ? Math.round((activeCount / products.length) * 100)
    : 0;
  const featuredPercent = activeCount
    ? Math.round((featuredCount / activeCount) * 100)
    : 0;

  const inactiveProducts = useMemo(
    () => products.filter((p) => !p.is_active),
    [products],
  );
  const noPriceProducts = useMemo(
    () => products.filter((p) => p.is_active && !p.price.trim()),
    [products],
  );
  const noBadgeProducts = useMemo(
    () => products.filter((p) => p.is_active && !(p.badge ?? "").trim()),
    [products],
  );
  const emptyCategories = useMemo(
    () =>
      categories.filter(
        (c) => !products.some((p) => p.is_active && p.category === c.name),
      ),
    [products, categories],
  );

  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; active: number }>();
    for (const p of products) {
      const key = p.category.trim() || "Tanpa kategori";
      const cur = map.get(key) ?? { total: 0, active: 0 };
      cur.total += 1;
      if (p.is_active) cur.active += 1;
      map.set(key, cur);
    }
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total);
  }, [products]);

  const maxCategoryCount = categoryStats.length
    ? Math.max(...categoryStats.map((c) => c.total))
    : 1;

  interface Insight {
    tone: "ok" | "warn";
    title: string;
    detail: string;
    action?: string;
    onAction?: () => void;
  }

  const insights: Insight[] = [];

  if (inactiveProducts.length > 0) {
    const names = inactiveProducts
      .slice(0, 3)
      .map((p) => p.name)
      .join(", ");
    insights.push({
      tone: "warn",
      title: `${inactiveCount} produk nonaktif`,
      detail: `${inactiveProducts.length} produk tidak tampil di katalog, beranda, dan pencarian.`,
      action: "Lihat produk",
      onAction: () => setTab("products"),
    });
    insights.push({
      tone: "warn",
      title: "Daftar nonaktif",
      detail:
        names + (inactiveProducts.length > 3 ? `, dan ${inactiveProducts.length - 3} lainnya.` : "."),
    });
  }

  if (noPriceProducts.length > 0) {
    insights.push({
      tone: "warn",
      title: `${noPriceProducts.length} produk aktif tanpa harga`,
      detail:
        "Pembeli tidak bisa tahu harga di halaman produk. Isi harga agar tidak kehilangan pembeli.",
      action: "Periksa harga",
      onAction: () => setTab("products"),
    });
  }

  if (noBadgeProducts.length > 0 && activeCount >= 3) {
    insights.push({
      tone: "warn",
      title: `${noBadgeProducts.length} produk belum punya badge`,
      detail:
        "Badge (Baru / Unggulan / Terbatas) membantu menonjolkan produk di katalog.",
      action: "Tambah badge",
      onAction: () => setTab("products"),
    });
  }

  if (activeCount > 0 && featuredCount === 0) {
    insights.push({
      tone: "warn",
      title: "Belum ada produk unggulan",
      detail:
        "Beranda menampilkan pilihan unggulan. Tandai minimal satu produk untuk mengisinya.",
      action: "Pilih unggulan",
      onAction: () => setTab("products"),
    });
  } else if (activeCount > 0 && featuredPercent < 20) {
    insights.push({
      tone: "warn",
      title: `Unggulan baru ${featuredPercent}% dari produk aktif`,
      detail:
        `${featuredCount} dari ${activeCount} produk aktif ditandai unggulan. Pertimbangkan menambah unggulan agar beranda lebih kaya.`,
      action: "Kelola unggulan",
      onAction: () => setTab("products"),
    });
  }

  if (emptyCategories.length > 0) {
    insights.push({
      tone: "warn",
      title: `${emptyCategories.length} kategori tanpa produk aktif`,
      detail:
        emptyCategories
          .slice(0, 3)
          .map((c) => c.name)
          .join(", ") + " belum punya produk yang tampil.",
      action: "Isi kategori",
      onAction: () => setTab("products"),
    });
  }

  if (inactiveCount === 0 && noPriceProducts.length === 0) {
    insights.push({
      tone: "ok",
      title: "Katalog sehat",
      detail: `Semua ${products.length} produk aktif dan harga terisi. Tidak ada masalah yang mendesak.`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div
          className={`sticky top-4 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            toast.kind === "ok"
              ? "border-white/15 bg-white/[0.06] text-foreground"
              : "border-red-400/25 bg-red-400/10 text-red-300"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          {toast.text}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Tutup notifikasi"
            className="ml-auto text-current opacity-60 hover:opacity-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Total Produk", value: products.length, icon: Boxes },
          { label: "Aktif", value: activeCount, icon: Eye },
          { label: "Nonaktif", value: inactiveCount, icon: EyeOff },
          { label: "Unggulan", value: featuredCount, icon: Star },
          { label: "Kategori", value: categories.length, icon: Tags },
        ].map((stat) => (
          <div key={stat.label} className="card-surface flex items-center gap-4 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-muted-foreground">
              <stat.icon className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <div>
              <p className="font-headline text-2xl font-extrabold tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Analisis & Saran + Distribusi kategori */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
        {/* Saran */}
        <section className="card-surface p-5" aria-label="Analisis dan saran">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lightbulb className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                Analisis & Saran
              </p>
              <p className="text-xs text-muted-foreground">
                {activePercent}% katalog aktif · {featuredPercent}% aktif diunggulkan
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5">
            {insights.map((item) => (
              <li
                key={item.title}
                className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 ${
                  item.tone === "ok"
                    ? "border-white/[0.07] bg-white/[0.02]"
                    : "border-amber-400/20 bg-amber-400/[0.05]"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
                {item.action && item.onAction && (
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-primary transition-opacity hover:opacity-80"
                  >
                    {item.action}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Distribusi kategori */}
        <section className="card-surface p-5" aria-label="Distribusi kategori">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Distribusi Kategori
          </p>
          <ul className="mt-4 space-y-4">
            {categoryStats.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Belum ada produk untuk dianalisis.
              </li>
            )}
            {categoryStats.map((cat) => (
              <li key={cat.name}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <p className="truncate font-semibold">{cat.name}</p>
                  <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {cat.active}/{cat.total} aktif
                  </p>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.max((cat.total / maxCategoryCount) * 100, 6)}%`,
                      opacity: cat.active === 0 ? 0.35 : 1,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Navigasi: sidebar desktop + segmen mobile */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside
          aria-label="Navigasi admin"
          className="hidden w-56 shrink-0 flex-col rounded-[1.25rem] border border-white/[0.08] bg-[#0D0D0D] p-2 lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-32px)]"
        >
          <div className="flex items-center gap-2.5 px-3 pb-4 pt-1">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <LayoutGrid className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="font-headline text-xs font-extrabold tracking-[0.24em] text-foreground">
                PAYOTA <span className="text-primary">Admin</span>
              </p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Manajemen Konten
              </p>
            </div>
          </div>

          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Navigasi
          </p>
          {(
            [
              { key: "products" as const, label: "Produk", icon: Boxes },
              { key: "categories" as const, label: "Kategori", icon: Tags },
            ]
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-current={tab === item.key ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                tab === item.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </button>
          ))}

          <div className="mt-auto flex flex-col gap-1 px-1 pt-5">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {tab === "products"
                ? `${filteredProducts.length} dari ${products.length} produk`
                : `${categories.length} kategori`}
            </p>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              Buka Situs
            </Link>
            <button
              type="button"
              onClick={requestLogout}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-red-400/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden />
              Logout
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Bar atas mobile */}
          <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <LayoutGrid className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-headline text-xs font-extrabold tracking-[0.24em] text-foreground">
                  PAYOTA <span className="text-primary">Admin</span>
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Manajemen Konten
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                href="/"
                target="_blank"
                aria-label="Buka situs"
                title="Buka situs"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={requestLogout}
                aria-label="Logout"
                title="Logout"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-red-400/40 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Segmen mobile */}
          <div className="card-surface mb-5 flex items-center gap-1 p-1.5 lg:hidden">
            {(
              [
                { key: "products" as const, label: "Produk" },
                { key: "categories" as const, label: "Kategori" },
              ]
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  tab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

      {tab === "products" ? (
        <>
          {/* Mobile: toolbar + kartu */}
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex items-center gap-2">
              <input
                type="search"
                placeholder="Cari produk..."
                aria-label="Cari produk"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inputClass}
              />
              <button type="button" onClick={openCreate} className="btn-primary shrink-0 px-4">
                <Plus className="h-4 w-4" aria-hidden />
                Tambah
              </button>
            </div>

            {filteredProducts.length === 0 && (
              <p className="rounded-[1.25rem] border border-white/[0.08] bg-[#0D0D0D] px-4 py-12 text-center text-sm text-muted-foreground">
                Tidak ada produk yang cocok.
              </p>
            )}

            <ul className="flex flex-col gap-3">
              {filteredProducts.map((p) => (
                <li
                  key={p.id}
                  className={`card-surface p-4 ${!p.is_active ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10"
                      style={{ background: `radial-gradient(circle, ${p.glow}22, transparent)` }}
                      aria-hidden
                    >
                      <span className="text-[10px] font-black text-white/60">
                        {p.name.slice(0, 2).toUpperCase()}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <span
                          className={`chip shrink-0 ${
                            p.is_active
                              ? "border-white/20 bg-white/[0.06] text-foreground"
                              : "border-white/10 bg-white/[0.03] text-muted-foreground"
                          }`}
                        >
                          {p.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {p.category}
                      </p>
                      <p className="mt-1.5 text-sm font-bold tabular-nums">{p.price}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                    <div className="flex items-center gap-1.5">
                      <IconButton onClick={() => requestToggleActive(p)} label={p.is_active ? "Nonaktifkan" : "Aktifkan"}>
                        {p.is_active ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                      </IconButton>
                      <IconButton onClick={() => toggleFeatured(p)} label={p.featured ? "Hapus unggulan" : "Jadikan unggulan"}>
                        {p.featured ? <Star className="h-4 w-4 text-primary" aria-hidden /> : <StarOff className="h-4 w-4" aria-hidden />}
                      </IconButton>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IconButton onClick={() => openEdit(p)} label="Edit">
                        <Pencil className="h-4 w-4" aria-hidden />
                      </IconButton>
                      <IconButton onClick={() => requestDeleteProduct(p)} label="Hapus" danger>
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </IconButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop: tabel */}
          <section className="card-surface hidden overflow-hidden md:block">
            <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                type="search"
                placeholder="Cari produk atau kategori..."
                aria-label="Cari produk"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} sm:max-w-xs`}
              />
              <button type="button" onClick={openCreate} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden />
                Tambah Produk
              </button>
            </div>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.07] text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Unggulan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-sm text-muted-foreground">
                      Tidak ada produk. Awal bertambah melalui tombol &quot;Tambah Produk&quot;.
                    </td>
                  </tr>
                )}
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-white/[0.05] transition-colors hover:bg-white/[0.02] ${
                      !p.is_active ? "opacity-45" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.index}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10"
                          style={{ background: `radial-gradient(circle, ${p.glow}22, transparent)` }}
                          aria-hidden
                        >
                          <span className="text-[9px] font-black text-white/60">
                            {p.name.slice(0, 2).toUpperCase()}
                          </span>
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip border border-white/10 bg-white/[0.03] text-muted-foreground">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{p.price}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`chip ${
                          p.is_active
                            ? "border-white/20 bg-white/[0.06] text-foreground"
                            : "border-white/10 bg-white/[0.03] text-muted-foreground"
                        }`}
                      >
                        {p.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(p)}
                        aria-label={p.featured ? "Hapus unggulan" : "Jadikan unggulan"}
                        className="inline-flex"
                        title={p.featured ? "Hapus unggulan" : "Jadikan unggulan"}
                      >
                        {p.featured ? (
                          <Star className="h-4 w-4 text-primary" aria-hidden />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground/50" aria-hidden />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconButton onClick={() => requestToggleActive(p)} label={p.is_active ? "Nonaktifkan" : "Aktifkan"}>
                          {p.is_active ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                        </IconButton>
                        <IconButton onClick={() => openEdit(p)} label="Edit">
                          <Pencil className="h-4 w-4" aria-hidden />
                        </IconButton>
                        <IconButton onClick={() => requestDeleteProduct(p)} label="Hapus" danger>
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : (
        <>
          {/* Mobile: kartu kategori */}
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Kategori untuk filter situs.</p>
              <button type="button" onClick={openCategoryCreate} className="btn-primary shrink-0 px-4">
                <Plus className="h-4 w-4" aria-hidden />
                Tambah
              </button>
            </div>

            {categories.length === 0 && (
              <p className="rounded-[1.25rem] border border-white/[0.08] bg-[#0D0D0D] px-4 py-12 text-center text-sm text-muted-foreground">
                Belum ada kategori.
              </p>
            )}

            <ul className="flex flex-col gap-3">
              {categories.map((c) => (
                <li key={c.id} className={`card-surface p-4 ${!c.is_active ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                    </div>
                    <span
                      className={`chip shrink-0 ${
                        c.is_active
                          ? "border-white/20 bg-white/[0.06] text-foreground"
                          : "border-white/10 bg-white/[0.03] text-muted-foreground"
                      }`}
                    >
                      {c.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.tagline}</p>
                  <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-white/[0.05] pt-3">
                    <IconButton onClick={() => openCategoryEdit(c)} label="Edit">
                      <Pencil className="h-4 w-4" aria-hidden />
                    </IconButton>
                    <IconButton onClick={() => requestDeleteCategory(c)} label="Hapus" danger>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop: tabel kategori */}
          <section className="card-surface hidden overflow-hidden md:block">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-4">
              <p className="text-sm text-muted-foreground">
                Kategori digunakan untuk filter di situs (halaman katalog & beranda).
              </p>
              <button type="button" onClick={openCategoryCreate} className="btn-primary">
                <Plus className="h-4 w-4" aria-hidden />
                Tambah Kategori
              </button>
            </div>

            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.07] text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Tagline</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Belum ada kategori.
                    </td>
                  </tr>
                )}
                {categories.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b border-white/[0.05] hover:bg-white/[0.02] ${
                      !c.is_active ? "opacity-45" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{c.tagline}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`chip ${
                          c.is_active
                            ? "border-white/20 bg-white/[0.06] text-foreground"
                            : "border-white/10 bg-white/[0.03] text-muted-foreground"
                        }`}
                      >
                        {c.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <IconButton onClick={() => openCategoryEdit(c)} label="Edit">
                          <Pencil className="h-4 w-4" aria-hidden />
                        </IconButton>
                        <IconButton onClick={() => requestDeleteCategory(c)} label="Hapus" danger>
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
        </div>
      </div>

      {/* Dialog konfirmasi nonaktifkan / hapus */}
      <AlertDialog.Root
        open={!!confirm}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-[130] w-[calc(100vw-32px)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0D0D0D] p-7 outline-none">
            <AlertDialog.Title className="text-lg font-bold tracking-tight">
              {confirm?.title}
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {confirm?.description}
            </AlertDialog.Description>
            <div className="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="h-11 rounded-full border border-white/10 bg-white/[0.03] px-6 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Batal
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  type="button"
                  onClick={() => confirm?.onConfirm()}
                  className={
                    confirm?.danger
                      ? "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-6 text-[11px] font-bold uppercase tracking-[0.18em] text-red-300 transition-colors hover:bg-red-400/20"
                      : "btn-primary"
                  }
                >
                  {confirm?.confirmLabel}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Dialog form produk */}
      <Dialog.Root open={formOpen} onOpenChange={setFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[130] max-h-[calc(100vh-48px)] w-[calc(100vw-32px)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0D0D] p-7 outline-none md:p-9">
            <Dialog.Title className="font-headline text-2xl font-extrabold tracking-tight">
              {editingId ? "Edit Produk" : "Tambah Produk"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Semua perubahan di sini langsung tampil di situs publik.
            </Dialog.Description>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nama Produk *">
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.slug === "" || f.slug === slugify(f.name) ? slugify(e.target.value) : f.slug,
                    }))
                  }
                  placeholder="PAYOTA Core"
                />
              </Field>

              <Field label="Slug (URL produk)">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">#</span>
                  <input
                    className={`${inputClass} opacity-90`}
                    value={
                      form.slug || slugify(form.name)
                    }
                    readOnly
                    title="Slug dibuat otomatis dari nama"
                  />
                </div>
              </Field>

              <Field label="Kategori *">
                <div className="flex items-center gap-2">
                  <select
                    className={inputClass}
                    value={
                      categories.some((c) => c.name === form.category)
                        ? form.category
                        : "__custom__"
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__new_category__") {
                        setPendingCategoryName(form.category || "");
                        openCategoryCreate();
                        return;
                      }
                      setForm((f) => ({ ...f, category: v }));
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {form.category &&
                      !categories.some((c) => c.name === form.category) && (
                        <option value="__custom__" disabled>
                          {form.category || "Tanpa kategori"}
                        </option>
                      )}
                    {categories.length > 0 && (
                      <option value="__new_category__">+ Kategori baru...</option>
                    )}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingCategoryName(form.category || "");
                      openCategoryCreate();
                    }}
                    aria-label="Tambah kategori baru"
                    title="Tambah kategori baru"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </Field>

              <Field label="Urutan (index)">
                <input
                  type="number"
                  className={inputClass}
                  value={form.index}
                  onChange={(e) => setForm((f) => ({ ...f, index: Number(e.target.value) || 0 }))}
                />
              </Field>

              <Field label="Harga">
                <input
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="Rp 1.450.000"
                />
              </Field>

              <Field label="Badge">
                <select
                  className={inputClass}
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                >
                  {BADGE_OPTIONS.map((b) => (
                    <option key={b || "none"} value={b}>
                      {b || "Tanpa badge"}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Varian Art (render SVG)">
                <select
                  className={inputClass}
                  value={form.art}
                  onChange={(e) => setForm((f) => ({ ...f, art: e.target.value }))}
                >
                  {ART_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Warna Glow (hex)">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.glow}
                    onChange={(e) => setForm((f) => ({ ...f, glow: e.target.value }))}
                    className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                    aria-label="Pilih warna glow"
                  />
                  <input
                    className={inputClass}
                    value={form.glow}
                    onChange={(e) => setForm((f) => ({ ...f, glow: e.target.value }))}
                  />
                </div>
              </Field>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className={labelClass}>Foto Produk (opsional)</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    1:1
                  </span>
                </div>
                <div className="mt-2">
                  <ProductImageSetter
                    value={form.image}
                    onChange={(dataUrl) =>
                      setForm((f) => ({ ...f, image: dataUrl }))
                    }
                  />
                </div>
              </div>

              <Field label="Tagline">
                <input
                  className={inputClass}
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Deskripsi">
                  <textarea
                    className={`${textareaClass} min-h-[96px]`}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-6 md:col-span-2">
                <ToggleCheck
                  checked={form.featured}
                  onChange={(v) => setForm((f) => ({ ...f, featured: v }))}
                  label="Unggulan"
                />
                <ToggleCheck
                  checked={form.isActive}
                  onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                  label="Aktif"
                />
              </div>

              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className={labelClass}>Spesifikasi</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, specs: [...f.specs, { label: "", value: "" }] }))
                    }
                    className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-white/30 hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden />
                    Tambah Baris
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {form.specs.length === 0 && (
                    <p className="rounded-lg border border-dashed border-white/10 px-4 py-4 text-xs text-muted-foreground">
                      Belum ada spesifikasi.
                    </p>
                  )}
                  {form.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className={inputClass}
                        placeholder="Label (mis. Material)"
                        value={spec.label}
                        onChange={(e) =>
                          setForm((f) => {
                            const specs = [...f.specs];
                            specs[i] = { ...specs[i], label: e.target.value };
                            return { ...f, specs };
                          })
                        }
                      />
                      <input
                        className={inputClass}
                        placeholder="Nilai (mis. Titanium-grade alloy)"
                        value={spec.value}
                        onChange={(e) =>
                          setForm((f) => {
                            const specs = [...f.specs];
                            specs[i] = { ...specs[i], value: e.target.value };
                            return { ...f, specs };
                          })
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, specs: f.specs.filter((_, j) => j !== i) }))
                        }
                        aria-label="Hapus spesifikasi"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-400/10 hover:text-red-400"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="btn-outline"
                disabled={saving}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveProduct}
                disabled={saving || !form.name.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="h-4 w-4" aria-hidden />
                )}
                {editingId ? "Simpan Perubahan" : "Buat Produk"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Dialog form kategori */}
      <Dialog.Root open={categoryOpen} onOpenChange={setCategoryOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[130] w-[calc(100vw-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/10 bg-[#0D0D0D] p-7 outline-none md:p-9">
            <Dialog.Title className="font-headline text-2xl font-extrabold tracking-tight">
              {categoryForm.id ? "Edit Kategori" : "Tambah Kategori"}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Nama kategori dipakai sebagai filter di situs.
            </Dialog.Description>

            <div className="mt-6 flex flex-col gap-4">
              <Field label="Nama *">
                <input
                  className={inputClass}
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug:
                        f.slug === "" || f.slug === slugify(f.name) ? slugify(e.target.value) : f.slug,
                    }))
                  }
                />
              </Field>
              <Field label="Slug (URL)">
                <p className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-muted-foreground">
                  /{categoryForm.slug || slugify(categoryForm.name) || "kategori"}
                </p>
              </Field>
              <Field label="Tagline">
                <input
                  className={inputClass}
                  value={categoryForm.tagline}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, tagline: e.target.value }))}
                />
              </Field>
              <ToggleCheck
                checked={categoryForm.isActive}
                onChange={(v) => setCategoryForm((f) => ({ ...f, isActive: v }))}
                label="Aktif"
              />
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCategoryOpen(false)}
                className="btn-outline"
                disabled={savingCategory}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={saveCategory}
                disabled={savingCategory || !categoryForm.name.trim()}
                className="btn-primary disabled:opacity-50"
              >
                {savingCategory ? (
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="h-4 w-4" aria-hidden />
                )}
                {categoryForm.id ? "Simpan Perubahan" : "Buat Kategori"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function ToggleCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-3"
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-white/[0.08]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${
            checked ? "translate-x-[22px] bg-[#050505]" : "translate-x-0.5 bg-white"
          }`}
        />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </button>
  );
}

function IconButton({
  onClick,
  label,
  danger,
  children,
}: {
  onClick: () => void;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
        danger
          ? "border-white/10 text-muted-foreground hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-400"
          : "border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}