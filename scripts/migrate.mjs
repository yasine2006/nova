import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

/**
 * Applique `db/schema.sql` sur la base Neon.
 *
 *   DATABASE_URL=postgresql://… npm run migrate
 *
 * Le fichier est idempotent (CREATE TABLE IF NOT EXISTS, et le contenu
 * initial n'est inséré que si la table est vide) : le relancer sur une
 * base déjà remplie ne duplique rien et n'écrase aucune modification.
 */

const file = process.argv[2] ?? "db/schema.sql";
const sql = readFileSync(file, "utf8");

if (!process.env.DATABASE_URL) {
  console.error(
    "\n❌ DATABASE_URL absente. Mettez-la dans .env ou en variable d'environnement.\n",
  );
  process.exit(1);
}

/**
 * Neon n'accepte qu'une instruction par requête : on découpe donc le
 * fichier. Les commentaires `--` partent d'abord, et les points-virgules
 * situés dans un littéral (`'…'`) ne coupent pas.
 */
function splitStatements(source) {
  const cleaned = source
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  const statements = [];
  let buffer = "";
  let quote = null;

  for (const ch of cleaned) {
    if (quote) {
      buffer += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      buffer += ch;
      continue;
    }
    if (ch === ";") {
      if (buffer.trim()) statements.push(buffer.trim());
      buffer = "";
      continue;
    }
    buffer += ch;
  }
  if (buffer.trim()) statements.push(buffer.trim());
  return statements;
}

const statements = splitStatements(sql);
console.log(`\n${statements.length} instructions détectées dans ${file}\n`);

const client = neon(process.env.DATABASE_URL);

for (const statement of statements) {
  const label = statement.split("\n")[0].slice(0, 62);
  try {
    await client.query(statement);
    console.log(`  ✓ ${label}`);
  } catch (error) {
    console.error(`  ✗ ${label}\n    ${error.message}\n`);
    process.exit(1);
  }
}

const tables = await client.query(
  `SELECT table_name,
          (xpath('/row/c/text()',
            query_to_xml(format('SELECT count(*) AS c FROM %I.%I', table_schema, table_name),
                         false, true, '')))[1]::text::int AS rows
     FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name`,
);

// Selon la version du driver, query() renvoie soit un tableau, soit { rows }.
const rows = Array.isArray(tables) ? tables : tables.rows;

console.log("\nÉtat de la base :");
for (const row of rows) {
  console.log(`  ${row.table_name.padEnd(14)} ${row.rows} ligne(s)`);
}
console.log("\n✅ Terminé.\n");