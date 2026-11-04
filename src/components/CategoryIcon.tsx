import { categorySlug } from "@/lib/catalog";

/** Ícones de traço fino (24x24) para cada categoria. Usam currentColor; são decorativos. */
const ICONS: Record<string, React.ReactNode> = {
  // Frasco de perfume com brilho
  perfumes: (
    <>
      <rect x="9.5" y="2.5" width="5" height="3" rx="0.8" />
      <path d="M10.5 5.5v2M13.5 5.5v2" />
      <rect x="5.5" y="7.5" width="13" height="14" rx="3.5" />
      <path d="m12 11.5 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" />
    </>
  ),
  // Loção com doseador
  corpo: (
    <>
      <path d="M10 2.5h4M12 2.5V6M9.5 6h5v2.5h-5z" />
      <path d="M8.5 8.5h7a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20V10a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M9.5 14.5c.8-.7 1.7-.7 2.5 0s1.7.7 2.5 0" />
    </>
  ),
  // Boião de creme com gota
  pele: (
    <>
      <path d="M12 2.5c1.6 2 2.5 3.4 2.5 4.6a2.5 2.5 0 0 1-5 0c0-1.2.9-2.6 2.5-4.6Z" />
      <rect x="4.5" y="12" width="15" height="3" rx="1" />
      <path d="M5.5 15h13v4a2.5 2.5 0 0 1-2.5 2.5H8A2.5 2.5 0 0 1 5.5 19v-4Z" />
    </>
  ),
  // Pincel de maquilhagem
  maquilhagem: (
    <>
      <path d="M14.5 9.5 20 4" />
      <path d="M8.5 11.5c2-2 4.2-2.2 5.5-.9 1.3 1.3 1.1 3.5-.9 5.5-2.2 2.2-6.4 3.9-8.6 3.4-.5-2.2 1.2-5.2 4-8Z" />
    </>
  ),
  // Lábios
  labios: (
    <>
      <path d="M2.5 12c2.5-3.5 5-5 6.8-5 1.1 0 1.9.6 2.7 1.4.8-.8 1.6-1.4 2.7-1.4 1.8 0 4.3 1.5 6.8 5-2.6 3.6-5.9 5.5-9.5 5.5S5.1 15.6 2.5 12Z" />
      <path d="M2.5 12c3.2.9 6.4 1.3 9.5 1.3s6.3-.4 9.5-1.3" />
    </>
  ),
  // Verniz
  unhas: (
    <>
      <path d="M10 2.5h4v6h-4z" />
      <path d="M8 8.5h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
      <path d="M9 13.5h6" />
    </>
  ),
  // Pente
  cabelo: (
    <>
      <path d="M4 6.5h16a1.5 1.5 0 0 1 1.5 1.5v2.5h-19V8A1.5 1.5 0 0 1 4 6.5Z" />
      <path d="M4.5 10.5v8M7.5 10.5v8M10.5 10.5v8M13.5 10.5v8M16.5 10.5v8M19.5 10.5v5" />
    </>
  ),
  // Pegada
  pes: (
    <>
      <path d="M10.5 21.5c-2.8 0-4.5-2.2-4.5-5 0-2.8 1.8-5.5 5-5.5 2.9 0 4.8 1.8 4.8 4.2 0 1.3-.8 2-.8 3.1 0 1.9-1.7 3.2-4.5 3.2Z" />
      <circle cx="6.4" cy="8" r="1.4" />
      <circle cx="9.3" cy="5.9" r="1.4" />
      <circle cx="12.4" cy="5.5" r="1.2" />
      <circle cx="15" cy="6.6" r="1" />
      <circle cx="16.8" cy="8.7" r="0.8" />
    </>
  ),
  // Folha
  "bem-estar": (
    <>
      <path d="M5 19C5 10.5 10.5 5 20 4.5c-.5 9.5-6 15-14.5 15" />
      <path d="M5 19 13 11" />
    </>
  ),
  // Difusor de varetas
  casa: (
    <>
      <path d="M12 11V3M12 11 8 4M12 11l4-7" />
      <path d="M9 11h6v1.5a5.5 5.5 0 0 1 3 4.9v1.6a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 19v-1.6a5.5 5.5 0 0 1 3-4.9V11Z" />
    </>
  ),
  // Ursinho
  crianca: (
    <>
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="6.5" r="2.5" />
      <circle cx="12" cy="13" r="7.5" />
      <path d="M10 15.5c1.2.9 2.8.9 4 0" />
      <path d="M9.5 11.5h.01M14.5 11.5h.01" strokeWidth="2.4" />
    </>
  ),
};

export function CategoryIcon({ category, size = 24 }: { category: string; size?: number }) {
  const icon = ICONS[categorySlug(category)];
  if (!icon) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="cat-icon"
    >
      {icon}
    </svg>
  );
}
