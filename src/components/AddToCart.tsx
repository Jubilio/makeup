"use client";

import Link from "next/link";
import { useState } from "react";
import { hasSingleVariant, isComingSoon, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const single = hasSingleVariant(product);
  const [sku, setSku] = useState(single ? product.variants[0].sku : "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

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
              <option key={v.sku} value={v.sku}>
                {v.name}
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
        disabled={!sku}
        onClick={() => {
          add(sku, qty);
          setAdded(true);
        }}
      >
        Adicionar ao carrinho
      </button>
      {added && (
        <p className="notice ok" role="status">
          Adicionado. <Link href="/carrinho">Ver carrinho</Link>
        </p>
      )}
    </div>
  );
}
