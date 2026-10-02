import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useSession as createSessionCookie } from "@tanstack/react-start/server";

// ============================================================
//  Session admin — cookie httpOnly + signée.
//  Le cookie est illisible en JavaScript : une faille XSS ne peut
//  pas voler la session. Rien n'est stocké dans localStorage.
// ============================================================

const ONE_WEEK = 60 * 60 * 24 * 7;

export interface SessionData {
  /** Horodatage d'expiration — permet de révoquer côté serveur. */
  exp?: number;
}

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

export function getSessionSecret(): string {
  readDotEnv();
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET manquant ou trop court (32 caractères minimum). " +
        "Générez-le avec : node -e \"console.log(require('crypto').randomBytes(48).toString('base64url'))\"",
    );
  }
  // Développement uniquement : évite de bloquer le démarrage.
  return "nova-dev-secret-insecure-0123456789abcdef";
}

export function adminSession() {
  return createSessionCookie<SessionData>({
    name: "nova_admin",
    password: getSessionSecret(),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
}

export const SESSION_MAX_AGE = ONE_WEEK;

export function sessionIsValid(data: SessionData | undefined): boolean {
  return typeof data?.exp === "number" && Date.now() < data.exp;
}

export function sessionExpiry(): number {
  return Date.now() + ONE_WEEK * 1000;
}
