import { findVariant, formatMT, hasSingleVariant } from "./catalog";
import type { CartLine } from "./cart";

export type Customer = { name: string; phone: string; address: string; notes: string };

export function buildOrderMessage(lines: CartLine[], customer: Customer, total: number, hasUnpriced: boolean): string {
  const out: string[] = ["Olá! Gostaria de fazer este pedido:", ""];
  lines.forEach((l, i) => {
    const found = findVariant(l.sku);
    if (!found) return;
    const { product, variant } = found;
    const variantText = hasSingleVariant(product) ? "" : ` (${variant.name})`;
    const size = product.size ? ` ${product.size}` : "";
    const price =
      product.price_mzn == null ? "preço a confirmar" : formatMT(product.price_mzn * l.qty);
    out.push(`${i + 1}. ${l.qty}x ${product.name}${size}${variantText}: ${price}`);
  });
  out.push("");
  out.push(`Total: ${formatMT(total)}${hasUnpriced ? " + itens a confirmar" : ""}`);
  out.push("");
  out.push(`Nome: ${customer.name}`);
  if (customer.phone) out.push(`Telefone: ${customer.phone}`);
  if (customer.address) out.push(`Entrega: ${customer.address}`);
  if (customer.notes) out.push(`Observações: ${customer.notes}`);
  return out.join("\n");
}

export function whatsappUrl(message: string): string {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  const text = encodeURIComponent(message);
  return number ? `https://wa.me/${number}?text=${text}` : `https://wa.me/?text=${text}`;
}
