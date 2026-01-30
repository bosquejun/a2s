import { Category, Mood, Status, StoryRequestStatus } from "@/lib/database/generated/prisma/client";
import { z } from "zod";

export const storySchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(30),
  excerpt: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  slug: z.string().slugify().min(1),
  mood: z.enum(Object.values(Mood)),
  categories: z.array(z.enum(Object.values(Category))).min(1).max(3),
  tags: z.array(z.string()).min(1).max(5),
  intensity: z.number().min(1).max(5),
  seo: z.object({
    title: z.string().min(1).max(30),
    description: z.string().min(1).max(155),
    keywords: z.array(z.string()).min(1).max(5),
    image: z.string().url().optional(),
  }),
  status: z.enum(Object.values(Status)).default(Status.PENDING),
  author: z.string().min(1).max(100),
  publishedAt: z.date().optional(),
  readTime: z.number().min(1).max(100),
  wordCount: z.number().min(1).max(10000),
  createdAt: z.date(),
  updatedAt: z.date(),
});


export const storyRequestSchema = z.object({
  id: z.string(),
  content: z.string()
    .max(10000)
    .refine(
      str => str.trim().split(/\s+/).length >= 10,
      { message: "Content must be at least 10 words." }
    ),
  author: z.string().min(1).max(100),
  status: z.enum(Object.values(StoryRequestStatus)).default(StoryRequestStatus.PENDING),
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

export const writeStoryWorkflowInputSchema =  storyRequestSchema.pick({
  trackCode: true,
})

export type WriteStoryWorkflowInput = z.infer<typeof writeStoryWorkflowInputSchema>;

export const createStorySchema = storySchema.pick({
    title: true,
    content: true,
    slug: true,
    mood: true,
    categories: true,
    tags: true,
    intensity: true,
    seo: true,
    author: true,
});


export const nightEditorAgentOutputSchema = createStorySchema.omit({
    slug:true,
    seo:true,
    content:true,
}).extend({
  excerpt: storySchema.shape.excerpt,
  approved: z.boolean(),
  notes: z.string(),
  htmlBody: z.string().describe("HTML formatted body"),
  readTime: z.number().describe("Estimated read time in minutes"),
  wordCount: z.number().describe("Estimated word count"),
  seo: createStorySchema.shape.seo.omit({
    image:true
  })
})

export const nightWriterStoryWorkflowOutputSchema = nightEditorAgentOutputSchema.omit({
  approved:true,
  notes:true,
})

export type Story = z.infer<typeof storySchema>;
export type CreateStoryData = z.infer<typeof createStorySchema>
export type NightEditorAgentOutput = z.infer<typeof nightEditorAgentOutputSchema>
export type WriteStoryWorkflowOutput = z.infer<typeof writeStoryWorkflowOutputSchema>