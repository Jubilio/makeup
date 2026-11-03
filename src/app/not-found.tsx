import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Página não encontrada</h1>
      <p>O endereço pode estar errado ou o produto já não existe.</p>
      <Link href="/produtos" className="btn primary">
        Ver todos os produtos
      </Link>
    </>
  );
}
