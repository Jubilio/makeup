import Link from "next/link";
import { categories, categorySlug, products } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { TrustStrip } from "@/components/TrustStrip";
import { STORE_CITY } from "@/lib/store";

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

const STEPS = [
  { title: "Escolha", text: "Escolha o produto e a fragrância, cor ou tom." },
  { title: "Preencha", text: "Abra o carrinho e preencha o seu nome e onde quer receber." },
  {
    title: "Envie pelo WhatsApp",
    text: "Carregue em “Enviar pedido por WhatsApp”. Respondemos a confirmar e só depois combinamos o pagamento.",
  },
];

export default function Home() {
  const featured = FEATURED.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;
  return (
    <>
      <section className="hero">
        <h1>{STORE_CITY ? `Perfumes INUKA originais, com entrega em ${STORE_CITY}.` : "Perfumes INUKA originais, entregues a si."}</h1>
        <p>
          Escolha no catálogo, envie o pedido pelo WhatsApp e só paga depois de confirmarmos o seu pedido.
        </p>
        <Link href="/produtos" className="btn primary">
          Ver perfumes e cuidados
        </Link>
        <TrustStrip />
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
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title} className="step-card">
              <span className="step-num" aria-hidden="true">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
