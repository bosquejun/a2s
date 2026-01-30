// import { CreateStoryInput, createStoryInputSchema } from "@/validations/story.validation"
import {
  createUserPrompt,
  nightEditorAgent,
} from "@/lib/agents/night-editor.agent";
import { StoryRequestStatus } from "@/lib/database/generated/prisma/client";
import prisma from "@/lib/database/prisma";
import {
  WriteStoryWorkflowInput,
  writeStoryWorkflowInputSchema,
} from "@/validations/story.validation";
import { WorkflowNonRetryableError } from "@upstash/workflow";
import { serve } from "@upstash/workflow/nextjs";
import { revalidateTag } from "next/cache";
import slugify from "slugify";

export const { POST } = serve<WriteStoryWorkflowInput>(
  async (context) => {
    const { trackCode } = context.requestPayload;

    const storyRequest = await context.run("get-story-request", async () => {
      return await prisma.storyRequest.findUnique({
        where: {
          trackCode,
        },
      });
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
      return await prisma.$transaction(async (tx) => {
        if (agentResponse.approved) {
          await tx.storyRequest.update({
            where: { id: storyRequest.id },
            data: {
              status: StoryRequestStatus.APPROVED,
              approvedAt: new Date(),
            },
          });

          const storySlug = slugify(agentResponse.title, {
            lower: true,
            strict: true,
            locale: "en",
          });

          const story = await prisma.story.create({
            data: {
              content: agentResponse.htmlBody || "",
              excerpt: agentResponse.excerpt || "",
              title: agentResponse.title,
              slug: storySlug,
              mood: agentResponse.mood,
              categories: agentResponse.categories,
              tags: agentResponse.tags,
              intensity: agentResponse.intensity,
              seo: agentResponse.seo,
              publishedAt: agentResponse.approved ? new Date() : null,
              notes: agentResponse.notes,
              readTime: agentResponse.readTime,
              wordCount: agentResponse.wordCount,
              author: agentResponse.author,
              storyRequestId: storyRequest.id,
            },
          });

          return { success: true, message: "Story saved successfully", story };
        } else {
          await tx.storyRequest.update({
            where: { id: storyRequest.id },
            data: {
              status: StoryRequestStatus.REJECTED,
              notes: agentResponse.notes,
            },
          });

          return { success: false, message: "Story rejected", story: null };
        }
      });
    });

    if (response.success) {
      await context.run("invalidate-cache", async () => {
        revalidateTag("stories", "max");
        revalidateTag("stories-list", "max");
        if (response.story) {
          revalidateTag(`story-${response.story.slug}`, "max");
          revalidateTag(`stories-mood-${response.story.mood}`, "max");
        }
      });
    }

    return response;
  },
  {
    initialPayloadParser(initialPayload) {
      return writeStoryWorkflowInputSchema.parse(JSON.parse(initialPayload));
    },
  }
);
