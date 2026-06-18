// Shared helpers for the daily story-generation routine CLI.
//
// The routine itself is a scheduled Claude agent that *authors* stories (the
// creative work an LLM must do each run). These helpers cover only the
// mechanical scaffolding around that — surveying the live site for variety
// context and publishing finished stories through the ingest endpoint — so the
// agent doesn't re-derive curl calls and response parsing every run.

import "dotenv/config";

/** Resolved environment the routine needs to talk to the live site. */
export type RoutineEnv = {
  /** Production base URL, no trailing slash (e.g. https://after2am.example). */
  site: string;
  /** Bearer token for POST /api/stories/ingest. */
  secret: string;
};

/**
 * Read SITE + STORY_GENERATION_SECRET from the environment. `publish` needs the
 * secret; `survey` only hits public read endpoints, so callers pass
 * `requireSecret: false` to make it optional.
 */
export function loadEnv(opts: { requireSecret: boolean }): RoutineEnv {
  const rawSite = process.env.SITE ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!rawSite) {
    fail(
      "SITE is not set (production base URL, e.g. https://after2am.example)"
    );
  }
  const site = rawSite.replace(/\/+$/, "");

  const secret = process.env.STORY_GENERATION_SECRET ?? "";
  if (opts.requireSecret && !secret) {
    fail(
      "STORY_GENERATION_SECRET is not set (bearer token for the ingest endpoint)"
    );
  }

  return { site, secret };
}

/** Print an error to stderr and exit non-zero. */
export function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

/**
 * GET a Payload REST list (under /payload-api) and return its `docs`. Retries a
 * few times on transient network/5xx errors with exponential backoff.
 */
export async function payloadList<T>(
  env: RoutineEnv,
  path: string
): Promise<T[]> {
  const url = `${env.site}/payload-api${path}`;
  const res = await fetchWithRetry(url, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    fail(`GET ${path} -> ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { docs?: T[] };
  return body.docs ?? [];
}

/** fetch() with bounded exponential-backoff retries on network/5xx errors. */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  attempts = 4
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      // Retry only on transient server errors; 4xx are caller bugs, return them.
      if (res.status >= 500 && i < attempts - 1) {
        await sleep(backoffMs(i));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await sleep(backoffMs(i));
    }
  }
  fail(`network error after ${attempts} attempts: ${String(lastError)}`);
}

const backoffMs = (attempt: number) => 2000 * 2 ** attempt; // 2s, 4s, 8s, ...
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
