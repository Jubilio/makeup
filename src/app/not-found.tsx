import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Página não encontrada</h1>
      <p>
        <Link href="/produtos">Ver todos os produtos</Link>
      </p>
    </>
  );
}
