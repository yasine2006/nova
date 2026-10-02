import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sessionExpiry, sessionIsValid, adminSession } from "./session";

// ============================================================
//  Authentification admin — vérifiée côté serveur uniquement.
//  Le client ne reçoit qu'un booléen `authenticated`.
//  Les identifiants ne quittent JAMAIS le serveur.
// ============================================================

// ─── Mot de passe ───────────────────────────────────────────
// Le hash vit dans ADMIN_PASSWORD_HASH (format scrypt : salt:hash).
// Pour le générer :  npm run hash-password

let dotEnvLoaded = false;

function readDotEnv(): void {
  if (dotEnvLoaded || process.env.NODE_ENV === "production") return;
  dotEnvLoaded = true;
  try {
    const raw = readFileSync(join(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, value] = match;
      if (process.env[key] === undefined)
        process.env[key] = value.replace(/^["']|["']$/g, "");
    }
  } catch {
    // pas de .env
  }
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expected, "hex");
  if (actual.length !== expectedBuf.length) return false;
  return timingSafeEqual(actual, expectedBuf);
}

// ─── Limitation des tentatives ─────────────────────────────
// 5 essais par quart d'heure et par IP.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

function clientIp(): string {
  try {
    const headers = getRequestHeaders() as unknown as Record<
      string,
      string | undefined
    >;
    const forwarded = headers["x-forwarded-for"];
    const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return value?.split(",")[0]?.trim() || "unknown";
  } catch {
    return "unknown";
  }
}

function tooManyAttempts(ip: string): boolean {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): void {
  const entry = attempts.get(ip);
  if (!entry || Date.now() > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

// ─── Vérification de session ───────────────────────────────

/** À appeler au début de CHAQUE server fn qui lit ou écrit des données privées. */
export async function requireAdmin() {
  const session = await adminSession();
  if (!sessionIsValid(session.data)) {
    throw new Error("UNAUTHORIZED");
  }
  return true;
}

export function isAuthError(error: unknown): boolean {
  return error instanceof Error && error.message === "UNAUTHORIZED";
}

// ─── Server fns ────────────────────────────────────────────

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    readDotEnv();
    const ip = clientIp();

    if (tooManyAttempts(ip)) {
      throw new Error("TOO_MANY_ATTEMPTS");
    }

    const stored = process.env.ADMIN_PASSWORD_HASH?.trim();
    if (!stored) {
      throw new Error("NO_PASSWORD_CONFIGURED");
    }

    const ok = verifyPassword(data.password, stored);

    if (!ok) {
      recordFailure(ip);
      throw new Error("INVALID_PASSWORD");
    }

    clearAttempts(ip);

    const session = await adminSession();
    await session.update({ exp: sessionExpiry() });

    return { ok: true };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await adminSession();
  await session.clear();
  return { ok: true };
});

export const getAuthStatusFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await adminSession();
    return { authenticated: sessionIsValid(session.data) };
  },
);

/** Empreinte SHA-256 de l'email admin — sert à identifier l'auteur des modifications. */
export function adminFingerprint(): string {
  readDotEnv();
  const source = process.env.ADMIN_EMAIL?.trim() || "admin";
  return createHash("sha256").update(source).digest("hex").slice(0, 8);
}
