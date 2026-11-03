"use client";

import { useActionState, useMemo, useState } from "react";
import { recordMovement, setMinQty, type ActionState } from "@/app/admin/actions";
import { formatMT } from "@/lib/catalog";

export type StockItem = {
  sku: string;
  product: string;
  variant: string;
  category: string;
  price: number | null;
  qty: number;
  min: number;
  tracked: boolean;
};

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

type Filter = "todos" | "com" | "baixo" | "sem";

export function StockTable({ items }: { items: StockItem[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const nq = norm(q.trim());
    return items.filter((i) => {
      if (filter === "com" && i.qty <= 0) return false;
      if (filter === "baixo" && !(i.tracked && i.qty <= i.min)) return false;
      if (filter === "sem" && i.qty > 0) return false;
      if (!nq) return true;
      const hay = norm(`${i.product} ${i.variant} ${i.category}`);
      return nq.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [items, q, filter]);

  const shown = list.slice(0, 200);

  return (
    <div>
      <div className="filters">
        <input type="search" placeholder="Procurar produto ou variante…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Procurar" />
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="Filtrar">
          <option value="todos">Todos</option>
          <option value="com">Com stock</option>
          <option value="baixo">Stock baixo</option>
          <option value="sem">Sem stock</option>
        </select>
      </div>
      <p className="result-count">
        {list.length} variantes{list.length > shown.length ? ` (a mostrar ${shown.length}; refine a pesquisa)` : ""}
      </p>
      <ul className="stock-list">
        {shown.map((i) => {
          const low = i.tracked && i.qty <= i.min;
          return (
            <li key={i.sku} className={`stock-row${low ? " low" : ""}`}>
              <button className="stock-summary" onClick={() => setOpen(open === i.sku ? null : i.sku)} aria-expanded={open === i.sku}>
                <span className="stock-name">
                  <strong>{i.product}</strong>
                  {i.variant && <span>{i.variant}</span>}
                </span>
                <span className="stock-qty">
                  <strong>{i.qty}</strong>
                  <small>{low ? "baixo" : "un."}</small>
                </span>
              </button>
              {open === i.sku && <RowForms item={i} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RowForms({ item }: { item: StockItem }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(recordMovement, null);
  const [minState, minAction, minPending] = useActionState<ActionState, FormData>(setMinQty, null);
  const [kind, setKind] = useState("entrada");

  return (
    <div className="stock-forms">
      <form action={action} className="move-form">
        <input type="hidden" name="sku" value={item.sku} />
        <div className="seg" role="radiogroup" aria-label="Tipo">
          {[
            ["entrada", "Entrada"],
            ["venda", "Venda"],
            ["acerto", "Contagem"],
          ].map(([k, label]) => (
            <label key={k} className={kind === k ? "on" : ""}>
              <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
              {label}
            </label>
          ))}
        </div>
        <label className="field">
          <span>{kind === "acerto" ? "Quantidade contada" : "Quantidade"}</span>
          <input type="number" name="qty" min={kind === "acerto" ? 0 : 1} max={10000} defaultValue={kind === "acerto" ? item.qty : 1} key={kind} required />
        </label>
        <label className="field">
          <span>Nota (opcional)</span>
          <input name="note" maxLength={200} placeholder={kind === "venda" ? "Cliente, pedido…" : "Fornecedor, motivo…"} />
        </label>
        <button className="btn primary" disabled={pending}>
          {pending ? "A guardar…" : "Guardar"}
        </button>
        {kind === "venda" && item.price != null && <p className="hint">Preço de venda: {formatMT(item.price)} / un.</p>}
        {state && <p className={state.ok ? "notice ok" : "notice err"} role="status">{state.message}</p>}
      </form>
      <form action={minAction} className="min-form">
        <input type="hidden" name="sku" value={item.sku} />
        <label className="field">
          <span>Avisar quando tiver</span>
          <input type="number" name="min_qty" min={0} max={1000} defaultValue={item.min} required />
        </label>
        <button className="btn" disabled={minPending}>Guardar alerta</button>
        {minState && <p className={minState.ok ? "notice ok" : "notice err"}>{minState.message}</p>}
      </form>
    </div>
  );
}
