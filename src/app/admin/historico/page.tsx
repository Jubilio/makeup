import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { findVariant, formatMT, hasSingleVariant } from "@/lib/catalog";
import { getDB, type MovementRow } from "@/lib/db";

export const metadata: Metadata = { title: "Histórico", robots: { index: false } };
export const dynamic = "force-dynamic";

const LABEL = { entrada: "Entrada", venda: "Venda", acerto: "Contagem" } as const;

export default async function HistoricoPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM movements ORDER BY id DESC LIMIT 300")
    .all<MovementRow>();

  return (
    <>
      <div className="admin-head">
        <h1>Histórico</h1>
        <Link href="/admin" className="btn">Voltar ao estoque</Link>
      </div>
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
              </tr>
            </thead>
            <tbody>
              {results.map((m) => {
                const f = findVariant(m.sku);
                const name = f
                  ? `${f.product.name}${hasSingleVariant(f.product) ? "" : ` (${f.variant.name})`}`
                  : m.sku;
                const sign = m.kind === "venda" ? "−" : m.qty > 0 ? "+" : "";
                return (
                  <tr key={m.id}>
                    <td>{m.created_at.slice(0, 16).replace("T", " ")}</td>
                    <td><span className={`tag tag-${m.kind}`}>{LABEL[m.kind]}</span></td>
                    <td>{name}</td>
                    <td>{sign}{Math.abs(m.qty)}</td>
                    <td>{m.kind === "venda" && m.unit_price != null ? formatMT(m.unit_price * m.qty) : ""}</td>
                    <td>{m.note}</td>
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
