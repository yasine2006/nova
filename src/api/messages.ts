import { createServerFn } from "@tanstack/react-start";
import { getSql, isDatabaseConfigured, tryQuery } from "./db";
import { requireAdmin } from "./auth";

// ============================================================
//  Messages reçus via le formulaire de contact.
//  Lecture / modification : admin uniquement.
// ============================================================

export interface ContactRow {
  id: number;
  name: string;
  email: string;
  company: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ContactStats {
  total: number;
  unread: number;
}

function int(value: unknown): number {
  const n =
    typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : 0;
}

// ─── Lecture (admin) ───────────────────────────────────────

export const getMessagesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContactRow[]> => {
    await requireAdmin();

    const rows = await tryQuery<ContactRow>(
      (sql) => sql`SELECT id, name, email, company, message, read, created_at
                    FROM contacts ORDER BY created_at DESC LIMIT 200`,
    );

    return rows ?? [];
  },
);

export const getStatsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContactStats> => {
    await requireAdmin();

    const rows = await tryQuery<{ total: number; unread: number }>(
      (sql) => sql`SELECT COUNT(*)::int AS total,
                          COUNT(*) FILTER (WHERE read = FALSE)::int AS unread
                   FROM contacts`,
    );

    return rows?.[0] ?? { total: 0, unread: 0 };
  },
);

export const setMessageReadFn = createServerFn({ method: "POST" })
  .validator((data: { id: number; read: boolean }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await getSql()`UPDATE contacts SET read = ${Boolean(data.read)} WHERE id = ${int(data.id)}`;
    return { ok: true };
  });

export const deleteMessageFn = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await getSql()`DELETE FROM contacts WHERE id = ${int(data.id)}`;
    return { ok: true };
  });

// ─── Réception (public, sans authentification) ─────────────

export interface ContactInput {
  name: string;
  email: string;
  company: string;
  message: string;
  /** Piège à robots : doit rester vide. */
  website?: string;
}

export type SubmitResult = "stored" | "mailto" | "not_configured";

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export const submitContactFn = createServerFn({ method: "POST" })
  .validator((data: ContactInput) => data)
  .handler(async ({ data }): Promise<SubmitResult> => {
    // Piège à robots : on renvoie "ok" sans rien écrire.
    if (data.website) return "stored";

    const name = clean(data.name, 200);
    const email = clean(data.email, 320);
    const message = clean(data.message, 5000);
    const company = clean(data.company, 200);

    if (!name || !message) throw new Error("Nom et message obligatoires.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error("Adresse email invalide.");

    if (!isDatabaseConfigured()) return "not_configured";

    await getSql()`
      INSERT INTO contacts (name, email, company, message)
      VALUES (${name}, ${email}, ${company}, ${message})
    `;

    return "stored";
  });
