import { NextResponse } from "next/server";
import { getProduct } from "@/lib/catalog";
import { getStockMap } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Disponibilidade das variantes de um produto, só para as já registadas no estoque. Usado na página do produto.
 * Resposta: { [sku]: quantidade } mais `_low`: lista de SKUs com quantidade entre 1 e o limite de aviso.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("produto") || "";
  const product = getProduct(id);
  if (!product) return NextResponse.json({ error: "produto desconhecido" }, { status: 404 });
  try {
    const stock = await getStockMap();
    const out: Record<string, number | string[]> = {};
    const low: string[] = [];
    for (const v of product.variants) {
      const row = stock.get(v.sku);
      if (!row) continue; // variantes ainda não registadas no estoque ficam de fora
      out[v.sku] = row.qty;
      if (row.qty > 0 && row.qty <= row.min_qty) low.push(v.sku);
    }
    out._low = low;
    return NextResponse.json(out, { headers: { "Cache-Control": "public, max-age=30" } });
  } catch {
    return NextResponse.json({}, { status: 503 });
  }
}
