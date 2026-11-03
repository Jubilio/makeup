"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";
import { STORE_NAME } from "@/lib/store";

export function Header() {
  const { count } = useCart();
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="brand">
          {STORE_NAME}
        </Link>
        <nav className="nav">
          <Link href="/produtos">Produtos</Link>
          <Link href="/carrinho" className="cart-link" aria-label={`Carrinho, ${count} itens`}>
            Carrinho
            {count > 0 && <span className="badge">{count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
