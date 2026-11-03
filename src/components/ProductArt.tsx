/* eslint-disable @next/next/no-img-element */
import { categorySlug, type Product } from "@/lib/catalog";

/** Foto do produto (recortada da revista). Substitua public/produtos/<id>.webp por uma foto real quando houver. */
export function ProductArt({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div className={`art art-${categorySlug(product.category)}${large ? " art-large" : ""}`}>
      <img
        src={`/produtos/${product.id}.webp`}
        alt={`${product.name} ${product.size}`.trim()}
        width={640}
        height={640}
        loading={large ? "eager" : "lazy"}
      />
    </div>
  );
}
