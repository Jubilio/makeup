import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies, headers } from "next/headers";
import { getDB, type D1 } from "./db";

export const COOKIE = "aneka_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 dias

// Limite de tentativas de senha: depois de MAX_FAILS erros, o IP espera LOCK_MINUTES.
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

async function secrets(): Promise<{ password: string; secret: string }> {
  const { env } = await getCloudflareContext({ async: true });
  const e = env as unknown as Record<string, string | undefined>;
  const password = e.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";
  const secret = e.SESSION_SECRET || process.env.SESSION_SECRET || "";
  return { password, secret };
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// As tabelas estão em migrations/0002_security.sql; criamos aqui também para não depender de aplicar a migração.
let tablesReady = false;
async function db(): Promise<D1> {
  const d = await getDB();
  if (!tablesReady) {
    await d.batch([
      d.prepare(
        "CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT PRIMARY KEY, fails INTEGER NOT NULL DEFAULT 0, first_fail INTEGER NOT NULL)",
      ),
      d.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)"),
    ]);
    tablesReady = true;
  }
  return d;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "desconhecido";
}

/** Minutos que este IP ainda tem de esperar (0 = pode tentar). */
export async function loginLockedMinutes(): Promise<number> {
  const d = await db();
  const row = await d
    .prepare("SELECT fails, first_fail FROM login_attempts WHERE ip = ?")
    .bind(await clientIp())
    .first<{ fails: number; first_fail: number }>();
  if (!row || row.fails < MAX_FAILS) return 0;
  const left = row.first_fail + LOCK_MINUTES * 60_000 - Date.now();
  return left > 0 ? Math.ceil(left / 60_000) : 0;
}

export async function recordLoginFailure(): Promise<void> {
  const d = await db();
  const now = Date.now();
  const windowStart = now - LOCK_MINUTES * 60_000;
  // Erros antigos (fora da janela) recomeçam a contagem.
  await d
    .prepare(
      `INSERT INTO login_attempts (ip, fails, first_fail) VALUES (?, 1, ?)
       ON CONFLICT(ip) DO UPDATE SET
         fails = CASE WHEN first_fail < ? THEN 1 ELSE fails + 1 END,
         first_fail = CASE WHEN first_fail < ? THEN excluded.first_fail ELSE first_fail END`,
    )
    .bind(await clientIp(), now, windowStart, windowStart)
    .run();
}

export async function clearLoginFailures(): Promise<void> {
  const d = await db();
  await d.prepare("DELETE FROM login_attempts WHERE ip = ?").bind(await clientIp()).run();
}

export async function checkPassword(input: string): Promise<boolean> {
  const { password, secret } = await secrets();
  if (!password || !secret) return false;
  return safeEqual(await hmac(secret, input), await hmac(secret, password));
}

async function sessionEpoch(): Promise<string> {
  const d = await db();
  const row = await d.prepare("SELECT value FROM settings WHERE key = 'session_epoch'").first<{ value: string }>();
  return row?.value ?? "0";
}

// A assinatura inclui a senha atual e a "época" das sessões:
// trocar a ADMIN_PASSWORD ou clicar em "Sair" invalida todos os cookies já emitidos.
async function sign(secret: string, password: string, exp: string, epoch: string): Promise<string> {
  return hmac(secret, `${exp}.${epoch}.${password}`);
}

export async function createSession(): Promise<void> {
  const { password, secret } = await secrets();
  const exp = String(Date.now() + MAX_AGE * 1000);
  const token = `${exp}.${await sign(secret, password, exp, await sessionEpoch())}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** Termina a sessão neste e em todos os outros dispositivos. */
export async function destroySession(): Promise<void> {
  const d = await db();
  await d
    .prepare(
      `INSERT INTO settings (key, value) VALUES ('session_epoch', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
    .bind(crypto.randomUUID())
    .run();
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const { password, secret } = await secrets();
  if (!password || !secret) return false;
  return safeEqual(sig, await sign(secret, password, exp, await sessionEpoch()));
}
