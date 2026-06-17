import "server-only";

import type { Payload } from "payload";

import { buildHashtags, extractNames } from "@/lib/services/social/hashtags";
import {
  ThreadsApiError,
  createTextContainer,
  publishContainer,
  refreshLongLivedToken,
} from "./client";
import {
  clearConnection,
  getConnection,
  updateTokens,
  type StoredConnection,
} from "./connection";

/**
 * Shared by the manual "Share to Threads" button and the auto-post hook. Posts
 * a story to the connected Threads account and records the resulting post id on
 * the story so it is never shared twice. The long-lived token is refreshed on
 * demand; an expired/revoked token (API error 190) clears the connection so the
 * admin is prompted to reconnect.
 */

/** Threads posts allow up to 500 characters. */
const THREADS_LIMIT = 500;

/** A modest, human-looking number of hashtags — not a spammy wall. */
const THREADS_HASHTAG_LIMIT = 3;

function storyUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/story/${slug}`;
}

/**
 * Compose the post body: the story's social hook (or excerpt/title), an inline
 * clickable link to read on, and a few discovery hashtags — trimmed to fit the
 * 500-character limit. The lead is truncated first so the link and hashtags are
 * always preserved.
 */
export function buildThreadsText(
  message: string,
  url?: string,
  hashtags?: string
): string {
  const tail = [hashtags, url].filter(Boolean).join("\n\n");
  if (!tail) {
    return message.length > THREADS_LIMIT
      ? `${message.slice(0, THREADS_LIMIT - 1).trimEnd()}…`
      : message;
  }
  // Reserve room for the blank line + the tail (hashtags and/or link).
  const room = THREADS_LIMIT - tail.length - 2;
  const lead =
    message.length > room
      ? `${message.slice(0, Math.max(0, room - 1)).trimEnd()}…`
      : message;
  return `${lead}\n\n${tail}`;
}

/** Return a non-expired long-lived token, refreshing and persisting if needed. */
async function ensureAccessToken(
  payload: Payload,
  connection: StoredConnection
): Promise<string> {
  const expiresAt = connection.tokenExpiresAt
    ? Date.parse(connection.tokenExpiresAt)
    : 0;
  // Refresh once we're within a day of expiry (tokens last ≈60 days).
  const needsRefresh = !expiresAt || expiresAt - Date.now() < 24 * 60 * 60 * 1000;
  if (!needsRefresh) {
    return connection.accessToken as string;
  }
  const tokens = await refreshLongLivedToken(connection.accessToken as string);
  await updateTokens(payload, tokens);
  return tokens.accessToken;
}

export interface ThreadsShareResult {
  postId: string;
  alreadyShared?: boolean;
}

export async function shareStoryToThreads(
  payload: Payload,
  storyId: string | number
): Promise<ThreadsShareResult> {
  const story = await payload.findByID({
    collection: "stories",
    id: storyId,
    depth: 1,
    overrideAccess: true,
  });
  if (!story) throw new Error("Story not found");
  if (story.threadsPostId) {
    return { postId: story.threadsPostId, alreadyShared: true };
  }

  const connection = await getConnection(payload);
  if (!connection.connected || !connection.accessToken || !connection.threadsUserId) {
    throw new Error("No Threads account is connected.");
  }
  if (!story.slug) throw new Error("Story has no slug");

  const message = story.hook || story.excerpt || story.title;
  const text = buildThreadsText(
    String(message ?? ""),
    storyUrl(story.slug),
    buildHashtags(
      {
        categories: extractNames(story.categories),
        tags: extractNames(story.tags),
      },
      THREADS_HASHTAG_LIMIT
    )
  );

  try {
    const accessToken = await ensureAccessToken(payload, connection);
    const creationId = await createTextContainer({
      threadsUserId: connection.threadsUserId,
      accessToken,
      text,
    });
    const postId = await publishContainer({
      threadsUserId: connection.threadsUserId,
      accessToken,
      creationId,
    });

    await payload.update({
      collection: "stories",
      id: storyId,
      data: { threadsPostId: postId },
      overrideAccess: true,
      // Avoid re-triggering the auto-post hook for this internal write.
      context: { skipThreadsAutoPost: true },
    });

    return { postId };
  } catch (err) {
    if (err instanceof ThreadsApiError && err.code === 190) {
      await clearConnection(payload);
    }
    throw err;
  }
}
