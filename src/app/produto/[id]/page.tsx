import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatMT, getProduct, hasSingleVariant, isComingSoon, packCount, products } from "@/lib/catalog";
import { DELIVERY_INFO } from "@/lib/store";
import { whatsappUrl } from "@/lib/whatsapp";
import { ProductArt } from "@/components/ProductArt";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  return { title: p ? `${p.name} ${p.size}` : "Produto" };
}

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const pack = packCount(product);
  const askUrl = whatsappUrl(`Olá! Tenho uma dúvida sobre o ${product.name}${product.size ? ` ${product.size}` : ""}.`);
  const related = products.filter((p) => p.line === product.line && p.id !== product.id).slice(0, 4);

  return (
    <>
      <nav className="crumbs">
        <Link href="/produtos">Produtos</Link> ›{" "}
        <Link href={`/produtos?categoria=${encodeURIComponent(product.category)}`}>{product.category}</Link>
      </nav>
      <div className="detail">
        <ProductArt product={product} large />
        <div>
          <span className="card-cat">Linha {product.line}</span>
          <h1>{product.name}</h1>
          {product.size && <p className="size">{product.size}</p>}
          <p className="price-big">{isComingSoon(product) ? "Brevemente" : formatMT(product.price_mzn)}</p>
          {pack && product.price_mzn != null && !isComingSoon(product) && (
            <p className="per-unit">
              {pack} frascos, {formatMT(Math.round(product.price_mzn / pack))} cada
            </p>
          )}
          <AddToCart product={product} />
          <p className="delivery">{DELIVERY_INFO}</p>
          <a className="btn ask" href={askUrl} target="_blank" rel="noopener">
            Tem dúvidas sobre este produto? Pergunte no WhatsApp
          </a>
          {!hasSingleVariant(product) && (
            <details className="variants">
              <summary>Ver todas as opções ({product.variants.length})</summary>
              <ul>
                {product.variants.map((v) => (
                  <li key={v.sku}>{v.name}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <section>
          <h2>Da mesma linha</h2>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
