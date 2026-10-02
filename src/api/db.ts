import { readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

// ============================================================
//  Connexion Postgres (Neon) — STRICTEMENT côté serveur.
//  DATABASE_URL ne doit JAMAIS utiliser le préfixe VITE_ :
//  il serait alors embarqué dans le bundle envoyé au navigateur.
// ============================================================

let cachedUrl: string | null = null;

function readEnvFile(): void {
  if (process.env.NODE_ENV === "production") return;
  try {
    const raw = readFileSync(join(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, value] = match;
      if (process.env[key] === undefined) {
        process.env[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // pas de .env — rien à faire
  }
}

export function getDatabaseUrl(): string | null {
  if (cachedUrl) return cachedUrl;
  readEnvFile();
  const url = process.env.DATABASE_URL?.trim();
  cachedUrl = url && url.startsWith("postgres") ? url : null;
  return cachedUrl;
}

export function isDatabaseConfigured(): boolean {
  return getDatabaseUrl() !== null;
}

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "Base de données non configurée. Définissez DATABASE_URL dans les variables d'environnement Vercel.",
    );
  }
  // <boolean, boolean> = mode tableau + résultats complets désactivés :
  // la requête résout directement en tableau de lignes.
  return neon<boolean, boolean>(url);
}

/** Exécute une requête et caste le résultat. Renvoie null si la DB est absente ou tombe. */
export async function tryQuery<T>(
  fn: (sql: ReturnType<typeof getSql>) => PromiseLike<unknown>,
): Promise<T[] | null> {
  try {
    const sql = getSql();
    const rows = await fn(sql);
    return (rows as T[]) ?? null;
  } catch (error) {
    console.warn(
      "[NOVA BNISIT] Base de données indisponible:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
