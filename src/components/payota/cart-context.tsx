"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";
import type { CartItem } from "@/lib/cart";
import { parsePrice } from "@/lib/cart";

const STORAGE_KEY = "payota_cart_v1";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (p: Product, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const sanitize = useCallback((value: unknown): CartItem[] => {
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is CartItem =>
        !!item &&
        typeof item === "object" &&
        typeof (item as CartItem).id === "string" &&
        typeof (item as CartItem).name === "string" &&
        typeof (item as CartItem).priceNumber === "number",
    );
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setItems(sanitize(JSON.parse(raw)));
    } catch {
      /* abaikan penyimpanan rusak */
    }
  }, [sanitize]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === null) {
        setItems([]);
        return;
      }
      try {
        setItems(sanitize(JSON.parse(event.newValue)));
      } catch {
        /* abaikan nilai rusak dari tab lain */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [sanitize]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* mode penyimpanan tidak tersedia */
    }
  }, [items]);

  const add = useCallback((p: Product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) {
        return prev.map((i) =>
          i.id === p.id ? { ...i, qty: Math.min(99, i.qty + qty) } : i
        );
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          priceNumber: parsePrice(p.price),
          art: p.art,
          tagline: p.tagline,
          qty: Math.min(99, qty),
        },
      ];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.min(99, Math.max(1, qty)) } : i))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.priceNumber * i.qty, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, open, openCart, closeCart, add, setQty, remove, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}