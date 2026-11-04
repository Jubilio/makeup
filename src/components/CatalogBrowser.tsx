"use client";

import { useMemo, useState } from "react";
import { categories, products } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { CategoryIcon } from "./CategoryIcon";

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function CatalogBrowser({ initialCategory = "" }: { initialCategory?: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(initialCategory);
  const [sort, setSort] = useState("cat");

  const list = useMemo(() => {
    const nq = norm(q.trim());
    let out = products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!nq) return true;
      const hay = norm([p.name, p.line, p.category, p.size, ...p.variants.map((v) => v.name)].join(" "));
      return nq.split(/\s+/).every((w) => hay.includes(w));
    });
    if (sort === "asc") out = [...out].sort((a, b) => (a.price_mzn ?? 1e9) - (b.price_mzn ?? 1e9));
    if (sort === "desc") out = [...out].sort((a, b) => (b.price_mzn ?? -1) - (a.price_mzn ?? -1));
    if (sort === "name") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [q, cat, sort]);

  return (
    <div>
      <div className="filters">
        <input
          type="search"
          placeholder="Procurar produto, fragrância ou cor…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Procurar"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
          <option value="cat">Ordem do catálogo</option>
          <option value="asc">Preço: mais baixo</option>
          <option value="desc">Preço: mais alto</option>
          <option value="name">Nome A–Z</option>
        </select>
      </div>
      <div className="chips" role="group" aria-label="Categorias">
        <button className={cat === "" ? "chip on" : "chip"} onClick={() => setCat("")}>
          Todos
        </button>
        {categories.map((c) => (
          <button key={c} className={cat === c ? "chip on" : "chip"} onClick={() => setCat(c)}>
            <CategoryIcon category={c} size={18} />
            {c}
          </button>
        ))}
      </div>
      <p className="result-count">{list.length} produtos</p>
      {list.length === 0 ? (
        <p className="empty">Nenhum produto encontrado. Tente outra palavra.</p>
      ) : (
        <div className="grid">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
