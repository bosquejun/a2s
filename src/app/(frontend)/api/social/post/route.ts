import { serve } from "@upstash/workflow/nextjs";

import { getPayloadClient } from "@/lib/payload";
import { shareStory as shareStoryToFacebook } from "@/lib/services/facebook/share-story";
import { shareStoryToInstagram } from "@/lib/services/instagram/share-story";
import { shareStory as shareStoryToX } from "@/lib/services/x/share-story";
import {
  socialPostWorkflowInputSchema,
  type SocialPostWorkflowInput,
} from "@/validations/story.validation";

/**
 * Deferred social posting for automated (routine-published) stories. The
 * publish hook hands us a `postAt` somewhere inside the 2–4am (Asia/Manila)
 * window; we sleep until then so a freshly generated batch trickles out over
 * the small hours instead of firing all at once like a bot. All enabled
 * platforms for a story go out together (we stagger stories, not platforms),
 * and each post is best-effort: a platform failure is logged, never retried
 * forever, and never blocks the others.
 */
export const { POST } = serve<SocialPostWorkflowInput>(
  async (context) => {
    const { storyId, postAt, platforms } = context.requestPayload;

    await context.sleepUntil("wait-for-night-window", new Date(postAt));

    for (const platform of platforms) {
      await context.run(`post-${platform}`, async () => {
        const payload = await getPayloadClient();
        try {
          if (platform === "facebook") {
            await shareStoryToFacebook(payload, storyId);
          } else if (platform === "instagram") {
            await shareStoryToInstagram(payload, storyId);
          } else {
            await shareStoryToX(payload, storyId);
          }
          return { platform, ok: true };
        } catch (err) {
          payload.logger.error(
            { err, storyId, platform },
            "[social] scheduled night-window post failed"
          );
          return { platform, ok: false };
        }
      });
    }

    return { storyId, posted: platforms };
  },
  {
    initialPayloadParser(initialPayload) {
      return socialPostWorkflowInputSchema.parse(JSON.parse(initialPayload));
    },
  }
);
