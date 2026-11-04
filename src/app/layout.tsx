import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { STORE_NAME } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: STORE_NAME, template: `%s · ${STORE_NAME}` },
  description: "Perfumes, cuidados de corpo, pele, cabelo e maquilhagem INUKA. Encomende pelo WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <CartProvider>
          <Header />
          <main className="wrap main">{children}</main>
          <footer className="site-footer">
            <div className="wrap">
              <span className="footer-name" aria-hidden="true">{STORE_NAME}</span>
              <p>
                {STORE_NAME} · Produtos INUKA · Preços em meticais (MT), catálogo 2026.{" "}
                <Link href="/produtos">Ver todos os produtos</Link>
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
