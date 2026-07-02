import type { CollectionAfterChangeHook } from "payload";

import { shareStory as shareStoryToFacebook } from "@/lib/services/facebook/share-story";
import { shareStoryToInstagram } from "@/lib/services/instagram/share-story";
import { shareStoryToThreads } from "@/lib/services/threads/share-story";
import { shareStory as shareStoryToX } from "@/lib/services/x/share-story";
import { featureFlags } from "@/lib/feature-flags";
import {
  jitterDelayMs,
  nextNightWindowPostAt,
} from "@/lib/services/social/schedule";
import { triggerWorkflow } from "@/lib/workflow-client/client";

type Platform = "facebook" | "instagram" | "threads" | "x";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Auto-post a story to the connected social accounts when it transitions to
 * published. Two flavours, keyed off the create context:
 *
 * - Automated routine batch (`context.scheduleSocialForNightWindow`): defer the
 *   posts to a human-uneven slot inside the 2–4am (Asia/Manila) window via the
 *   social-post workflow, so a freshly generated batch doesn't fire all at once
 *   like a bot.
 * - Manual publish (Payload admin): post right away, with a small per-story
 *   jitter so several stories published together don't hit the APIs at the same
 *   instant.
 *
 * Either way it's fire-and-forget — a failure is logged but never blocks
 * saving — and the per-platform `*PostId` guards prevent duplicate posts on
 * re-saves. Only platforms that are enabled and not yet posted are included.
 */
export const scheduleSocialPosts: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipSocialAutoPost) return doc;

  const becamePublished =
    doc?._status === "published" && previousDoc?._status !== "published";
  if (!becamePublished) return doc;

  const platforms: Platform[] = [];
  if (doc.autoPostToFacebook && !doc.facebookPostId) platforms.push("facebook");
  if (doc.autoPostToInstagram && !doc.instagramPostId)
    platforms.push("instagram");
  if (doc.autoPostToThreads && !doc.threadsPostId) platforms.push("threads");
  if (featureFlags.xPosting && doc.autoPostToX && !doc.xPostId)
    platforms.push("x");
  if (platforms.length === 0) return doc;

  if (context?.scheduleSocialForNightWindow) {
    const postAt = nextNightWindowPostAt();
    void triggerWorkflow(
      "socialPost",
      { storyId: doc.id, postAt: postAt.toISOString(), platforms },
      { key: "social-post-workflow", rate: 50, period: "1m", parallelism: 10 }
    ).catch((err) => {
      req.payload.logger.error(
        { err, storyId: doc.id },
        "[social] failed to schedule night-window posts"
      );
    });
    return doc;
  }

  // Manual publish: post now, after one small per-story delay so a burst of
  // simultaneous publishes doesn't all land on the same second.
  const delay = jitterDelayMs();
  const share = async (platform: Platform) => {
    await sleep(delay);
    if (platform === "facebook")
      return shareStoryToFacebook(req.payload, doc.id);
    if (platform === "instagram")
      return shareStoryToInstagram(req.payload, doc.id);
    if (platform === "threads") return shareStoryToThreads(req.payload, doc.id);
    return shareStoryToX(req.payload, doc.id);
  };
  for (const platform of platforms) {
    void share(platform).catch((err) => {
      req.payload.logger.error(
        { err, storyId: doc.id, platform },
        "[social] auto-post on publish failed"
      );
    });
  }

  return doc;
};
