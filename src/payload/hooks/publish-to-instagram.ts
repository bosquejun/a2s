import type { CollectionAfterChangeHook } from "payload";

import { shareStoryToInstagram } from "@/lib/services/instagram/share-story";

/**
 * Auto-post a story to the connected Instagram account the moment it
 * transitions to published, when auto-posting is enabled and it hasn't been
 * shared yet. Fire-and-forget: a Graph failure is logged but never blocks
 * saving, and the `instagramPostId` guard prevents duplicate posts.
 */
export const publishToInstagram: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipInstagramAutoPost) return doc;

  const becamePublished =
    doc?._status === "published" && previousDoc?._status !== "published";
  if (!becamePublished) return doc;
  if (!doc?.autoPostToInstagram) return doc;
  if (doc?.instagramPostId) return doc;

  void shareStoryToInstagram(req.payload, doc.id).catch((err) => {
    req.payload.logger.error(
      { err },
      "[instagram] auto-post on publish failed"
    );
  });

  return doc;
};
