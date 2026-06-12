import {
  createUserPrompt,
  nightEditorAgent,
} from "@/lib/agents/night-editor.agent";
import { StoryRequestStatus } from "@/lib/content/taxonomy";
import { getPayloadClient } from "@/lib/payload";
import { ingestStory } from "@/lib/services/stories/ingest-story";
import {
  WriteStoryWorkflowInput,
  writeStoryWorkflowInputSchema,
} from "@/validations/story.validation";
import { WorkflowNonRetryableError } from "@upstash/workflow";
import { serve } from "@upstash/workflow/nextjs";

type StoryRequestDoc = {
  id: string | number;
  content: string;
  status: string;
};

/**
 * Reader submission ("whisper") review. Per product decision these go through
 * editorial review: the night-editor agent evaluates the submission, and an
 * approved story is created as a DRAFT in Payload for a human to publish.
 */
export const { POST } = serve<WriteStoryWorkflowInput>(
  async (context) => {
    const { trackCode } = context.requestPayload;

    const storyRequest = await context.run("get-story-request", async () => {
      const payload = await getPayloadClient();
      const { docs } = await payload.find({
        collection: "story-requests",
        where: { trackCode: { equals: trackCode } },
        limit: 1,
      });
      return (docs[0] as StoryRequestDoc | undefined) ?? null;
    });

    if (!storyRequest) {
      throw new WorkflowNonRetryableError("Story request not found");
    }

    if (storyRequest.status !== StoryRequestStatus.PENDING) {
      throw new WorkflowNonRetryableError("Story request is not pending");
    }

    const agentResponse = await context.run("night-editor-agent", async () => {
      const { output } = await nightEditorAgent.generate({
        prompt: createUserPrompt({ content: storyRequest.content }),
      });
      return output;
    });

    const response = await context.run("update-record", async () => {
      const payload = await getPayloadClient();

      if (agentResponse.approved) {
        const story = await ingestStory(
          {
            title: agentResponse.title,
            htmlBody: agentResponse.htmlBody || "",
            excerpt: agentResponse.excerpt || "",
            hook: agentResponse.hook,
            author: agentResponse.author,
            mood: agentResponse.mood,
            categories: agentResponse.categories,
            tags: agentResponse.tags,
            intensity: agentResponse.intensity,
            seo: agentResponse.seo,
            notes: agentResponse.notes,
            storyRequestId: storyRequest.id,
          },
          { publish: false } // draft → awaits human review in /admin
        );

        await payload.update({
          collection: "story-requests",
          id: storyRequest.id,
          data: {
            status: StoryRequestStatus.APPROVED,
            approvedAt: new Date().toISOString(),
            notes: agentResponse.notes,
            story: story.id,
          },
        });

        return {
          success: true,
          message: "Story drafted for review",
          slug: story.slug as string,
        };
      }

      await payload.update({
        collection: "story-requests",
        id: storyRequest.id,
        data: {
          status: StoryRequestStatus.REJECTED,
          notes: agentResponse.notes,
        },
      });

      return { success: false, message: "Story rejected", slug: null };
    });

    return response;
  },
  {
    initialPayloadParser(initialPayload) {
      return writeStoryWorkflowInputSchema.parse(JSON.parse(initialPayload));
    },
  }
);
