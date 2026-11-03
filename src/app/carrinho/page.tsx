"use client";

import Link from "next/link";
import { useState } from "react";
import { findVariant, formatMT, hasSingleVariant } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { buildOrderMessage, whatsappUrl, type Customer } from "@/lib/whatsapp";
import { DELIVERY_INFO, REPLY_TIME } from "@/lib/store";

export default function CarrinhoPage() {
  const { lines, total, hasUnpriced, setQty, remove, clear } = useCart();
  const [c, setC] = useState<Customer>({ name: "", phone: "", address: "", notes: "" });
  const [sent, setSent] = useState(false);
  const [lastUrl, setLastUrl] = useState("");

  if (lines.length === 0 && !sent) {
    return (
      <>
        <h1>Carrinho</h1>
        <p className="empty">
          O carrinho está vazio. <Link href="/produtos">Ver produtos</Link>
        </p>
      </>
    );
  }

  if (sent) {
    return (
      <>
        <h1>Obrigado{c.name.trim() ? `, ${c.name.trim().split(/\s+/)[0]}` : ""}!</h1>
        <p>
          Abrimos o WhatsApp com o seu pedido. Vamos responder a confirmar a disponibilidade e a entrega
          {REPLY_TIME ? `, normalmente em ${REPLY_TIME}` : ""}. Ainda não pagou nada.
        </p>
        {lastUrl && (
          <p>
            O WhatsApp não abriu?{" "}
            <a href={lastUrl} target="_blank" rel="noopener">
              Toque aqui para tentar de novo
            </a>
            .
          </p>
        )}
        <div className="row-btns">
          <Link href="/produtos" className="btn primary" onClick={() => clear()}>
            Esvaziar carrinho e continuar
          </Link>
          <button className="btn" onClick={() => setSent(false)}>
            Voltar ao carrinho
          </button>
        </div>
      </>
    );
  }

  const canSend = c.name.trim().length > 1;

  return (
    <>
      <h1>Carrinho</h1>
      <div className="cart-layout">
        <ul className="cart-lines">
          {lines.map((l) => {
            const found = findVariant(l.sku);
            if (!found) return null;
            const { product, variant } = found;
            return (
              <li key={l.sku} className="cart-line">
                <div>
                  <Link href={`/produto/${product.id}`} className="cart-name">
                    {product.name} {product.size}
                  </Link>
                  {!hasSingleVariant(product) && <span className="cart-variant">{variant.name}</span>}
                  <span className="cart-unit">{formatMT(product.price_mzn)} / un.</span>
                </div>
                <div className="cart-actions">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={l.qty}
                    aria-label={`Quantidade de ${product.name}`}
                    onChange={(e) => setQty(l.sku, Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                  />
                  <button className="link-btn" onClick={() => remove(l.sku)}>
                    Remover
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <form
          className="checkout"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSend) return;
            const msg = buildOrderMessage(lines, c, total, hasUnpriced);
            const url = whatsappUrl(msg);
            setLastUrl(url);
            window.open(url, "_blank", "noopener");
            setSent(true);
          }}
        >
          <p className="total">
            Total: <strong>{formatMT(total)}</strong>
            {hasUnpriced && <small> + itens com preço a confirmar</small>}
          </p>
          <p className="delivery">{DELIVERY_INFO}</p>
          <p className="step">Último passo: diga-nos quem é e onde entregar.</p>
          <label className="field">
            <span>Nome *</span>
            <input required value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} autoComplete="name" />
          </label>
          <label className="field">
            <span>Telefone (opcional, se for diferente do WhatsApp)</span>
            <input value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} autoComplete="tel" inputMode="tel" />
          </label>
          <label className="field">
            <span>Local de entrega ou levantamento (opcional)</span>
            <input value={c.address} onChange={(e) => setC({ ...c, address: e.target.value })} placeholder="Bairro, cidade" />
          </label>
          <label className="field">
            <span>Observações (opcional)</span>
            <textarea rows={2} value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} />
          </label>
          <button className="btn primary whatsapp" type="submit" disabled={!canSend}>
            Enviar pedido por WhatsApp
          </button>
          <p className="hint">
            Ainda não paga nada. Confirmamos a disponibilidade e a entrega, e só depois combinamos o pagamento
            consigo.
          </p>
        </form>
      </div>
    </>
  );
}
