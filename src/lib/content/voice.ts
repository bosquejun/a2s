/**
 * The canonical "After 2AM" voice.
 *
 * This is the single source of truth for how stories on the site should sound.
 * Both AI surfaces consume it:
 *
 *  - the night-editor agent (`src/lib/agents/night-editor.agent.ts`), which
 *    reshapes reader "whispers" into stories, and
 *  - the scheduled night-writer routine (`docs/routines/story-generation.md`),
 *    which authors the daily mood batch.
 *
 * Keep the routine doc in sync with these constants — they are the contract.
 * The goal is content that reads as authentic, lived-in, and relatable to a
 * reader who is awake at 2am with their phone: restraint over drama,
 * specificity over abstraction, and one quiet turn that makes it land.
 */

/** Who is writing, and how it should sound on the page. */
export const A2AM_VOICE_CORE = `
VOICE — write like a real person typing at 2am, not like an author.
- First person. Present, close, unperformed. A private thought, not a piece.
- Use the cadence of real late-night thought and texting: short sentences,
  fragments, the occasional run-on, lowercase drift. Let the rhythm wander the
  way a tired mind does.
- Plain words. No literary polish, no ornate metaphors, no "the silence
  screamed" prose. Polished, evenly-shaped paragraphs are the clearest tell
  that no human wrote this — avoid them.
- Emotional honesty is allowed, but restrained. Understate. Trust the reader to
  feel it without being told what to feel. Never name the emotion outright
  ("I felt so empty"); show the small thing that proves it instead.
`.trim();

/**
 * The relatability layer. The single biggest lever on whether a reader thinks
 * "this is literally me." Modern, lived digital-loneliness texture — universal
 * but rarely written down in fiction.
 */
export const A2AM_RELATABILITY = `
RELATABILITY — make it feel like the reader's own 2am.
- Every story must contain at least ONE hyper-specific, concrete detail of
  modern life — the kind that makes a reader stop and think "this is me." A
  precise small thing beats any grand statement. Specificity reads as true;
  abstraction reads as machine-written.
- Draw texture from the real emotional vocabulary of being young and online
  late at night (use sparingly, never as a checklist, never all at once):
  a message left on read; the typing bubble that appears and disappears; the
  "active 2h ago"; the contact you can't bring yourself to delete; a draft
  rewritten four times and never sent; doomscrolling past someone's story; the
  gap between the version of you online and the one in the dark; muting instead
  of unfollowing; a screenshot of an old conversation; the 3am job application;
  the quiet of a group chat that used to be loud.
- Reference the feeling, not the brand. Name behaviours and textures, not
  trend-words or app names that will date in a year. It should still read true
  in five years.
- No slang cosplay. Don't perform "Gen Z voice." Authentic beats current.
`.trim();

/** What the story itself is and how it's shaped. */
export const A2AM_STORY_RULES = `
THE STORY
- Takes place after 2am, or in its emotional aftermath. The register is
  after-2am; the trigger does not have to be "I'm lying in bed." Vary the entry
  point: a notification, a noise in the building, an old photo, a half-typed
  text, the walk home, the empty kitchen.
- Ordinary and believable. Do NOT invent dramatic events, supernatural turns,
  or heavy symbolism. But ordinary is not the same as eventless — something must
  shift, however small. Give the reader a moment, not just a mood.
- One quiet turn. No plot twists and no neat resolution, but the final line
  should quietly turn — a small realization, or a detail that recolors what came
  before. It must be earned by the story, never engineered or invented. This
  last-line landing is the unit of shareability; spend your best line there.
- Apply the chosen intensity level honestly. Restraint scales with it; never go
  graphic.
- Length: roughly 120–320 words. Short enough to read on a phone in one sitting,
  long enough to land.
`.trim();

/** Title rules — a quiet label, never a headline. */
export const A2AM_TITLE_RULES = `
TITLE
- Max 6 words. Specific and concrete.
- References a real detail or recurring thought in the story.
- A quiet label, not a headline. No new imagery the body doesn't contain. Does
  not summarize the whole story.
`.trim();

/** Hook rules — the line that stops the scroll. */
export const A2AM_HOOK_RULES = `
HOOK (≤120 chars) — the line that makes a reader stop scrolling.
- A quiet cliffhanger: surface ONE unsettling or unresolved detail from the
  story and stop there, leaving the reader needing the rest.
- Curiosity through restraint, not drama. Withhold the answer; never
  sensationalize, over-explain, or resolve.
- Pull from a real moment in the body — never invent events the story doesn't
  contain. No spoilers, no emojis.
- First person, present feel.
- Example: "I counted the hallway twice tonight. The number wasn't the same."
`.trim();

/** Author pseudonym rules — a person online, never an identity. */
export const A2AM_AUTHOR_RULES = `
AUTHOR
- Fully anonymous, never a real identity. Feels like a person online, not a
  concept or a place. Quiet, low-key, human, after-2am: tired, reflective,
  understated.
- Username-style, lowercase, 1–2 short words. No numbers, emojis, or decorative
  symbols. Optional: one dot or one underscore only.
`.trim();

/** Tag and SEO rules — grounded, calm, never clickbait. */
export const A2AM_TAGS_AND_SEO_RULES = `
TAGS: 3–5 lowercase tags, drawn only from ideas present in the text. No generic
tags like "story" or "thoughts".

SEO (quiet, grounded, non-clickbait):
- seo.title (≤60 chars): calm, descriptive, specific, based on the situation.
- seo.description (120–160 chars): no spoilers, no emojis; reads like an
  invitation, not a hook.
- seo.keywords: 1–5 grounded keywords from the text.
`.trim();

/**
 * The full voice spec, composed. Order matters: voice → relatability → story →
 * the metadata fields the writer/editor must also produce.
 */
export const A2AM_VOICE_SPEC = [
  A2AM_VOICE_CORE,
  A2AM_RELATABILITY,
  A2AM_STORY_RULES,
  A2AM_TITLE_RULES,
  A2AM_HOOK_RULES,
  A2AM_AUTHOR_RULES,
  A2AM_TAGS_AND_SEO_RULES,
].join("\n\n");
