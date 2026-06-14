import {
  A2AM_AUTHOR_RULES,
  A2AM_HOOK_RULES,
  A2AM_RELATABILITY,
  A2AM_TAGS_AND_SEO_RULES,
  A2AM_TITLE_RULES,
  A2AM_VOICE_CORE,
} from "@/lib/content/voice";
import { Category, Mood } from "@/lib/content/taxonomy";
import { nightEditorAgentOutputSchema } from "@/validations/story.validation";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { Output, ToolLoopAgent } from "ai";
import z from "zod";

export const nightEditorAgent = new ToolLoopAgent({
  model: openrouter("@preset/a2s-models"),
  output: Output.object({
    schema: nightEditorAgentOutputSchema,
  }),
});

export const createUserPrompt = (data: { content: string }) => {
  return `
Evaluate the following reader "whisper" for the After 2AM Stories website.

CORE RULES
- This is the reader's own confession. PRESERVE the author's voice and words —
  you are an editor, not a rewriter. Do NOT invent events, symbols, or imagery,
  and do NOT add details the body doesn't already contain.
- All metadata you generate must be directly grounded in the story text.

THE SITE'S VOICE (the bar this whisper is measured against, and the register
your generated title/hook/author should match):
${A2AM_VOICE_CORE}

${A2AM_RELATABILITY}

A whisper does not need to be polished, but it should read as a real, grounded
after-2am thought — honest, specific, restrained. Judge approval against that.

TASKS:

1. Generate a TITLE.
${A2AM_TITLE_RULES}

2. Assign ONE mood from:
   ${Object.values(Mood).join(", ")}

3. Assign up to 2 categories from:
   ${Object.values(Category).join(", ")}

4. Generate tags and SEO.
${A2AM_TAGS_AND_SEO_RULES}
   Also produce an SEO slug: lowercase, kebab-case, derived from the TITLE,
   filler words removed.

5. Assign an intensity level from 1 to 5:
   1 = cozy / calming
   2 = melancholic
   3 = emotionally heavy but grounded
   4 = unsettling
   5 = intense but non-graphic

6. Decide if the story is approved for publishing.

7. Format the story to HTML:
   - Convert the body to HTML with <p> tags for paragraphs and <br /> for line
     breaks. Preserve the author's wording and rhythm; do not rewrite it.
   - Fill in the htmlBody field.

8. Generate an excerpt (≤100 characters): no spoilers, no emojis; reads like an
   invitation, not a hook.

9. Generate a HOOK.
${A2AM_HOOK_RULES}

10. Generate an AUTHOR pseudonym.
${A2AM_AUTHOR_RULES}

If the story is NOT approved:
- Set approved to false
- Provide a short, gentle note
- Suggest ONE safe rewrite direction
- Do NOT mention policy or rules
- Do NOT complete the rest of the JSON output schema

STORY:
"""
{{${data.content}}}
"""

JSON OUTPUT SCHEMA:
${z.toJSONSchema(nightEditorAgentOutputSchema)}
  `;
};
