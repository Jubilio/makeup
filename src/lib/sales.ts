import "server-only";
import { findVariant, hasSingleVariant } from "@/lib/catalog";
import { getDB } from "@/lib/db";

/** Maputo está em UTC+2 o ano todo; a base de dados guarda as horas em UTC. */
export const LOCAL = "'+2 hours'";

export type SalesPoint = { key: string; label: string; value: number; units: number; count: number };
export type TopProduct = { name: string; units: number; value: number };
export type SalesSummary = {
  today: number;
  week: number;
  month: number;
  monthCount: number;
  days: SalesPoint[];
  months: SalesPoint[];
  top: TopProduct[];
};

const VALID = "kind = 'venda' AND cancelled_at IS NULL";
const WEEKDAY = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTH = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function localNow(): Date {
  return new Date(Date.now() + 2 * 3600 * 1000);
}

export async function getSalesSummary(): Promise<SalesSummary> {
  const db = await getDB();
  const [daily, monthly, top] = await Promise.all([
    db
      .prepare(
        `SELECT date(created_at, ${LOCAL}) AS k, SUM(qty * COALESCE(unit_price, 0)) AS value, SUM(qty) AS units, COUNT(*) AS count
         FROM movements WHERE ${VALID} AND created_at >= datetime('now', '-32 days')
         GROUP BY k`,
      )
      .all<{ k: string; value: number; units: number; count: number }>(),
    db
      .prepare(
        `SELECT strftime('%Y-%m', created_at, ${LOCAL}) AS k, SUM(qty * COALESCE(unit_price, 0)) AS value, SUM(qty) AS units, COUNT(*) AS count
         FROM movements WHERE ${VALID} AND created_at >= datetime('now', '-13 months')
         GROUP BY k`,
      )
      .all<{ k: string; value: number; units: number; count: number }>(),
    db
      .prepare(
        `SELECT sku, SUM(qty) AS units, SUM(qty * COALESCE(unit_price, 0)) AS value
         FROM movements WHERE ${VALID} AND created_at >= datetime('now', '-30 days')
         GROUP BY sku ORDER BY value DESC, units DESC LIMIT 5`,
      )
      .all<{ sku: string; units: number; value: number }>(),
  ]);

  const byDay = new Map(daily.results.map((r) => [r.k, r]));
  const byMonth = new Map(monthly.results.map((r) => [r.k, r]));
  const now = localNow();

  const days: SalesPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    const r = byDay.get(key);
    days.push({
      key,
      label: `${WEEKDAY[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH[d.getUTCMonth()]}`,
      value: r?.value ?? 0,
      units: r?.units ?? 0,
      count: r?.count ?? 0,
    });
  }

  const months: SalesPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    const r = byMonth.get(key);
    months.push({
      key,
      label: `${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
      value: r?.value ?? 0,
      units: r?.units ?? 0,
      count: r?.count ?? 0,
    });
  }

  const thisMonth = months[months.length - 1];
  return {
    today: days[days.length - 1].value,
    week: days.slice(-7).reduce((n, d) => n + d.value, 0),
    month: thisMonth.value,
    monthCount: thisMonth.count,
    days,
    months,
    top: top.results.map((r) => {
      const f = findVariant(r.sku);
      const name = f
        ? `${f.product.name}${f.product.size ? ` ${f.product.size}` : ""}${hasSingleVariant(f.product) ? "" : ` · ${f.variant.name}`}`
        : r.sku;
      return { name, units: r.units, value: r.value };
    }),
  };
}
