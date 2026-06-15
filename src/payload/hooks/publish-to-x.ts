import type { CollectionAfterChangeHook } from "payload";

import { shareStory } from "@/lib/services/x/share-story";

/**
 * Auto-post a story to the connected X account the moment it transitions to
 * published, when auto-posting is enabled and it hasn't been shared yet. The
 * post is fire-and-forget: an API failure is logged but never blocks saving the
 * story, and the `xPostId` guard prevents duplicate posts on re-saves.
 */
export const publishToX: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipXAutoPost) return doc;

  const becamePublished =
    doc?._status === "published" && previousDoc?._status !== "published";
  if (!becamePublished) return doc;
  if (!doc?.autoPostToX) return doc;
  if (doc?.xPostId) return doc;

  void shareStory(req.payload, doc.id).catch((err) => {
    req.payload.logger.error({ err }, "[x] auto-post on publish failed");
  });

  return doc;
};
