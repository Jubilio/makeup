import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { findVariant, formatMT, hasSingleVariant } from "@/lib/catalog";
import { getDB, type MovementRow } from "@/lib/db";
import { LOCAL } from "@/lib/sales";
import { CancelSale } from "@/components/admin/CancelSale";

export const metadata: Metadata = { title: "Histórico", robots: { index: false } };
export const dynamic = "force-dynamic";

const LABEL = { entrada: "Entrada", venda: "Venda", acerto: "Contagem" } as const;
const FILTERS = [
  ["", "Tudo"],
  ["venda", "Vendas"],
  ["entrada", "Entradas"],
  ["acerto", "Contagens"],
] as const;

export default async function HistoricoPage({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { tipo = "" } = await searchParams;
  const kind = FILTERS.some(([k]) => k === tipo) ? tipo : "";

  const db = await getDB();
  const where = kind ? "WHERE kind = ?" : "";
  const stmt = db.prepare(
    `SELECT *, datetime(created_at, ${LOCAL}) AS local_at FROM movements ${where} ORDER BY created_at DESC, id DESC LIMIT 300`,
  );
  const { results } = await (kind ? stmt.bind(kind) : stmt).all<MovementRow & { local_at: string }>();

  return (
    <>
      <div className="admin-head">
        <h1>Histórico</h1>
        <Link href="/admin" className="btn">Voltar ao estoque</Link>
      </div>
      <nav className="chips" aria-label="Filtrar por tipo">
        {FILTERS.map(([k, label]) => (
          <Link
            key={k}
            href={k ? `/admin/historico?tipo=${k}` : "/admin/historico"}
            className={`chip${kind === k ? " on" : ""}`}
            aria-current={kind === k ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <p className="hint">
        Horas de Maputo. Uma venda anulada fica aqui riscada, mas não conta nos totais e as unidades voltaram ao stock.
      </p>
      {results.length === 0 ? (
        <p className="empty">Ainda não há movimentos registados.</p>
      ) : (
        <div className="table-wrap">
          <table className="hist">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Produto</th>
                <th>Qtd.</th>
                <th>Valor</th>
                <th>Nota</th>
                <th><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {results.map((m) => {
                const f = findVariant(m.sku);
                const name = f
                  ? `${f.product.name}${hasSingleVariant(f.product) ? "" : ` (${f.variant.name})`}`
                  : m.sku;
                const sign = m.kind === "venda" ? "−" : m.qty > 0 ? "+" : "";
                const cancelled = m.kind === "venda" && m.cancelled_at != null;
                return (
                  <tr key={m.id} className={cancelled ? "cancelled" : undefined}>
                    <td>{m.local_at.slice(0, 16)}</td>
                    <td>
                      <span className={`tag tag-${cancelled ? "anulada" : m.kind}`}>
                        {cancelled ? "Venda anulada" : LABEL[m.kind]}
                      </span>
                    </td>
                    <td>{name}</td>
                    <td>{sign}{Math.abs(m.qty)}</td>
                    <td className="num">
                      {m.kind === "venda" && m.unit_price != null ? formatMT(m.unit_price * m.qty) : ""}
                    </td>
                    <td>{m.note}</td>
                    <td>{m.kind === "venda" && !cancelled && <CancelSale id={m.id} label={`${m.qty} × ${name}`} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
