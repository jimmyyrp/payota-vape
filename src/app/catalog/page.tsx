import type { Metadata } from "next";
import { CatalogSection } from "@/components/payota/CatalogSection";
import { getCatalog, getCategories } from "@/lib/payota-db";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, OG_IMAGE, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Katalog — Koleksi Lengkap",
  description:
    "Jelajahi seluruh koleksi PAYOTA — perangkat, aksesori, esensial, dan edisi terbatas. Lengkap dengan filter, pencarian, dan keranjang belanja tanpa akun. Solok, Sumatera Barat.",
  keywords: ["katalog payota", "koleksi payota", "perangkat premium", "aksesori vape", ...SITE_KEYWORDS],
  alternates: {
    canonical: "/catalog",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: `${SITE_URL}/catalog`,
    siteName: SITE_NAME,
    title: `Katalog — Koleksi Lengkap | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: `${SITE_NAME} — ${SITE_DESCRIPTION}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Katalog — Koleksi Lengkap | ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([getCatalog(), getCategories()]);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Katalog PAYOTA",
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${SITE_URL}/product/${p.id}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Katalog", item: `${SITE_URL}/catalog` },
    ],
  };

  return (
    <>
      <CatalogSection
        dense
        products={products}
        categories={categories.map((c) => c.name)}
        kicker="Katalog"
        title="Koleksi lengkap"
        subtitle="Semua produk dalam satu tempat. Gunakan filter untuk mempersempit pilihan, atau cari berdasarkan nama, kategori, dan deskripsi."
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </>
  );
}