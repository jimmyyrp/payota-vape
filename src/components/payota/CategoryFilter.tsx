"use client";

import { categories as defaultCategories, type ProductCategory } from "@/data/products";

export type FilterValue = "All" | ProductCategory;
export type SortValue = "featured" | "az" | "za";

export function CategoryFilter({
  categories = [...defaultCategories],
  value,
  onChange,
}: {
  categories?: string[];
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const options: string[] = ["All", ...(categories.length ? categories : defaultCategories)];

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt as FilterValue)}
            aria-pressed={active}
            className={`shrink-0 rounded-full border px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] transition-all duration-300 active:scale-[0.97] ${
              active
                ? "border-transparent bg-primary text-primary-foreground shadow-[0_8px_30px_-8px_rgba(255,255,255,0.4)]"
                : "border-white/10 bg-transparent text-muted-foreground hover:border-white/30 hover:text-foreground"
            }`}
          >
            {opt === "All" ? "Semua" : opt}
          </button>
        );
      })}
    </div>
  );
}

export function SortControl({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (v: SortValue) => void;
}) {
  const options: { value: SortValue; label: string }[] = [
    { value: "featured", label: "Unggulan" },
    { value: "az", label: "A–Z" },
    { value: "za", label: "Z–A" },
  ];

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-white/10 bg-[#0D0D0D] p-1"
      role="group"
      aria-label="Urutkan produk"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
              active ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}