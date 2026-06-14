import { z } from "zod";

/**
 * Payload sent to the social-publish workflow (`api/social/publish`) when a
 * story is published. Only the fields needed to compose a post — the workflow
 * re-reads nothing else, so the message is stable even if the story is later
 * edited.
 */
export const socialPublishWorkflowInputSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  hook: z.string().nullish(),
  excerpt: z.string().nullish(),
});

export type SocialPublishWorkflowInput = z.infer<
  typeof socialPublishWorkflowInputSchema
>;
