import { Category, Mood } from '@/lib/database/generated/prisma/enums';
import { nightWriterStoryWorkflowOutputSchema } from '@/validations/story.validation';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { Output, ToolLoopAgent } from 'ai';
import z from 'zod';

export const nightWriterAgent = new ToolLoopAgent({
  model: openrouter('@preset/a2s-story-telling-models'),
  output: Output.object({
    schema: nightWriterStoryWorkflowOutputSchema
  })
});


export const createUserPrompt = (data: {content: string, mood: Mood, category: Category, intensity: number}) => {
  return `
  Write a short after‑2am story using the inputs below and return the result in structured JSON.
Inputs
Mood: ${data.mood}
Category: ${data.category}
Intensity: ${data.intensity}
CORE PRINCIPLES
Write like a real person typing late at night.
Keep the voice human, quiet, and grounded.
Do NOT invent dramatic events, symbols, or metaphors.
Everything must feel ordinary and believable.
Apply the following intensity level to the story:
1 = cozy / calming
2 = melancholic
3 = emotionally heavy but grounded
4 = unsettling
5 = intense but non‑graphic
TASKS:
Write the STORY:
First‑person perspective
Takes place after 2am
Ordinary setting (room, phone glow, silence, stillness)
Feels like a private thought or confession
Emotional honesty is allowed, but restrained
No dramatic twists or clean resolution
Length: 120–250 words
Generate a TITLE:
Max 6 words
Specific and concrete
References a real detail or recurring thought in the story
Quiet label, not a headline
No new imagery or concepts
Generate 3–5 lowercase tags:
Directly grounded in the story text
No generic tags
SEO METADATA (quiet, grounded):
Generate an SEO title (max 60 characters):
Calm, descriptive, specific
Based on the story’s situation
Generate an SEO description (120–160 characters):
No spoilers
Reads like an invitation
Generate an SEO slug:
lowercase
kebab‑case
derived from the TITLE
Format the story to HTML:
Use <p> for paragraphs
Use <br /> for line breaks
Generate excerpt:
100 characters
No spoilers
Invitation‑like, not a hook
Generate author:
Fully anonymous username
Feels like a quiet person online
After‑2am mood: tired, reflective
Lowercase, 1–2 short words
No numbers or emojis
Optional: one dot or one underscore
OUTPUT RULES
Output STRICT JSON only
Match the provided JSON schema exactly
No commentary, no markdown, no extra text
STORY:
{{${data.content}}}

JSON OUTPUT SCHEMA:
${z.toJSONSchema(nightWriterStoryWorkflowOutputSchema)}
  `
}