import "server-only";

import type { Payload } from "payload";

import { FacebookGraphError } from "@/lib/services/facebook/client";
import { clearConnection, getConnection } from "@/lib/services/facebook/connection";
import { createMediaContainer, publishMedia } from "./client";

const LINK_IN_BIO = "Read the full story — link in bio 🔗";

/**
 * Instagram captions cannot contain clickable links, so the caption leads with
 * the story's social hook (or excerpt/title) and points readers to the bio.
 */
export function buildInstagramCaption(story: {
  hook?: string | null;
  excerpt?: string | null;
  title: string;
}): string {
  const lead = story.hook || story.excerpt || story.title;
  return `${lead}\n\n${LINK_IN_BIO}`;
}

function igImageUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/story/${slug}/ig`;
}

export interface InstagramShareResult {
  postId: string;
  alreadyShared?: boolean;
}

/**
 * Publish a story to the connected Instagram business account: render the OG
 * image as the post media, create a media container, then publish it. The
 * `instagramPostId` guard prevents duplicate posts; an expired token (Graph
 * error 190) clears the connection so the admin is prompted to reconnect.
 */
export async function shareStoryToInstagram(
  payload: Payload,
  storyId: string | number
): Promise<InstagramShareResult> {
  const story = await payload.findByID({
    collection: "stories",
    id: storyId,
    depth: 0,
    overrideAccess: true,
  });
  if (!story) throw new Error("Story not found");
  if (story.instagramPostId) {
    return { postId: story.instagramPostId, alreadyShared: true };
  }

  const connection = await getConnection(payload);
  if (!connection.connected || !connection.pageAccessToken) {
    throw new Error("No Facebook Page is connected.");
  }
  if (!connection.instagramUserId) {
    throw new Error(
      "No Instagram business account is linked to the connected Page."
    );
  }
  if (!story.slug) throw new Error("Story has no slug");

  try {
    const creationId = await createMediaContainer({
      igUserId: connection.instagramUserId,
      pageAccessToken: connection.pageAccessToken,
      imageUrl: igImageUrl(story.slug),
      caption: buildInstagramCaption({
        hook: typeof story.hook === "string" ? story.hook : null,
        excerpt: typeof story.excerpt === "string" ? story.excerpt : null,
        title: String(story.title ?? ""),
      }),
    });
    const postId = await publishMedia({
      igUserId: connection.instagramUserId,
      pageAccessToken: connection.pageAccessToken,
      creationId,
    });

    await payload.update({
      collection: "stories",
      id: storyId,
      data: { instagramPostId: postId },
      overrideAccess: true,
      context: { skipInstagramAutoPost: true },
    });

    return { postId };
  } catch (err) {
    if (err instanceof FacebookGraphError && err.code === 190) {
      await clearConnection(payload);
    }
    throw err;
  }
}
