import "server-only";

import type { Payload } from "payload";

import { buildHashtags, extractNames } from "@/lib/services/social/hashtags";
import { FacebookGraphError, postToPage } from "./client";
import { clearConnection, getConnection } from "./connection";

/** Hashtags carry less discovery weight on Facebook, so keep the set tight. */
const FACEBOOK_HASHTAG_LIMIT = 4;

/**
 * Shared by the manual "Share to Facebook" button and the auto-post hook. Posts
 * a story to the connected Page and records the resulting post id on the story
 * so it is never shared twice. If the Page token has been revoked/expired
 * (Graph error 190) the stored connection is cleared so the admin is prompted
 * to reconnect.
 */
function storyUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/story/${slug}`;
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
    depth: 1,
    overrideAccess: true,
  });
  if (!story) throw new Error("Story not found");
  if (story.facebookPostId) {
    return { postId: story.facebookPostId, alreadyShared: true };
  }

  const connection = await getConnection(payload);
  if (!connection.connected || !connection.pageId || !connection.pageAccessToken) {
    throw new Error("No Facebook Page is connected.");
  }

  const lead = story.hook || story.excerpt || story.title;
  const hashtags = buildHashtags(
    {
      categories: extractNames(story.categories),
      tags: extractNames(story.tags),
    },
    FACEBOOK_HASHTAG_LIMIT
  );
  const message = hashtags ? `${lead}\n\n${hashtags}` : lead;

  try {
    const postId = await postToPage({
      pageId: connection.pageId,
      pageAccessToken: connection.pageAccessToken,
      message,
      link: story.slug ? storyUrl(story.slug) : undefined,
    });

    await payload.update({
      collection: "stories",
      id: storyId,
      data: { facebookPostId: postId },
      overrideAccess: true,
      // Avoid re-triggering the auto-post hook for this internal write.
      context: { skipFacebookAutoPost: true },
    });

    return { postId };
  } catch (err) {
    if (err instanceof FacebookGraphError && err.code === 190) {
      await clearConnection(payload);
    }
    throw err;
  }
}
