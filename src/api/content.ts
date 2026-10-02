import { createServerFn } from "@tanstack/react-start";
import { getSql, isDatabaseConfigured, tryQuery } from "./db";
import { requireAdmin } from "./auth";

// ============================================================
//  Contenu du site — lectures publiques, écritures réservées à l'admin.
//  Chaque écriture appelle requireAdmin() côté serveur : c'est la
//  frontière de sécurité, pas l'UI.
// ============================================================

export interface ProjectRow {
  id: number;
  title: string;
  category: string;
  description: string;
  image_url: string;
  link_url: string;
  sort_order: number;
}

export interface ServiceRow {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface TestimonialRow {
  id: number;
  name: string;
  role: string;
  quote: string;
  sort_order: number;
}

export interface FaqRow {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
}

export interface SettingsMap {
  [key: string]: string;
}

export interface Content {
  projects: ProjectRow[];
  services: ServiceRow[];
  testimonials: TestimonialRow[];
  faqs: FaqRow[];
  settings: SettingsMap;
}

export const EMPTY_CONTENT: Content = {
  projects: [],
  services: [],
  testimonials: [],
  faqs: [],
  settings: {},
};

// ─── Lecture publique ──────────────────────────────────────
// Renvoie null si la DB est absente → le site retombe sur src/data/site.ts.

export const getPublicContentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Content | null> => {
    if (!isDatabaseConfigured()) return null;

    const [projects, services, testimonials, faqs, settings] =
      await Promise.all([
        tryQuery<ProjectRow>(
          (
            sql,
          ) => sql`SELECT id, title, category, description, image_url, link_url, sort_order
                      FROM projects ORDER BY sort_order, id`,
        ),
        tryQuery<ServiceRow>(
          (sql) => sql`SELECT id, title, description, icon, color, sort_order
                      FROM services ORDER BY sort_order, id`,
        ),
        tryQuery<TestimonialRow>(
          (sql) => sql`SELECT id, name, role, quote, sort_order
                      FROM testimonials ORDER BY sort_order, id`,
        ),
        tryQuery<FaqRow>(
          (sql) =>
            sql`SELECT id, question, answer, sort_order FROM faqs ORDER BY sort_order, id`,
        ),
        tryQuery<{ key: string; value: string }>(
          (sql) => sql`SELECT key, value FROM settings`,
        ),
      ]);

    if (!projects || !services || !testimonials || !faqs || !settings)
      return null;

    const map: SettingsMap = {};
    for (const row of settings) map[row.key] = row.value;

    return { projects, services, testimonials, faqs, settings: map };
  },
);

// ─── Lecture admin ─────────────────────────────────────────

export const getAdminContentFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<Content> => {
    await requireAdmin();
    return (await getPublicContentFn()) ?? EMPTY_CONTENT;
  },
);

// ─── Validation ────────────────────────────────────────────

function str(value: unknown, max = 5000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function int(value: unknown, fallback = 0): number {
  const n =
    typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** N'autorise que http(s) — bloque javascript:, data: et vbscript: (XSS stocké). */
function cleanUrl(value: unknown): string {
  const url = str(value, 2000);
  if (!url) return "";
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
  return parsed.toString();
}

export interface ProjectInput {
  id?: number | null;
  title: string;
  category: string;
  description: string;
  image_url: string;
  link_url: string;
  sort_order: number;
}

export interface ServiceInput {
  id?: number | null;
  title: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface TestimonialInput {
  id?: number | null;
  name: string;
  role: string;
  quote: string;
  sort_order: number;
}

export interface FaqInput {
  id?: number | null;
  question: string;
  answer: string;
  sort_order: number;
}

export interface IdInput {
  id: number;
}

// ─── Projets ───────────────────────────────────────────────

export const saveProjectFn = createServerFn({ method: "POST" })
  .validator((data: ProjectInput) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const sql = getSql();

    const title = str(data.title, 200);
    if (!title) throw new Error("Le titre est obligatoire.");

    const payload = {
      title,
      category: str(data.category, 200) || "Projet",
      description: str(data.description, 2000),
      image_url: cleanUrl(data.image_url),
      link_url: cleanUrl(data.link_url),
      sort_order: int(data.sort_order),
    };

    if (data.id) {
      await sql`
        UPDATE projects SET
          title = ${payload.title}, category = ${payload.category},
          description = ${payload.description}, image_url = ${payload.image_url},
          link_url = ${payload.link_url}, sort_order = ${payload.sort_order}
        WHERE id = ${int(data.id)}
      `;
    } else {
      await sql`
        INSERT INTO projects (title, category, description, image_url, link_url, sort_order)
        VALUES (${payload.title}, ${payload.category}, ${payload.description},
                ${payload.image_url}, ${payload.link_url}, ${payload.sort_order})
      `;
    }

    return { ok: true };
  });

export const deleteProjectFn = createServerFn({ method: "POST" })
  .validator((data: IdInput) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await getSql()`DELETE FROM projects WHERE id = ${int(data.id)}`;
    return { ok: true };
  });

// ─── Services ──────────────────────────────────────────────

export const saveServiceFn = createServerFn({ method: "POST" })
  .validator((data: ServiceInput) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const sql = getSql();

    const title = str(data.title, 200);
    if (!title) throw new Error("Le titre est obligatoire.");

    const rawColor = str(data.color, 9);
    const payload = {
      title,
      description: str(data.description, 2000),
      icon: str(data.icon, 40) || "Code2",
      color: /^#[0-9a-f]{3,8}$/i.test(rawColor) ? rawColor : "#2563EB",
      sort_order: int(data.sort_order),
    };

    if (data.id) {
      await sql`
        UPDATE services SET
          title = ${payload.title}, description = ${payload.description},
          icon = ${payload.icon}, color = ${payload.color}, sort_order = ${payload.sort_order}
        WHERE id = ${int(data.id)}
      `;
    } else {
      await sql`
        INSERT INTO services (title, description, icon, color, sort_order)
        VALUES (${payload.title}, ${payload.description}, ${payload.icon},
                ${payload.color}, ${payload.sort_order})
      `;
    }

    return { ok: true };
  });

