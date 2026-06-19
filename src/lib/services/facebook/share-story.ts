import "server-only";

import type { Payload } from "payload";

import { buildHashtags, extractNames } from "@/lib/services/social/hashtags";
import {
  buildLinkComment,
  waitBeforeComment,
} from "@/lib/services/social/link-comment";
import { getLinkInCommentSettings } from "@/lib/services/social/settings";
import {
  commentOnPost,
  FacebookGraphError,
  postPhotoToPage,
  postToPage,
} from "./client";
import { clearConnection, getConnection } from "./connection";

/** Hashtags carry less discovery weight on Facebook, so keep the set tight. */
const FACEBOOK_HASHTAG_LIMIT = 4;

function siteBase(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return base.replace(/\/$/, "");
}

function storyUrl(slug: string): string {
  return `${siteBase()}/story/${slug}`;
}

/** The story's OG hook card rendered as a landscape JPEG for a Page photo post. */
function fbImageUrl(slug: string): string {
  return `${siteBase()}/story/${slug}/fb`;
}

/** "text" posts a link with an auto-preview; "photo" posts the OG hook card. */
export type FacebookPostFormat = "text" | "photo";

export interface ShareResult {
  postId: string;
  alreadyShared?: boolean;
}

export interface ShareOptions {
  /** "photo" (default) posts the OG hook card; "text" posts a link with preview. */
  format?: FacebookPostFormat;
}

/**
 * Shared by the manual "Share to Facebook" button and the auto-post hook. Posts
 * a story to the connected Page and records the resulting post id on the story
 * so it is never shared twice. If the Page token has been revoked/expired
 * (Graph error 190) the stored connection is cleared so the admin is prompted
 * to reconnect.
 *
 * Two formats: "photo" (default) publishes the story's OG hook card as a single
 * Page photo — the Facebook counterpart to Instagram's single-image post — and
 * "text" falls back to the older link-with-preview feed post.
 *
 * Orthogonally, the link-in-first-comment setting keeps the story link out of
 * the post body (the photo caption or the feed link preview) and drops it into
 * the first comment instead, to dodge Facebook's outbound-link reach penalty.
 */
export async function shareStory(
  payload: Payload,
  storyId: string | number,
  options: ShareOptions = {}
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
  if (
    !connection.connected ||
    !connection.pageId ||
    !connection.pageAccessToken
  ) {
    throw new Error("No Facebook Page is connected.");
  }

  // A photo post needs a slug to render the hook card and link back; without one
  // we can only fall back to a plain text post.
  const format: FacebookPostFormat =
    (options.format ?? "photo") === "photo" && story.slug ? "photo" : "text";

  const lead = story.hook || story.excerpt || story.title;
  const url = story.slug ? storyUrl(story.slug) : undefined;
  const hashtags = buildHashtags(
    {
      categories: extractNames(story.categories),
      tags: extractNames(story.tags),
    },
    FACEBOOK_HASHTAG_LIMIT
  );
  const { facebook: linkInComment } = await getLinkInCommentSettings(payload);
  // When the link goes in the first comment we deliberately leave it out of the
  // post body (caption / feed link) to dodge the outbound-link reach penalty.
  const bodyLink = linkInComment ? undefined : url;

  try {
    let postId: string;
    if (format === "photo" && story.slug) {
      // A photo post has no link preview card, so when the link belongs in the
      // body it is folded inline into the caption.
      const caption = [
        lead,
        bodyLink && `Read the full story: ${bodyLink}`,
        hashtags,
      ]
        .filter(Boolean)
        .join("\n\n");
      postId = await postPhotoToPage({
        pageId: connection.pageId,
        pageAccessToken: connection.pageAccessToken,
        imageUrl: fbImageUrl(story.slug),
        caption,
      });
    } else {
      const message = hashtags ? `${lead}\n\n${hashtags}` : lead;
      postId = await postToPage({
        pageId: connection.pageId,
        pageAccessToken: connection.pageAccessToken,
        message,
        link: bodyLink,
      });
    }

    await payload.update({
      collection: "stories",
      id: storyId,
      data: { facebookPostId: postId },
      overrideAccess: true,
      // Avoid re-triggering the auto-post hook for this internal write.
      context: { skipFacebookAutoPost: true },
    });

    // Best-effort: a failed comment must not undo a successful post.
    if (linkInComment && url && !story.facebookCommentId) {
      try {
        // Pause briefly so the comment doesn't land the same instant as the
        // post, which reads as automation.
        await waitBeforeComment();
        const commentId = await commentOnPost({
          postId,
          pageAccessToken: connection.pageAccessToken,
          message: buildLinkComment(url),
        });
        await payload.update({
          collection: "stories",
          id: storyId,
          data: { facebookCommentId: commentId },
          overrideAccess: true,
          context: { skipFacebookAutoPost: true },
        });
      } catch (err) {
        payload.logger.error(
          { err, storyId },
          "[facebook] failed to post link as first comment"
        );
      }
    }

    return { postId };
  } catch (err) {
    if (err instanceof FacebookGraphError && err.code === 190) {
      await clearConnection(payload);
    }
    throw err;
  }
}
