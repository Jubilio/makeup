import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type D1Result<T> = { results: T[] };
type D1Prepared = {
  bind: (...values: unknown[]) => D1Prepared;
  all: <T = Record<string, unknown>>() => Promise<D1Result<T>>;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  run: () => Promise<unknown>;
};
export type D1 = { prepare: (sql: string) => D1Prepared; batch: (stmts: D1Prepared[]) => Promise<unknown> };

export async function getDB(): Promise<D1> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as unknown as { DB?: D1 }).DB;
  if (!db) throw new Error("Base de dados D1 (binding DB) não configurada. Ver docs/NEXT_STEPS.md.");
  return db;
}

export type StockRow = { sku: string; qty: number; min_qty: number; updated_at: string };
export type MovementRow = {
  id: number;
  sku: string;
  kind: "entrada" | "venda" | "acerto";
  qty: number;
  unit_price: number | null;
  note: string | null;
  created_at: string;
  /** Preenchido quando uma venda é anulada (migração 0003). */
  cancelled_at: string | null;
};

export async function getStockMap(): Promise<Map<string, StockRow>> {
  const db = await getDB();
  const { results } = await db.prepare("SELECT sku, qty, min_qty, updated_at FROM stock").all<StockRow>();
  return new Map(results.map((r) => [r.sku, r]));
}