export const deleteServiceFn = createServerFn({ method: "POST" })
  .validator((data: IdInput) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await getSql()`DELETE FROM services WHERE id = ${int(data.id)}`;
    return { ok: true };
  });

// ─── Témoignages ───────────────────────────────────────────

export const saveTestimonialFn = createServerFn({ method: "POST" })
  .validator((data: TestimonialInput) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const sql = getSql();

    const name = str(data.name, 200);
    const quote = str(data.quote, 2000);
    if (!name || !quote)
      throw new Error("Le nom et la citation sont obligatoires.");

    const payload = {
      name,
      quote,
      role: str(data.role, 200),
      sort_order: int(data.sort_order),
    };

    if (data.id) {
      await sql`
        UPDATE testimonials SET
          name = ${payload.name}, role = ${payload.role},
          quote = ${payload.quote}, sort_order = ${payload.sort_order}
        WHERE id = ${int(data.id)}
      `;
    } else {
      await sql`
        INSERT INTO testimonials (name, role, quote, sort_order)
        VALUES (${payload.name}, ${payload.role}, ${payload.quote}, ${payload.sort_order})
      `;
    }

    return { ok: true };
  });

export const deleteTestimonialFn = createServerFn({ method: "POST" })
  .validator((data: IdInput) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await getSql()`DELETE FROM testimonials WHERE id = ${int(data.id)}`;
    return { ok: true };
  });

// ─── FAQ ───────────────────────────────────────────────────

export const saveFaqFn = createServerFn({ method: "POST" })
  .validator((data: FaqInput) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const sql = getSql();

    const question = str(data.question, 500);
    const answer = str(data.answer, 3000);
    if (!question || !answer)
      throw new Error("La question et la réponse sont obligatoires.");

    const payload = { question, answer, sort_order: int(data.sort_order) };

    if (data.id) {
      await sql`
        UPDATE faqs SET
          question = ${payload.question}, answer = ${payload.answer}, sort_order = ${payload.sort_order}
        WHERE id = ${int(data.id)}
      `;
    } else {
      await sql`
        INSERT INTO faqs (question, answer, sort_order)
        VALUES (${payload.question}, ${payload.answer}, ${payload.sort_order})
      `;
    }

    return { ok: true };
  });

export const deleteFaqFn = createServerFn({ method: "POST" })
  .validator((data: IdInput) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    await getSql()`DELETE FROM faqs WHERE id = ${int(data.id)}`;
    return { ok: true };
  });

// ─── Réordonnancement ──────────────────────────────────────

const SORTABLE_TABLES: Record<string, string> = {
  projects: "projects",
  services: "services",
  testimonials: "testimonials",
  faqs: "faqs",
};

export const reorderFn = createServerFn({ method: "POST" })
  .validator((data: { table: string; ids: number[] }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();

    // Liste blanche : le nom injecté provient uniquement de cette table connue.
    const table = SORTABLE_TABLES[data.table];
    if (!table) throw new Error("Table inconnue.");

    const sql = getSql();
    const statement = `UPDATE ${table} SET sort_order = $1 WHERE id = $2`;

    const ids = data.ids.map(int).filter(Number.isFinite);
    for (const [index, id] of ids.entries()) {
      await sql.query(statement, [index + 1, id]);
    }

    return { ok: true };
  });

// ─── Coordonnées de contact ────────────────────────────────

export const SETTING_KEYS = [
  "email",
  "phone",
  "phone_raw",
  "address",
  "hours",
  "whatsapp",
  "facebook",
  "instagram",
  "site_description",
] as const;

const URL_SETTINGS = new Set<string>(["whatsapp", "facebook", "instagram"]);

export const saveSettingsFn = createServerFn({ method: "POST" })
  .validator((data: { settings: Record<string, string> }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const sql = getSql();

    for (const key of SETTING_KEYS) {
      if (!(key in data.settings)) continue;

      const value = URL_SETTINGS.has(key)
        ? cleanUrl(data.settings[key])
        : str(data.settings[key], 1000);

      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
    }

    return { ok: true };
  });
