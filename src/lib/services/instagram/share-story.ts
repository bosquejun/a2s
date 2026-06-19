import "server-only";

import type { Payload } from "payload";

import { FacebookGraphError } from "@/lib/services/facebook/client";
import {
  clearConnection,
  getConnection,
} from "@/lib/services/facebook/connection";
import { buildHashtags, extractNames } from "@/lib/services/social/hashtags";
import {
  buildLinkComment,
  waitBeforeComment,
} from "@/lib/services/social/link-comment";
import { getLinkInCommentSettings } from "@/lib/services/social/settings";
import { getStoryBySlug } from "@/lib/services/stories/get-story";
import {
  commentOnMedia,
  createCarouselContainer,
  createCarouselItemContainer,
  createMediaContainer,
  publishMedia,
  waitForMediaContainer,
} from "./client";
import { planCarouselSlides, type InstagramPostFormat } from "./carousel-plan";

export type { InstagramPostFormat } from "./carousel-plan";

const LINK_IN_BIO = "Read the full story — link in bio 🔗";
const LINK_IN_COMMENTS = "Read the full story — link in comments 👇";

/** Instagram favours more hashtags for discovery than Facebook. */
const INSTAGRAM_HASHTAG_LIMIT = 10;

/**
 * Instagram captions cannot contain clickable links, so the caption leads with
 * the story's social hook (or excerpt/title), points readers to the story link,
 * and closes with taxonomy-derived hashtags for discovery.
 *
 * When the link is auto-posted as the first comment (`linkInComment`), the CTA
 * points there; otherwise it falls back to the profile bio link.
 */
export function buildInstagramCaption(
  story: {
    hook?: string | null;
    excerpt?: string | null;
    title: string;
  },
  hashtags?: string,
  options: { linkInComment?: boolean } = {}
): string {
  const lead = story.hook || story.excerpt || story.title;
  const cta = options.linkInComment ? LINK_IN_COMMENTS : LINK_IN_BIO;
  const parts = [lead, cta];
  if (hashtags) parts.push(hashtags);
  return parts.join("\n\n");
}

function siteBase(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return base.replace(/\/$/, "");
}

function igImageUrl(slug: string): string {
  return `${siteBase()}/story/${slug}/ig`;
}

function igCarouselSlideUrl(slug: string, index: number): string {
  return `${siteBase()}/story/${slug}/ig/carousel/${index}`;
}

function storyUrl(slug: string): string {
  return `${siteBase()}/story/${slug}`;
}

export interface InstagramShareResult {
  postId: string;
  alreadyShared?: boolean;
}

export interface InstagramShareOptions {
  /** "image" (default) posts the single OG card; "carousel" posts the multi-slide set. */
  format?: InstagramPostFormat;
}

/**
 * Publish a story to the connected Instagram business account: render the OG
 * image as the post media, create a media container, then publish it. The
 * `instagramPostId` guard prevents duplicate posts; an expired token (Graph
 * error 190) clears the connection so the admin is prompted to reconnect.
 */
export async function shareStoryToInstagram(
  payload: Payload,
  storyId: string | number,
  options: InstagramShareOptions = {}
): Promise<InstagramShareResult> {
  const format: InstagramPostFormat = options.format ?? "image";
  const story = await payload.findByID({
    collection: "stories",
    id: storyId,
    depth: 1,
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

  const igUserId = connection.instagramUserId;
  const pageAccessToken = connection.pageAccessToken;
  // Resolve the link-in-comment toggle up front so the caption CTA (and the
  // carousel CTA slide, rendered independently by the slide route) agree on
  // where the link lives: the first comment when enabled, the bio otherwise.
  const { instagram: linkInComment } = await getLinkInCommentSettings(payload);
  const caption = buildInstagramCaption(
    {
      hook: typeof story.hook === "string" ? story.hook : null,
      excerpt: typeof story.excerpt === "string" ? story.excerpt : null,
      title: String(story.title ?? ""),
    },
    buildHashtags(
      {
        categories: extractNames(story.categories),
        tags: extractNames(story.tags),
      },
      INSTAGRAM_HASHTAG_LIMIT
    ),
    { linkInComment }
  );

  try {
    const creationId =
      format === "carousel"
        ? await stageCarousel(igUserId, pageAccessToken, story.slug, caption)
        : await createMediaContainer({
            igUserId,
            pageAccessToken,
            imageUrl: igImageUrl(story.slug),
            caption,
          });

    const postId = await publishMedia({
      igUserId,
      pageAccessToken,
      creationId,
    });

    await payload.update({
      collection: "stories",
      id: storyId,
      data: { instagramPostId: postId },
      overrideAccess: true,
      context: { skipInstagramAutoPost: true },
    });

    // Best-effort link-in-first-comment. Instagram comments aren't clickable,
    // but the URL is still copy-pasteable, and a failed comment must never
    // undo the successful post.
    if (linkInComment && !story.instagramCommentId) {
      try {
        // Pause briefly so the comment doesn't land the same instant as the
        // post, which reads as automation.
        await waitBeforeComment();
        const commentId = await commentOnMedia({
          mediaId: postId,
          pageAccessToken: connection.pageAccessToken,
          message: buildLinkComment(storyUrl(story.slug)),
        });
        await payload.update({
          collection: "stories",
          id: storyId,
          data: { instagramCommentId: commentId },
          overrideAccess: true,
          context: { skipInstagramAutoPost: true },
        });
      } catch (err) {
        payload.logger.error(
          { err, storyId },
          "[instagram] failed to post link as first comment"
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

/**
 * Stage every carousel slide as a child container, then assemble the parent
 * carousel container. The slide count comes from the same plan the image route
 * renders, so each child URL resolves to a real slide. Returns the parent
 * creation id ready to publish.
 *
 * Instagram fetches each slide image asynchronously, so we wait for every child
 * to finish processing before nesting it, and for the parent to finish before
 * returning — publishing too early is what triggers "Media ID is not available".
 */
async function stageCarousel(
  igUserId: string,
  pageAccessToken: string,
  slug: string,
  caption: string
): Promise<string> {
  const normalized = await getStoryBySlug(slug);
  if (!normalized) throw new Error("Story not found for carousel rendering");
  const slides = planCarouselSlides(normalized);

  const children: string[] = [];
  for (let i = 0; i < slides.length; i++) {
    const childId = await createCarouselItemContainer({
      igUserId,
      pageAccessToken,
      imageUrl: igCarouselSlideUrl(slug, i),
    });
    await waitForMediaContainer({ creationId: childId, pageAccessToken });
    children.push(childId);
  }

  const parentId = await createCarouselContainer({
    igUserId,
    pageAccessToken,
    children,
    caption,
  });
  await waitForMediaContainer({ creationId: parentId, pageAccessToken });
  return parentId;
}
