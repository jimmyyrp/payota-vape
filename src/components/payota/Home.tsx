import type { Product } from "@/data/products";
import { Hero } from "./Hero";
import { CatalogSection } from "./CatalogSection";
import { FeaturedProduct } from "./FeaturedProduct";
import { BrandSection } from "./BrandSection";
import { JournalSection } from "./JournalSection";
import { Newsletter } from "./Newsletter";
import { KontakSection } from "./KontakSection";

export function Home({
  products,
  featured,
  categories,
}: {
  products: Product[];
  featured: Product | null;
  categories: string[];
}) {
  return (
    <>
      <Hero featured={featured} />
      <CatalogSection
        id="collections"
        products={products}
        categories={categories}
        kicker="Jelajahi Koleksi"
        title="Dikurasi untuk keseharian"
        subtitle="Koleksi terkurasi — perangkat, aksesori, esensial, dan edisi terbatas bernomor. Disederhanakan menjadi hal yang benar-benar penting, lalu difinishing dengan baik."
      />
      <FeaturedProduct product={featured} />
      <BrandSection />
      <JournalSection />
      <Newsletter />
      <KontakSection />
    </>
  );
}