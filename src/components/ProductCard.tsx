import Link from "next/link";
import { formatMT, hasSingleVariant, isComingSoon, type Product } from "@/lib/catalog";
import { ProductArt } from "./ProductArt";

export function ProductCard({ product }: { product: Product }) {
  const n = product.variants.length;
  return (
    <Link href={`/produto/${product.id}`} className="card">
      <ProductArt product={product} />
      <div className="card-body">
        <span className="card-cat">{product.category}</span>
        <h3 className="card-title">{product.name}</h3>
        <span className="card-meta">
          {product.size}
          {!hasSingleVariant(product) && `${product.size ? " · " : ""}${n} opções`}
        </span>
        <span className="card-price">
          {isComingSoon(product) ? "Brevemente" : formatMT(product.price_mzn)}
        </span>
      </div>
    </Link>
  );
}
