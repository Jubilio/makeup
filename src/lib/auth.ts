import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";

export const COOKIE = "aneka_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 dias

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

export async function checkPassword(input: string): Promise<boolean> {
  const { password, secret } = await secrets();
  if (!password || !secret) return false;
  return safeEqual(await hmac(secret, input), await hmac(secret, password));
}

export async function createSession(): Promise<void> {
  const { secret } = await secrets();
  const expires = Date.now() + MAX_AGE * 1000;
  const token = `${expires}.${await hmac(secret, String(expires))}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const { secret } = await secrets();
  if (!secret) return false;
  return safeEqual(sig, await hmac(secret, exp));
}
