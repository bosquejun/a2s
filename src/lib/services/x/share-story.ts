import "server-only";

import type { Payload } from "payload";

import {
  XApiError,
  postTweet,
  postTweetOAuth1,
  refreshAccessToken,
} from "./client";
import {
  clearConnection,
  getConnection,
  updateTokens,
  type StoredConnection,
} from "./connection";

/**
 * Shared by the manual "Share to X" button and the auto-post hook. Posts a story
 * to the connected X account and records the resulting tweet id on the story so
 * it is never shared twice. The access token is refreshed on demand; if the
 * connection has been revoked (401) the stored connection is cleared so the
 * admin is prompted to reconnect.
 */
const TWEET_LIMIT = 280;
const TCO_LENGTH = 23; // X wraps every link to a fixed-length t.co URL.

function storyUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/story/${slug}`;
}

export function buildTweetText(message: string, url?: string): string {
  if (!url) {
    return message.length > TWEET_LIMIT
      ? `${message.slice(0, TWEET_LIMIT - 1).trimEnd()}…`
      : message;
  }
  // Reserve room for a space + the t.co-wrapped link.
  const room = TWEET_LIMIT - TCO_LENGTH - 1;
  const text =
    message.length > room
      ? `${message.slice(0, room - 1).trimEnd()}…`
      : message;
  return `${text} ${url}`;
}

/** Return a non-expired access token, refreshing and persisting if needed. */
async function ensureAccessToken(
  payload: Payload,
  connection: StoredConnection
): Promise<string> {
  const expiresAt = connection.tokenExpiresAt
    ? Date.parse(connection.tokenExpiresAt)
    : 0;
  const needsRefresh = !expiresAt || expiresAt - Date.now() < 60_000;
  if (!needsRefresh || !connection.refreshToken) {
    return connection.accessToken as string;
  }
  const tokens = await refreshAccessToken(connection.refreshToken);
  await updateTokens(payload, tokens);
  return tokens.accessToken;
}

export interface ShareResult {
  postId: string;
  alreadyShared?: boolean;
}

export async function shareStory(
  payload: Payload,
  storyId: string | number
): Promise<ShareResult> {
  const story = await payload.findByID({
    collection: "stories",
    id: storyId,
    depth: 0,
    overrideAccess: true,
  });
  if (!story) throw new Error("Story not found");
  if (story.xPostId) {
    return { postId: story.xPostId, alreadyShared: true };
  }

  const connection = await getConnection(payload);
  if (!connection.connected || !connection.accessToken) {
    throw new Error("No X account is connected.");
  }

  const message = story.hook || story.excerpt || story.title;
  const text = buildTweetText(
    message,
    story.slug ? storyUrl(story.slug) : undefined
  );

  try {
    const postId =
      connection.authMethod === "oauth1"
        ? await postTweetOAuth1({
            creds: {
              consumerKey: connection.consumerKey as string,
              consumerSecret: connection.consumerSecret as string,
              accessToken: connection.accessToken,
              accessTokenSecret: connection.accessTokenSecret as string,
            },
            text,
          })
        : await postTweet({
            accessToken: await ensureAccessToken(payload, connection),
            text,
          });

    await payload.update({
      collection: "stories",
      id: storyId,
      data: { xPostId: postId },
      overrideAccess: true,
      // Avoid re-triggering the auto-post hook for this internal write.
      context: { skipXAutoPost: true },
    });

    return { postId };
  } catch (err) {
    if (err instanceof XApiError && err.status === 401) {
      await clearConnection(payload);
    }
    throw err;
  }
}
