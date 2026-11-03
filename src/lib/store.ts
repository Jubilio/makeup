export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Aneka Shop";

/**
 * Dados da loja mostrados aos clientes. Enquanto um campo estiver vazio, o site usa um texto genérico.
 * Para preencher, edite .env.production (ou mude os valores por defeito aqui).
 */
export const STORE_CITY = process.env.NEXT_PUBLIC_STORE_CITY || "";
/** Ex.: "Maputo e Matola: 150 MT, normalmente em 1 a 2 dias. Também pode levantar no Museu." */
export const DELIVERY_INFO =
  process.env.NEXT_PUBLIC_DELIVERY_INFO ||
  "Entrega ou levantamento combinados consigo pelo WhatsApp, antes de pagar.";
/** Ex.: "1 hora" */
export const REPLY_TIME = process.env.NEXT_PUBLIC_REPLY_TIME || "";
