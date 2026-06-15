// Loader-independent SQL migration runner.
//
// Payload's `payload migrate` CLI cannot load this project's config in a plain
// Node process: the config relies on bundler-only (extensionless) imports and a
// dependency graph that only resolves under Next's bundler, so the CLI throws
// (ERR_MODULE_NOT_FOUND on Node 22, an undici/CacheStorage crash on Node 20).
//
// This runner sidesteps all of that. It connects with `pg` only, applies any
// `src/migrations/*.sql` files not yet recorded, and tracks them in Payload's
// own `payload_migrations` table so the framework's bookkeeping stays accurate.
// It is safe to run on every deploy: already-applied migrations are skipped and
// an advisory lock guards against concurrent runs.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const { Client } = pg;

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "migrations");
const ADVISORY_LOCK_KEY = 4927150; // arbitrary, stable per-project lock id

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("[migrate] no .sql migrations found, nothing to do");
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(`SELECT pg_advisory_lock(${ADVISORY_LOCK_KEY})`);

    // Matches the schema Payload creates for its migration bookkeeping.
    await client.query(`
      CREATE TABLE IF NOT EXISTS "payload_migrations" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar,
        "batch" numeric,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      )
    `);

    const { rows } = await client.query(`SELECT name FROM "payload_migrations"`);
    const applied = new Set(rows.map((r) => r.name));

    const { rows: batchRows } = await client.query(
      `SELECT COALESCE(MAX(batch), 0) + 1 AS next FROM "payload_migrations"`
    );
    const batch = Number(batchRows[0].next);

    let ran = 0;
    for (const file of files) {
      const name = file.replace(/\.sql$/, "");
      if (applied.has(name)) {
        console.log(`[migrate] skip ${name} (already applied)`);
        continue;
      }

      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      console.log(`[migrate] applying ${name} ...`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          `INSERT INTO "payload_migrations" ("name", "batch") VALUES ($1, $2)`,
          [name, batch]
        );
        await client.query("COMMIT");
        ran++;
        console.log(`[migrate] applied ${name}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log(`[migrate] done (${ran} applied, ${files.length - ran} skipped)`);
  } finally {
    await client.query(`SELECT pg_advisory_unlock(${ADVISORY_LOCK_KEY})`).catch(() => {});
    await client.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed:", err.message);
  process.exit(1);
});
