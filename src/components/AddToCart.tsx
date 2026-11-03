"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasSingleVariant, isComingSoon, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const single = hasSingleVariant(product);
  const [sku, setSku] = useState(single ? product.variants[0].sku : "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [low, setLow] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/stock?produto=${encodeURIComponent(product.id)}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => {
        const { _low, ...rest } = d as Record<string, number> & { _low?: string[] };
        setStock(rest);
        setLow(Array.isArray(_low) ? _low : []);
      })
      .catch(() => {});
  }, [product.id]);

  const soldOut = (s: string) => stock[s] === 0;

  if (isComingSoon(product)) {
    return <p className="notice">Este produto chega brevemente.</p>;
  }

  return (
    <div className="buy">
      {!single && (
        <label className="field">
          <span>Escolha a opção ({product.variants.length})</span>
          <select value={sku} onChange={(e) => { setSku(e.target.value); setAdded(false); }}>
            <option value="">Selecione…</option>
            {product.variants.map((v) => (
              <option key={v.sku} value={v.sku} disabled={soldOut(v.sku)}>
                {v.name}
                {soldOut(v.sku) ? " (esgotado)" : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="field qty">
        <span>Quantidade</span>
        <input
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
        />
      </label>
      <button
        className="btn primary"
        disabled={!sku || soldOut(sku)}
        onClick={() => {
          add(sku, qty);
          setAdded(true);
        }}
      >
        {sku && soldOut(sku) ? "Esgotado" : "Adicionar ao carrinho"}
      </button>
      {sku && low.includes(sku) && !added && (
        <p className="notice low">Poucas unidades disponíveis.</p>
      )}
      {added && (
        <p className="notice ok" role="status">
          Adicionado. <Link href="/carrinho">Ver carrinho</Link>
        </p>
      )}
    </div>
  );
}
