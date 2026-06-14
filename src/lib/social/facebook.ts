import "server-only";

import { SITE_URL } from "@/lib/seo";

// Pin the Graph API version so behavior doesn't shift under us when Facebook
// rolls the default forward.
const GRAPH_API_VERSION = "v21.0";

/** The story fields needed to build a Facebook post. */
export interface FacebookStoryInput {
  title: string;
  slug: string;
  hook?: string | null;
  excerpt?: string | null;
}

/** Page credentials, read once per call so unset env is a clean no-op. */
function getCredentials(): { pageId: string; accessToken: string } | null {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !accessToken) return null;
  return { pageId, accessToken };
}

/** Caption for the post — title plus the one-line hook (or excerpt fallback). */
function buildMessage(story: FacebookStoryInput): string {
  const tagline = story.hook?.trim() || story.excerpt?.trim() || "";
  return [story.title.trim(), tagline].filter(Boolean).join("\n\n");
}

/**
 * Publish a story to the configured Facebook Page feed as a link post —
 * Facebook renders the story's OG card from the link itself, so we only send
 * the caption and URL. Returns the new post id, or `null` when credentials are
 * absent (a deliberate no-op). Throws on an API error so callers can log it.
 */
export async function publishStoryToFacebook(
  story: FacebookStoryInput
): Promise<string | null> {
  const credentials = getCredentials();
  if (!credentials) return null;

  const { pageId, accessToken } = credentials;
  const link = `${SITE_URL}/story/${story.slug}`;

  const body = new URLSearchParams({
    message: buildMessage(story),
    link,
    access_token: accessToken,
  });

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`,
    { method: "POST", body }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Facebook Graph API responded ${res.status} ${res.statusText}: ${detail}`
    );
  }

  const data = (await res.json()) as { id?: string };
  return data.id ?? null;
}
