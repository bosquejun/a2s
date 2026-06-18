import "server-only";

/**
 * Thin wrappers around the Facebook Graph API used by the browser-based Page
 * connection flow. No Facebook JS SDK is used — the connect step is a plain
 * server-side OAuth redirect, so there are no client-side CSP concerns.
 */
const GRAPH_VERSION = "v21.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;
const OAUTH_DIALOG = `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`;

// Permissions needed to list a user's Pages and publish to them. Posting on
// behalf of a Page in production requires Meta App Review for pages_manage_posts.
export const FACEBOOK_SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
];

export class FacebookGraphError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = "FacebookGraphError";
    this.code = code;
  }
}

export function getAppCredentials(): { appId: string; appSecret: string } {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("FACEBOOK_APP_ID and FACEBOOK_APP_SECRET must be set");
  }
  return { appId, appSecret };
}

export function getRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/facebook/callback`;
}

export function buildOAuthUrl(state: string): string {
  const { appId } = getAppCredentials();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: getRedirectUri(),
    state,
    scope: FACEBOOK_SCOPES.join(","),
    response_type: "code",
  });
  return `${OAUTH_DIALOG}?${params.toString()}`;
}

async function graphGet<T>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url, { method: "GET" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new FacebookGraphError(
      json?.error?.message ?? `Graph request failed (${res.status})`,
      json?.error?.code
    );
  }
  return json as T;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const { appId, appSecret } = getAppCredentials();
  const data = await graphGet<{ access_token: string }>("oauth/access_token", {
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: getRedirectUri(),
    code,
  });
  return data.access_token;
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<string> {
  const { appId, appSecret } = getAppCredentials();
  const data = await graphGet<{ access_token: string }>("oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });
  return data.access_token;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
}

export async function listManagedPages(
  userToken: string
): Promise<FacebookPage[]> {
  const data = await graphGet<{ data: FacebookPage[] }>("me/accounts", {
    access_token: userToken,
    fields: "id,name,access_token",
  });
  return data.data ?? [];
}

export async function postToPage(opts: {
  pageId: string;
  pageAccessToken: string;
  message: string;
  link?: string;
}): Promise<string> {
  const url = new URL(`${GRAPH}/${opts.pageId}/feed`);
  const body = new URLSearchParams({
    message: opts.message,
    access_token: opts.pageAccessToken,
  });
  if (opts.link) body.set("link", opts.link);
  const res = await fetch(url, { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new FacebookGraphError(
      json?.error?.message ?? "Failed to publish to Facebook Page",
      json?.error?.code
    );
  }
  return json.id as string;
}

/**
 * Publish a single photo to a Facebook Page via the `/photos` edge. Facebook
 * fetches the image at `imageUrl` server-side, so it must be publicly
 * reachable. The `caption` becomes the post body — a photo post shows no link
 * preview card, so any "read on" link belongs inline in the caption. Returns
 * the underlying post id (`post_id`) so it lines up with `/feed` post ids and
 * can be linked the same way.
 */
export async function postPhotoToPage(opts: {
  pageId: string;
  pageAccessToken: string;
  imageUrl: string;
  caption: string;
}): Promise<string> {
  const url = new URL(`${GRAPH}/${opts.pageId}/photos`);
  const body = new URLSearchParams({
    url: opts.imageUrl,
    caption: opts.caption,
    access_token: opts.pageAccessToken,
  });
  const res = await fetch(url, { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new FacebookGraphError(
      json?.error?.message ?? "Failed to publish photo to Facebook Page",
      json?.error?.code
    );
  }
  // `/photos` returns both the photo `id` and the feed `post_id`; prefer the
  // post id so callers can build a normal facebook.com/{post_id} permalink.
  return (json.post_id ?? json.id) as string;
}
