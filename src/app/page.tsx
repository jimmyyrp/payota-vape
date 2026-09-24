import type { Metadata } from "next";
import { Home } from "@/components/payota/Home";
import { getCatalog, getFeatured, getCategories } from "@/lib/payota-db";
import type { Product } from "@/data/products";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION, SITE_KEYWORDS, OG_IMAGE, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "PAYOTA — koleksi objek lifestyle premium yang dikurasi. Jelajahi perangkat, aksesori, esensial, dan edisi terbatas. Buka setiap hari 11.00–23.00 WIB, Solok, Sumatera Barat.",
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: OG_IMAGE_WIDTH, height: OG_IMAGE_HEIGHT, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default async function Page() {
  const [products, featured, categories] = await Promise.all([
    getCatalog(),
    getFeatured(),
    getCategories(),
  ]);

  const fallback: Product | null = products[0] ?? null;

  return (
    <Home
      products={products}
      featured={featured ?? fallback}
      categories={categories.map((c) => c.name)}
    />
  );
}