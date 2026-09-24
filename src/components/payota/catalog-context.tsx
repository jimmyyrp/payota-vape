"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface CatalogContextValue {
  query: string;
  setQuery: (q: string) => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <CatalogContext.Provider
      value={{ query, setQuery, searchOpen, openSearch, closeSearch }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}