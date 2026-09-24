"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/data/products";
import { useCatalog } from "./catalog-context";
import { CategoryFilter, SortControl, type FilterValue, type SortValue } from "./CategoryFilter";
import { ProductGrid, EmptyState } from "./ProductGrid";
import { ProductModal } from "./ProductModal";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

export function CatalogSection({
  id,
  products = [],
  categories = [],
  kicker = "Jelajahi Koleksi",
  title = "Koleksi",
  subtitle,
  dense = false,
}: {
  id?: string;
  products?: Product[];
  categories?: string[];
  kicker?: string;
  title?: string;
  subtitle?: string;
  dense?: boolean;
}) {
  const { query, setQuery } = useCatalog();
  const [category, setCategory] = useState<FilterValue>("All");
  const [sort, setSort] = useState<SortValue>("featured");
  const [selected, setSelected] = useState<Product | null>(null);

  const q = query.trim().toLowerCase();

  const list = useMemo(() => {
    let result = products.filter((p) => {
      const inCategory = category === "All" || p.category === category;
      if (!inCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });

    if (sort === "az") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "za") result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    else result = [...result].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || a.index - b.index);

    return result;
  }, [q, category, sort, products]);

  const reset = () => {
    setQuery("");
    setCategory("All");
    setSort("featured");
  };

  return (
    <section
      id={id}
      className={`container-px scroll-mt-24 ${
        dense ? "py-12 lg:py-16" : "py-24 lg:py-32"
      }`}
      aria-label={title}
    >
      <SectionHeader
        kicker={kicker}
        title={title}
        right={<SortControl value={sort} onChange={setSort} />}
        dense={dense}
      />
      {subtitle && (
        <p
          className={`max-w-lg text-sm leading-relaxed text-muted-foreground ${
            dense ? "-mt-5 mb-7 lg:mb-8" : "-mt-8 mb-10"
          }`}
        >
          {subtitle}
        </p>
      )}

      <Reveal className="mb-10 flex flex-col gap-6">
        <CategoryFilter categories={categories} value={category} onChange={setCategory} />
        {q.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {list.length === 0
              ? "Tidak ada yang cocok."
              : `${list.length} ${list.length === 1 ? "produk" : "produk"} untuk “${query.trim()}”.`}
          </p>
        )}
      </Reveal>

      <Reveal>
        {list.length > 0 ? (
          <ProductGrid products={list} onOpen={setSelected} />
        ) : (
          <EmptyState searching={q.length > 0} onReset={reset} />
        )}
      </Reveal>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}