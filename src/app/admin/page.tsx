import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { formatMT, hasSingleVariant, products } from "@/lib/catalog";
import { getDB, getStockMap } from "@/lib/db";
import { StockTable, type StockItem } from "@/components/admin/StockTable";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Estoque", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const stock = await getStockMap();
  const items: StockItem[] = products.flatMap((p) =>
    p.variants.map((v) => {
      const s = stock.get(v.sku);
      return {
        sku: v.sku,
        product: `${p.name}${p.size ? ` ${p.size}` : ""}`,
        variant: hasSingleVariant(p) ? "" : v.name,
        category: p.category,
        price: p.price_mzn,
        qty: s?.qty ?? 0,
        min: s?.min_qty ?? 2,
        tracked: Boolean(s),
      };
    }),
  );

  const units = items.reduce((n, i) => n + i.qty, 0);
  const value = items.reduce((n, i) => n + i.qty * (i.price ?? 0), 0);
  const low = items.filter((i) => i.tracked && i.qty <= i.min).length;

  const db = await getDB();
  const sales = await db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN date(created_at) = date('now') THEN qty * COALESCE(unit_price, 0) END), 0) AS today,
         COALESCE(SUM(CASE WHEN strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') THEN qty * COALESCE(unit_price, 0) END), 0) AS month
       FROM movements WHERE kind = 'venda'`,
    )
    .first<{ today: number; month: number }>();

  return (
    <>
      <div className="admin-head">
        <h1>Gestão de estoque</h1>
        <div className="row-btns">
          <Link href="/admin/historico" className="btn">
            Histórico
          </Link>
          <form action={logout}>
            <button className="btn">Sair</button>
          </form>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><span>Unidades em stock</span><strong>{units}</strong></div>
        <div className="stat"><span>Valor do stock</span><strong>{formatMT(value)}</strong></div>
        <div className={low > 0 ? "stat warn" : "stat"}><span>Com stock baixo</span><strong>{low}</strong></div>
        <div className="stat"><span>Vendas hoje</span><strong>{formatMT(sales?.today ?? 0)}</strong></div>
        <div className="stat"><span>Vendas este mês</span><strong>{formatMT(sales?.month ?? 0)}</strong></div>
      </div>

      <StockTable items={items} />
    </>
  );
}
