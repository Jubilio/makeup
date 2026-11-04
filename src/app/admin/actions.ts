"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  clearLoginFailures,
  createSession,
  destroySession,
  isAdmin,
  loginLockedMinutes,
  recordLoginFailure,
} from "@/lib/auth";
import { findVariant } from "@/lib/catalog";
import { getDB } from "@/lib/db";

export type ActionState = { ok: boolean; message: string } | null;

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  const locked = await loginLockedMinutes();
  if (locked > 0) {
    return { ok: false, message: `Demasiadas tentativas. Tente de novo daqui a ${locked} min.` };
  }
  const password = String(form.get("password") || "").slice(0, 200);
  if (!(await checkPassword(password))) {
    await recordLoginFailure();
    return { ok: false, message: "Senha incorreta." };
  }
  await clearLoginFailures();
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

const KINDS = ["entrada", "venda", "acerto"] as const;
type Kind = (typeof KINDS)[number];

export async function recordMovement(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, message: "Sessão expirada. Entre de novo." };

  const sku = String(form.get("sku") || "");
  const kind = String(form.get("kind") || "") as Kind;
  const qty = Math.trunc(Number(form.get("qty")));
  const note = String(form.get("note") || "").slice(0, 200) || null;

  const found = findVariant(sku);
  if (!found) return { ok: false, message: "Produto desconhecido." };
  if (!KINDS.includes(kind)) return { ok: false, message: "Tipo de movimento inválido." };
  if (!Number.isFinite(qty) || qty < 0 || (kind !== "acerto" && qty === 0) || qty > 10000) {
    return { ok: false, message: "Quantidade inválida." };
  }

  const db = await getDB();
  const current = (await db.prepare("SELECT qty FROM stock WHERE sku = ?").bind(sku).first<{ qty: number }>())?.qty ?? 0;

  let next = current;
  let delta = qty;
  if (kind === "entrada") next = current + qty;
  if (kind === "venda") {
    if (qty > current) return { ok: false, message: `Só há ${current} em stock.` };
    next = current - qty;
  }
  if (kind === "acerto") {
    next = qty;
    delta = qty - current;
  }

  let unitPrice: number | null = null;
  if (kind === "venda") {
    // Preço por unidade: o do catálogo, a não ser que tenha escrito outro (desconto, preço combinado).
    const raw = String(form.get("price") ?? "").trim();
    unitPrice = raw === "" ? found.product.price_mzn : Math.round(Number(raw));
    if (unitPrice != null && (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 1_000_000)) {
      return { ok: false, message: "Preço inválido." };
    }
  }
  await db.batch([
    db
      .prepare(
        `INSERT INTO stock (sku, qty, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(sku) DO UPDATE SET qty = excluded.qty, updated_at = excluded.updated_at`,
      )
      .bind(sku, next),
    db
      .prepare("INSERT INTO movements (sku, kind, qty, unit_price, note) VALUES (?, ?, ?, ?, ?)")
      .bind(sku, kind, kind === "acerto" ? delta : qty, unitPrice, note),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/historico");
  const label = { entrada: "Entrada registada", venda: "Venda registada", acerto: "Stock acertado" }[kind];
  return { ok: true, message: `${label}: ${found.product.name} (${found.variant.name}) agora tem ${next}.` };
}

export async function setMinQty(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, message: "Sessão expirada. Entre de novo." };
  const sku = String(form.get("sku") || "");
  const min = Math.trunc(Number(form.get("min_qty")));
  if (!findVariant(sku) || !Number.isFinite(min) || min < 0 || min > 1000) {
    return { ok: false, message: "Valor inválido." };
  }
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO stock (sku, qty, min_qty) VALUES (?, 0, ?)
       ON CONFLICT(sku) DO UPDATE SET min_qty = excluded.min_qty`,
    )
    .bind(sku, min)
    .run();
  revalidatePath("/admin");
  return { ok: true, message: "Alerta de stock atualizado." };
}

/** Anula uma venda: deixa de contar nos totais e as unidades voltam ao stock. Fica no histórico. */
export async function cancelSale(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, message: "Sessão expirada. Entre de novo." };
  const id = Math.trunc(Number(form.get("id")));
  if (!Number.isFinite(id) || id <= 0) return { ok: false, message: "Venda desconhecida." };

  const db = await getDB();
  const sale = await db
    .prepare("SELECT sku, qty FROM movements WHERE id = ? AND kind = 'venda' AND cancelled_at IS NULL")
    .bind(id)
    .first<{ sku: string; qty: number }>();
  if (!sale) return { ok: false, message: "Esta venda já foi anulada ou não existe." };

  await db.batch([
    db.prepare("UPDATE movements SET cancelled_at = datetime('now') WHERE id = ? AND cancelled_at IS NULL").bind(id),
    db
      .prepare(
        `INSERT INTO stock (sku, qty, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(sku) DO UPDATE SET qty = stock.qty + excluded.qty, updated_at = excluded.updated_at`,
      )
      .bind(sale.sku, sale.qty),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/historico");
  return { ok: true, message: `Venda anulada. ${sale.qty} un. voltaram ao stock.` };
}
