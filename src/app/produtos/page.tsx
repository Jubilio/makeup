import type { Metadata } from "next";
import { categories } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria = "" } = await searchParams;
  const initial = categories.includes(categoria) ? categoria : "";
  return (
    <>
      <h1>Produtos</h1>
      <CatalogBrowser key={initial} initialCategory={initial} />
    </>
  );
}
