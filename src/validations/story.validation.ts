import { z } from "zod";
import {
  Category,
  Mood,
  StoryRequestStatus,
} from "@/lib/content/taxonomy";

export const storyRequestSchema = z.object({
  id: z.string(),
  content: z
    .string()
    .max(10000)
    .refine((str) => str.trim().split(/\s+/).length >= 10, {
      message: "Content must be at least 10 words.",
    }),
  author: z.string().min(1).max(100).optional(),
  status: z
    .enum(Object.values(StoryRequestStatus))
    .default(StoryRequestStatus.PENDING),
  notes: z.string().optional(),
  trackCode: z.string().min(1).max(100),
  approvedAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createStoryRequestSchema = storyRequestSchema.pick({
  content: true,
});
export type CreateStoryRequestInput = z.infer<typeof createStoryRequestSchema>;

export const writeStoryWorkflowInputSchema = storyRequestSchema.pick({
  trackCode: true,
});
export type WriteStoryWorkflowInput = z.infer<
  typeof writeStoryWorkflowInputSchema
>;

export const generateStoryWorkflowInputSchema = z.object({
  mood: z.enum(Object.values(Mood)),
  category: z.enum(Object.values(Category)),
  intensity: z.number().min(1).max(5).default(3).optional(),
});
export type GenerateStoryWorkflowInput = z.infer<
  typeof generateStoryWorkflowInputSchema
>;

const seoSchema = z.object({
  title: z.string().min(1).max(60),
  description: z.string().min(1).max(160),
  keywords: z.array(z.string()).min(1).max(5),
});

/** Structured output produced by the night-editor agent (reviewing a whisper). */
export const nightEditorAgentOutputSchema = z.object({
  title: z.string().min(1).max(60),
  excerpt: z.string().min(1).max(160),
  hook: z
    .string()
    .min(1)
    .max(120)
    .describe(
      "A quiet cliffhanger that hooks the reader: surface one unsettling or " +
        "unresolved detail from the story and stop there, creating curiosity " +
        "through restraint (no drama, no invented events, no clean resolution)."
    ),
  mood: z.enum(Object.values(Mood)),
  categories: z.array(z.enum(Object.values(Category))).min(1).max(3),
  tags: z.array(z.string()).min(1).max(5),
  intensity: z.number().min(1).max(5),
  author: z.string().min(1).max(100),
  approved: z.boolean(),
  notes: z.string(),
  htmlBody: z.string().describe("HTML formatted body"),
  readTime: z.number().describe("Estimated read time in minutes"),
  wordCount: z.number().describe("Estimated word count"),
  seo: seoSchema,
});
export type NightEditorAgentOutput = z.infer<
  typeof nightEditorAgentOutputSchema
>;

/** Structured output produced by the night-writer agent (mood generation). */
export const nightWriterStoryWorkflowOutputSchema =
  nightEditorAgentOutputSchema.omit({
    approved: true,
    notes: true,
  });
export type WriteStoryWorkflowOutput = z.infer<
  typeof nightWriterStoryWorkflowOutputSchema
>;
