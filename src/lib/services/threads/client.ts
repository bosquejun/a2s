import "server-only";

/**
 * Thin wrappers around the Threads API (Meta) used by the browser-based connect
 * flow and the server-side publisher. The Threads API is free: there is no
 * paid tier and no per-post charge — production access is gated only by Meta
 * App Review and a generous per-profile rate limit (~250 posts / 24h).
 *
 * Auth is a plain server-side OAuth redirect (no JS SDK): exchange the code for
 * a short-lived token, immediately upgrade it to a long-lived (60-day) token,
 * and refresh that token in the background before it expires.
 *
 * Publishing is the same two-step container dance as Instagram: create a media
 * container, then publish it. Threads text posts (unlike Instagram captions)
 * may contain a clickable link, so we publish the story URL inline.
 */
const GRAPH_VERSION = "v1.0";
const GRAPH = `https://graph.threads.net/${GRAPH_VERSION}`;
const TOKEN_HOST = "https://graph.threads.net";
const OAUTH_DIALOG = "https://threads.net/oauth/authorize";

// Permissions needed to read the connected profile and publish posts. Posting
// in production requires Meta App Review for threads_content_publish.
export const THREADS_SCOPES = ["threads_basic", "threads_content_publish"];

export class ThreadsApiError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = "ThreadsApiError";
    this.code = code;
  }
}

export interface ThreadsTokens {
  accessToken: string;
  /** Seconds until the (long-lived) token expires. */
  expiresIn: number;
}

export function getAppCredentials(): { appId: string; appSecret: string } {
  const appId = process.env.THREADS_APP_ID;
  const appSecret = process.env.THREADS_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("THREADS_APP_ID and THREADS_APP_SECRET must be set");
  }
  return { appId, appSecret };
}

export function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/threads/callback`;
}

export function buildOAuthUrl(state: string): string {
  const { appId } = getAppCredentials();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getRedirectUri(),
    state,
    scope: THREADS_SCOPES.join(","),
    response_type: "code",
  });
  return `${OAUTH_DIALOG}?${params.toString()}`;
}

async function readJson(
  res: Response,
  fallback: string
): Promise<Record<string, unknown>> {
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || json?.error) {
    const error = json?.error as
      | { message?: string; code?: number }
      | undefined;
    throw new ThreadsApiError(
      error?.message ?? `${fallback} (${res.status})`,
      error?.code
    );
  }
  return json;
}

/**
 * Exchange the one-time OAuth code for a short-lived user token. Threads
 * returns this from a POST form (not a GET like the long-lived/refresh calls).
 */
export async function exchangeCodeForToken(
  code: string
): Promise<{ accessToken: string; userId: string }> {
  const { appId, appSecret } = getAppCredentials();
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: getRedirectUri(),
    code,
  });
  const res = await fetch(`${TOKEN_HOST}/oauth/access_token`, {
    method: "POST",
    body,
  });
  const json = await readJson(res, "Failed to exchange Threads code");
  return {
    accessToken: String(json.access_token ?? ""),
    userId: String(json.user_id ?? ""),
  };
}

/** Upgrade a short-lived token to a long-lived (≈60-day) token. */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<ThreadsTokens> {
  const { appSecret } = getAppCredentials();
  const url = new URL(`${TOKEN_HOST}/access_token`);
  url.searchParams.set("grant_type", "th_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", shortLivedToken);
  const res = await fetch(url, { method: "GET" });
  const json = await readJson(res, "Failed to obtain long-lived Threads token");
  return {
    accessToken: String(json.access_token ?? ""),
    expiresIn: Number(json.expires_in ?? 0),
  };
}

/**
 * Refresh a long-lived token, extending it for another ≈60 days. The token must
 * be at least 24 hours old to be refreshable; callers refresh as it nears
 * expiry, so that constraint is never hit in practice.
 */
export async function refreshLongLivedToken(
  longLivedToken: string
): Promise<ThreadsTokens> {
  const url = new URL(`${TOKEN_HOST}/refresh_access_token`);
  url.searchParams.set("grant_type", "th_refresh_token");
  url.searchParams.set("access_token", longLivedToken);
  const res = await fetch(url, { method: "GET" });
  const json = await readJson(res, "Failed to refresh Threads token");
  return {
    accessToken: String(json.access_token ?? ""),
    expiresIn: Number(json.expires_in ?? 0),
  };
}

/** Resolve the connected profile (the Threads user id + @username). */
export async function getProfile(
  accessToken: string
): Promise<{ id: string; username: string }> {
  const url = new URL(`${GRAPH}/me`);
  url.searchParams.set("fields", "id,username");
  url.searchParams.set("access_token", accessToken);
  const res = await fetch(url, { method: "GET" });
  const json = await readJson(res, "Failed to read Threads profile");
  return {
    id: String(json.id ?? ""),
    username: String(json.username ?? ""),
  };
}

/** Step 1 of publishing: stage a text post, get a creation id. */
export async function createTextContainer(opts: {
  threadsUserId: string;
  accessToken: string;
  text: string;
  /** When set, the container is staged as a reply to this post id. */
  replyToId?: string;
}): Promise<string> {
  const body = new URLSearchParams({
    media_type: "TEXT",
    text: opts.text,
    access_token: opts.accessToken,
  });
  if (opts.replyToId) body.set("reply_to_id", opts.replyToId);
  const res = await fetch(`${GRAPH}/${opts.threadsUserId}/threads`, {
    method: "POST",
    body,
  });
  const json = await readJson(res, "Failed to create Threads post");
  return String(json.id ?? "");
}

/** Step 2 of publishing: publish a staged creation id, get the post id. */
export async function publishContainer(opts: {
  threadsUserId: string;
  accessToken: string;
  creationId: string;
}): Promise<string> {
  const body = new URLSearchParams({
    creation_id: opts.creationId,
    access_token: opts.accessToken,
  });
  const res = await fetch(`${GRAPH}/${opts.threadsUserId}/threads_publish`, {
    method: "POST",
    body,
  });
  const json = await readJson(res, "Failed to publish Threads post");
  return String(json.id ?? "");
}
