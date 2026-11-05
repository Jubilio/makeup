"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";
import { STORE_NAME } from "@/lib/store";

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export function Header() {
  const { count } = useCart();
  const path = usePathname();
  const onProducts = path.startsWith("/produto");
  const onCart = path.startsWith("/carrinho");
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="brand" aria-label={`${STORE_NAME}, página inicial`}>
          <img src="/logo.svg" alt="" width={40} height={40} className="brand-logo" />
          <span className="brand-name">{STORE_NAME}</span>
        </Link>
        <nav className="nav" aria-label="Menu principal">
          <Link href="/produtos" className={onProducts ? "nav-link on" : "nav-link"} aria-current={onProducts ? "page" : undefined}>
            Produtos
          </Link>
          <Link
            href="/carrinho"
            className={onCart ? "nav-link cart-link on" : "nav-link cart-link"}
            aria-current={onCart ? "page" : undefined}
            aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
          >
            <BagIcon />
            <span className="cart-label">Carrinho</span>
            {count > 0 && <span key={count} className="badge">{count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
