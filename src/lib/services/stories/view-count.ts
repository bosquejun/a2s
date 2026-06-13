import "server-only";

import type { Pool } from "pg";
import { getPayloadClient } from "@/lib/payload";

/**
 * View counts are mutated with raw, parameterized SQL via the Postgres pool
 * instead of `payload.update()`. This is deliberate: a Payload update would
 * fire the `stories` collection hooks (`enrichStory` beforeChange,
 * `revalidateStory` afterChange) — meaning every single view would blow away
 * the cached story page and churn the version table (`maxPerDoc: 20`). The raw
 * `UPDATE` skips hooks, versions and revalidation, and `col = col + 1` is
 * atomic under concurrent requests.
 */
async function getPool(): Promise<Pool> {
  const payload = await getPayloadClient();
  // The Postgres adapter exposes the node-postgres pool; Payload's base
  // adapter type doesn't surface it, so we narrow here.
  return (payload.db as unknown as { pool: Pool }).pool;
}

/** Atomically increment a published story's view count. Returns the new total. */
export async function incrementViewCount(slug: string): Promise<number | null> {
  const pool = await getPool();
  const { rows } = await pool.query<{ view_count: string }>(
    `UPDATE stories
       SET view_count = COALESCE(view_count, 0) + 1
     WHERE slug = $1 AND "_status" = 'published'
     RETURNING view_count`,
    [slug]
  );
  // numeric columns come back as strings from node-postgres.
  return rows[0] ? Number(rows[0].view_count) : null;
}

/** Read a published story's current view count. */
export async function getViewCount(slug: string): Promise<number | null> {
  const pool = await getPool();
  const { rows } = await pool.query<{ view_count: string }>(
    `SELECT view_count
       FROM stories
      WHERE slug = $1 AND "_status" = 'published'
      LIMIT 1`,
    [slug]
  );
  return rows[0] ? Number(rows[0].view_count ?? 0) : null;
}
