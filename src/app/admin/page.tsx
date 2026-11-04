import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { formatMT, hasSingleVariant, products } from "@/lib/catalog";
import { getStockMap } from "@/lib/db";
import { getSalesSummary } from "@/lib/sales";
import { StockTable, type StockItem } from "@/components/admin/StockTable";
import { SalesChart } from "@/components/admin/SalesChart";
import { logout } from "./actions";

export const metadata: Metadata = { title: "Estoque", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [stock, sales] = await Promise.all([getStockMap(), getSalesSummary()]);
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
  const lowItems = items
    .filter((i) => i.tracked && i.qty <= i.min)
    .sort((a, b) => a.qty - b.qty || a.product.localeCompare(b.product));
  const tracked = items.filter((i) => i.tracked).length;

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
        <div className="stat"><span>Vendas hoje</span><strong>{formatMT(sales.today)}</strong></div>
        <div className="stat"><span>Últimos 7 dias</span><strong>{formatMT(sales.week)}</strong></div>
        <div className="stat">
          <span>Este mês</span>
          <strong>{formatMT(sales.month)}</strong>
          <small>{sales.monthCount} {sales.monthCount === 1 ? "venda" : "vendas"}</small>
        </div>
        <div className="stat"><span>Unidades em stock</span><strong>{units}</strong></div>
        <div className="stat"><span>Valor do stock</span><strong>{formatMT(value)}</strong><small>a preço de venda</small></div>
        <div className={lowItems.length > 0 ? "stat warn" : "stat"}>
          <span>Com stock baixo</span>
          <strong>{lowItems.length}</strong>
        </div>
      </div>

      <div className="dash">
        <SalesChart days={sales.days} months={sales.months} />

        <div className="dash-side">
          <section className="panel" aria-labelledby="low-title">
            <h2 id="low-title">Repor em breve</h2>
            {lowItems.length === 0 ? (
              <p className="empty">
                {tracked === 0
                  ? "Ainda não registou stock. Comece pela primeira contagem (veja abaixo)."
                  : "Nenhum produto abaixo do alerta. Tudo bem por agora."}
              </p>
            ) : (
              <ul className="mini-list">
                {lowItems.slice(0, 8).map((i) => (
                  <li key={i.sku}>
                    <span>
                      {i.product}
                      {i.variant && <small>{i.variant}</small>}
                    </span>
                    <strong className={i.qty === 0 ? "qty-zero" : "qty-low"}>{i.qty === 0 ? "esgotado" : `${i.qty} un.`}</strong>
                  </li>
                ))}
                {lowItems.length > 8 && <li className="hint">e mais {lowItems.length - 8}. Filtre a lista por “Stock baixo”.</li>}
              </ul>
            )}
          </section>

          <section className="panel" aria-labelledby="top-title">
            <h2 id="top-title">Mais vendidos (30 dias)</h2>
            {sales.top.length === 0 ? (
              <p className="empty">Aparecem aqui quando registar vendas.</p>
            ) : (
              <ol className="mini-list">
                {sales.top.map((t) => (
                  <li key={t.name}>
                    <span>
                      {t.name}
                      <small>{t.units} un.</small>
                    </span>
                    <strong>{formatMT(t.value)}</strong>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      <details className="panel guide" open={tracked === 0}>
        <summary>Como funciona o stock</summary>
        <div className="guide-body">
          <p>
            Cada produto (e cada cor ou fragrância) tem o seu número de unidades. Toque num produto da lista para
            o abrir e escolha o que aconteceu:
          </p>
          <dl className="guide-list">
            <div>
              <dt>Entrada</dt>
              <dd>
                Chegou mercadoria. Escreva quantas unidades <b>chegaram</b> e elas <b>somam</b> ao que já tinha.
                Ex.: tinha 3, chegaram 10, fica com 13.
              </dd>
            </div>
            <div>
              <dt>Venda</dt>
              <dd>
                Um cliente confirmou e pagou (normalmente pelo WhatsApp). Escreva quantas unidades vendeu e o preço,
                se fez desconto. Elas <b>saem</b> do stock e contam no gráfico de vendas.
              </dd>
            </div>
            <div>
              <dt>Contagem</dt>
              <dd>
                Contou as unidades na prateleira. Escreva o número <b>que contou</b> e ele <b>substitui</b> o anterior.
                Use na primeira vez (para começar) e quando o número da loja não bate com o real (oferta, produto
                estragado, engano).
              </dd>
            </div>
            <div>
              <dt>Avisar quando tiver</dt>
              <dd>
                Quando o stock chega a este número ou menos, o produto aparece em “Repor em breve” e a loja mostra
                “Poucas unidades” aos clientes. Com 0 o produto mostra “Esgotado”.
              </dd>
            </div>
          </dl>
          <p>
            <b>Enganou-se numa venda?</b> Vá ao <Link href="/admin/historico">Histórico</Link> e toque em “Anular”: a
            venda deixa de contar e as unidades voltam ao stock. Para corrigir uma entrada, faça uma Contagem.
          </p>
        </div>
      </details>

      <h2 className="list-title">Produtos</h2>
      <StockTable items={items} />
    </>
  );
}
