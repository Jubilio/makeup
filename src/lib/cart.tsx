"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { findVariant } from "./catalog";

export type CartLine = { sku: string; qty: number };

type CartCtx = {
  lines: CartLine[];
  count: number;
  total: number;
  hasUnpriced: boolean;
  add: (sku: string, qty?: number) => void;
  setQty: (sku: string, qty: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "inuka-carrinho-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        setLines(parsed.filter((l) => findVariant(l.sku) && l.qty > 0));
      }
    } catch {
      /* armazenamento indisponível: carrinho começa vazio */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignorar */
    }
  }, [lines, loaded]);

  const value = useMemo<CartCtx>(() => {
    let total = 0;
    let count = 0;
    let hasUnpriced = false;
    for (const l of lines) {
      const found = findVariant(l.sku);
      if (!found) continue;
      count += l.qty;
      if (found.product.price_mzn == null) hasUnpriced = true;
      else total += found.product.price_mzn * l.qty;
    }
    return {
      lines,
      count,
      total,
      hasUnpriced,
      add: (sku, qty = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => l.sku === sku);
          if (existing) return prev.map((l) => (l.sku === sku ? { ...l, qty: l.qty + qty } : l));
          return [...prev, { sku, qty }];
        }),
      setQty: (sku, qty) =>
        setLines((prev) =>
          qty <= 0 ? prev.filter((l) => l.sku !== sku) : prev.map((l) => (l.sku === sku ? { ...l, qty } : l)),
        ),
      remove: (sku) => setLines((prev) => prev.filter((l) => l.sku !== sku)),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart fora do CartProvider");
  return ctx;
}
