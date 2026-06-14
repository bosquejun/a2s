import { publishStoryToFacebook } from "@/lib/social/facebook";
import {
  socialPublishWorkflowInputSchema,
  type SocialPublishWorkflowInput,
} from "@/validations/social.validation";
import { serve } from "@upstash/workflow/nextjs";

/**
 * Durable social cross-post, run by QStash when a story is published (triggered
 * from the `socialPublish` collection hook). Each platform is its own
 * `context.run` step so QStash retries it independently with backoff — a
 * transient Facebook outage is retried rather than lost, and adding more
 * platforms later means adding steps here.
 */
export const { POST } = serve<SocialPublishWorkflowInput>(
  async (context) => {
    const { title, slug, hook, excerpt } = context.requestPayload;

    const facebookPostId = await context.run("post-to-facebook", async () => {
      return publishStoryToFacebook({ title, slug, hook, excerpt });
    });

    return { facebookPostId };
  },
  {
    initialPayloadParser(initialPayload) {
      return socialPublishWorkflowInputSchema.parse(JSON.parse(initialPayload));
    },
  }
);
