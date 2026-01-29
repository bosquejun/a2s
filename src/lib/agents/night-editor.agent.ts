import { Category, Mood } from '@/lib/database/generated/prisma/enums';
import { nightEditorAgentOutputSchema } from '@/validations/story.validation';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { Output, ToolLoopAgent } from 'ai';
import z from 'zod';

export const nightEditorAgent = new ToolLoopAgent({
  model: openrouter('@preset/a2s-models'),
  output: Output.object({
    schema: nightEditorAgentOutputSchema
  })
});


export const createUserPrompt = (data: {content: string}) => {
  return `
  Evaluate the following story for the “after 2am stories” website.

CORE RULES
- Preserve the author’s voice.
- Do NOT invent events, symbols, or imagery.
- All metadata must be directly grounded in the story text.

TASKS:

1. Generate a TITLE:
   - Max 6 words
   - Must be specific and concrete
   - Must reference a real detail, action, or recurring thought in the story
   - Must NOT summarize the entire story
   - Must NOT introduce new imagery, characters, or metaphors
   - Should feel like a quiet label, not a headline

2. Assign ONE mood from:
   ${Object.values(Mood).join(', ')}

3. Assign up to 2 categories from:
   ${Object.values(Category).join(', ')}

4. Generate 3–5 lowercase tags:
   - Derived only from ideas present in the text
   - No generic tags like “story” or “thoughts”

5. Assign an intensity level from 1 to 5:
   1 = cozy / calming
   2 = melancholic
   3 = emotionally heavy but grounded
   4 = unsettling
   5 = intense but non-graphic

6. Decide if the story is approved for publishing.

SEO METADATA (quiet, grounded, non-clickbait):

7. Generate an SEO title (max 60 characters):
   - Based on the story’s core situation
   - Calm, descriptive, specific
   - No sensational language

8. Generate an SEO description (120–160 characters):
   - No spoilers
   - No emojis
   - Reads like an invitation, not a hook

9. Generate an SEO slug:
   - lowercase
   - kebab-case
   - derived from the TITLE
   - remove filler words where possible

10. Format the story to HTML:
   - Convert content body to HTML with <p> tags for paragraphs and <br /> tags for line breaks
   - Fill in htmlBody field with the HTML formatted body

11. Generate excerpt:
   - 100 characters
   - No spoilers
   - No emojis
   - Reads like an invitation, not a hook

12. Generate author:
   - Fully anonymous, never a real identity
   - Must feel like a person online, not a concept or location
   - Quiet, low‑key, human presence
   - After‑2am mood: tired, reflective, understated
   - Username‑style
   - Lowercase only
   - 1–2 short words
   - No numbers, emojis, or decorative symbols
   - Optional: one dot or one underscore only

If the story is NOT approved:
- Set approved to false
- Provide a short, gentle note
- Suggest ONE safe rewrite direction
- Do NOT mention policy or rules
- Do NOT complete data in the JSON output schema

STORY:
"""
{{${data.content}}}
"""

JSON OUTPUT SCHEMA:
${z.toJSONSchema(nightEditorAgentOutputSchema)}
  `
}