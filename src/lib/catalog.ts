import data from "@data/catalogo.json";

export type Variant = { sku: string; name: string };
export type Product = {
  id: string;
  category: string;
  line: string;
  name: string;
  size: string;
  price_mzn: number | null;
  variants: Variant[];
  page: number | null;
  note: string;
};

export const products: Product[] = (data as { products: Product[] }).products;

export const CATEGORY_ORDER = [
  "Perfumes",
  "Corpo",
  "Pele",
  "Maquilhagem",
  "Lábios",
  "Unhas",
  "Cabelo",
  "Pés",
  "Bem-estar",
  "Casa",
  "Criança",
];

export const categories: string[] = CATEGORY_ORDER.filter((c) =>
  products.some((p) => p.category === c),
);

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function findVariant(sku: string): { product: Product; variant: Variant } | undefined {
  for (const product of products) {
    const variant = product.variants.find((v) => v.sku === sku);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function isComingSoon(p: Product): boolean {
  return p.note.toLowerCase().includes("coming soon");
}

export function hasSingleVariant(p: Product): boolean {
  return p.variants.length === 1 && p.variants[0].name === "Único";
}

const fmt = new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 0 });

export function formatMT(value: number | null): string {
  return value == null ? "Preço sob consulta" : `${fmt.format(value)} MT`;
}

export function categorySlug(c: string): string {
  return c
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}
