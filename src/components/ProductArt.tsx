import { categorySlug, type Product } from "@/lib/catalog";

/** Imagem provisória até termos fotos dos produtos: um cartão com a linha e o tamanho. */
export function ProductArt({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div className={`art art-${categorySlug(product.category)}${large ? " art-large" : ""}`} aria-hidden="true">
      <span className="art-line">{product.line}</span>
      <span className="art-mark">INUKA</span>
      {product.size && <span className="art-size">{product.size}</span>}
    </div>
  );
}
