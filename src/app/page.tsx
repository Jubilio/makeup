import Link from "next/link";
import { categories, categorySlug, products } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

const FEATURED = [
  "signature-range-perfume-50ml",
  "classic-range-perfume-30ml",
  "modern-me-perfume-35ml",
  "luxury-travel-fragrance-set-5x10ml",
  "flawless-skin-perfecting-foundation-35ml",
  "mohlolo-hair-serum-50ml",
  "tissue-oil-150ml",
  "multi-effect-moisturizer-45ml",
];

export default function Home() {
  const featured = FEATURED.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;
  return (
    <>
      <section className="hero">
        <h1>Perfumes e cuidados INUKA, entregues a si.</h1>
        <p>
          Escolha os seus produtos, junte ao carrinho e envie o pedido pelo WhatsApp. Confirmamos
          disponibilidade e entrega consigo.
        </p>
        <Link href="/produtos" className="btn primary">
          Ver catálogo
        </Link>
      </section>

      <section>
        <h2>Categorias</h2>
        <div className="cat-grid">
          {categories.map((c) => (
            <Link key={c} href={`/produtos?categoria=${encodeURIComponent(c)}`} className={`cat-tile art-${categorySlug(c)}`}>
              <span>{c}</span>
              <small>{products.filter((p) => p.category === c).length} produtos</small>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>Destaques</h2>
        <div className="grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="how">
        <h2>Como encomendar</h2>
        <ol>
          <li>Escolha o produto e a fragrância, cor ou tom.</li>
          <li>Abra o carrinho e preencha o seu nome e onde quer receber.</li>
          <li>Carregue em “Enviar pedido por WhatsApp”. Respondemos a confirmar.</li>
        </ol>
      </section>
    </>
  );
}
