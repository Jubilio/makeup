import { NextResponse } from "next/server";
import { getProduct } from "@/lib/catalog";
import { getStockMap } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Disponibilidade das variantes de um produto: { [sku]: quantidade }, só para as já registadas no estoque. Usado na página do produto. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("produto") || "";
  const product = getProduct(id);
  if (!product) return NextResponse.json({ error: "produto desconhecido" }, { status: 404 });
  try {
    const stock = await getStockMap();
    const out: Record<string, number> = {};
    for (const v of product.variants) {
      const row = stock.get(v.sku);
      if (row) out[v.sku] = row.qty; // variantes ainda não registadas no estoque ficam de fora
    }
    return NextResponse.json(out, { headers: { "Cache-Control": "public, max-age=30" } });
  } catch {
    return NextResponse.json({}, { status: 503 });
  }
}
