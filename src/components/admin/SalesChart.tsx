"use client";

import { useState } from "react";
import { formatMT } from "@/lib/catalog";

export type ChartPoint = { key: string; label: string; value: number; units: number; count: number };

type Range = "7" | "30" | "12m";
const RANGES: [Range, string][] = [
  ["7", "7 dias"],
  ["30", "30 dias"],
  ["12m", "12 meses"],
];

function vendas(n: number) {
  return `${n} ${n === 1 ? "venda" : "vendas"}`;
}

/** Arredonda o topo do eixo para um número "redondo" (1, 2 ou 5 × 10ⁿ). */
function niceMax(v: number) {
  if (v <= 0) return 1000;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

export function SalesChart({ days, months }: { days: ChartPoint[]; months: ChartPoint[] }) {
  const [range, setRange] = useState<Range>("30");
  const [active, setActive] = useState<number | null>(null);

  const data = range === "12m" ? months : days.slice(range === "7" ? -7 : -30);
  const total = data.reduce((n, d) => n + d.value, 0);
  const count = data.reduce((n, d) => n + d.count, 0);
  const units = data.reduce((n, d) => n + d.units, 0);
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const sel = active != null ? data[active] : null;
  const period = RANGES.find(([r]) => r === range)![1];

  return (
    <section className="panel chart-panel" aria-labelledby="chart-title">
      <div className="panel-head">
        <h2 id="chart-title">Vendas válidas</h2>
        <div className="seg seg-sm" role="radiogroup" aria-label="Período">
          {RANGES.map(([r, label]) => (
            <label key={r} className={range === r ? "on" : ""}>
              <input
                type="radio"
                name="range"
                value={r}
                checked={range === r}
                onChange={() => {
                  setRange(r);
                  setActive(null);
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <p className="readout" aria-live="polite">
        {sel ? (
          <>
            <span>{sel.label}</span>
            <strong>{formatMT(sel.value)}</strong>
            <span>
              {vendas(sel.count)} · {sel.units} un.
            </span>
          </>
        ) : (
          <>
            <span>Últimos {period}</span>
            <strong>{formatMT(total)}</strong>
            <span>
              {vendas(count)} · {units} un.
            </span>
          </>
        )}
      </p>

      {total === 0 ? (
        <p className="empty chart-empty">
          Ainda não há vendas neste período. Quando confirmar um pedido do WhatsApp, abra o produto na lista
          abaixo, escolha <b>Venda</b> e guarde. A venda aparece aqui.
        </p>
      ) : (
        <div className="chart" onMouseLeave={() => setActive(null)}>
          <div className="chart-grid" aria-hidden="true">
            <span>{formatMT(max)}</span>
            <span>{formatMT(max / 2)}</span>
            <span>0</span>
          </div>
          <div className={`bars bars-${data.length}`}>
            {data.map((d, i) => (
              <button
                key={d.key}
                type="button"
                className={`bar${active === i ? " on" : ""}`}
                aria-label={`${d.label}: ${formatMT(d.value)}, ${vendas(d.count)}`}
                aria-pressed={active === i}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(active === i ? null : i)}
              >
                <span className="bar-fill" style={{ height: `${(d.value / max) * 100}%` }} />
              </button>
            ))}
          </div>
          <div className="chart-x" aria-hidden="true">
            <span>{data[0].label}</span>
            <span>{data[data.length - 1].label}</span>
          </div>
        </div>
      )}

      {total > 0 && (
        <details className="chart-table">
          <summary>Ver em tabela</summary>
          <div className="table-wrap">
            <table className="hist">
              <thead>
                <tr>
                  <th>{range === "12m" ? "Mês" : "Dia"}</th>
                  <th>Vendas</th>
                  <th>Unidades</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((d) => d.count > 0)
                  .reverse()
                  .map((d) => (
                    <tr key={d.key}>
                      <td>{d.label}</td>
                      <td>{d.count}</td>
                      <td>{d.units}</td>
                      <td>{formatMT(d.value)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      <p className="hint chart-note">
        Só contam as vendas registadas aqui e não anuladas. Pedidos do WhatsApp entram quando os regista como venda.
      </p>
    </section>
  );
}
