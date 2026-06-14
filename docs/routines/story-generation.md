# Story Generation Routine

This is the prompt for a scheduled `/schedule` Claude routine that authors a
small daily batch of "After 2AM" stories and publishes them to the live site
through the ingest endpoint. Stories must conform exactly to the schema below —
the endpoint rejects anything off-shape.

> The **voice rules** below mirror the canonical spec in
> `src/lib/content/voice.ts` (`A2AM_VOICE_SPEC`), which the night-editor agent
> also consumes. If you change the voice, change it there first and copy it
> here so the two stay in sync.

**Run environment provides:**
- `{SITE}` — production base URL (e.g. `https://after2am.example.com`)
- `STORY_GENERATION_SECRET` — bearer token for the ingest endpoint

---

## What to do each run

1. **Survey recent stories (for variety).**
   `GET {SITE}/payload-api/stories?sort=-publishedAt&limit=20&depth=0`
   Note the recent `mood` and `categories` values and titles.

2. **Survey what's actually landing (engagement feedback).**
   `GET {SITE}/payload-api/stories?sort=-viewCount&limit=15&depth=0`
   This is the most-read set. Look across it for what is *working*:
   - which `mood` × `categories` pairs and `intensity` levels recur, and
   - what kinds of openings, situations, and concrete details these stories
     share (read a few bodies, not just the metadata).
   Treat this as a signal to lean into — bias the batch toward the textures and
   tones readers finish, **without** copying premises or titles. Discount any
   story whose high count looks like an outlier (e.g. one that was shared
   externally) rather than a repeatable pattern.

3. **Choose 3–5 distinct combinations.** Pick mood × category pairs that are
   *not* heavily represented in the recent list (step 1), weighted toward what
   performs (step 2). Vary intensity across the batch. Vary the *entry point*
   too (see voice rules) so the batch doesn't all open the same way. Avoid
   repeating recent titles or premises.

4. **Write each story** following the voice rules and output schema below.

5. **Publish each story:**
   `POST {SITE}/api/stories/ingest`
   Headers: `Authorization: Bearer {STORY_GENERATION_SECRET}`, `Content-Type: application/json`
   Body: the JSON object described in **Output schema**.
   - `201` → published (record the returned `slug`)
   - `409` → a story with that slug already exists; skip it
   - `400` → schema/validation error; read the message, fix the body, retry once
   - other → treat as failure, record and continue

6. **Report:** list created slugs and any skipped (409) or failed stories with
   reasons. Note which engagement signals (step 2) you leaned into this run.

---

## Allowed taxonomy (use these exact values)

**mood** (exactly one): `CANT_SLEEP`, `DARK`, `MISS_SOMEONE`, `EMPTY`, `REFLECTIVE`, `UNSETTLING`

**categories** (1–3 of): `HORROR`, `CONFESSION`, `ROMANCE`, `EXISTENTIAL`, `SURREAL`

**intensity** (1–5):
- 1 = cozy / calming
- 2 = melancholic
- 3 = emotionally heavy but grounded
- 4 = unsettling
- 5 = intense but non-graphic

---

## Voice rules

**Write like a real person typing at 2am, not like an author.**
- First person. Present, close, unperformed. A private thought, not a piece.
- Use the cadence of real late-night thought and texting: short sentences,
  fragments, the occasional run-on, lowercase drift. Let the rhythm wander the
  way a tired mind does.
- Plain words. No literary polish, no ornate metaphors, no "the silence
  screamed" prose. Polished, evenly-shaped paragraphs are the clearest tell that
  no human wrote this — avoid them.
- Emotional honesty is allowed, but restrained. Understate. Never name the
  emotion outright ("I felt so empty"); show the small thing that proves it.

**Relatability — make it feel like the reader's own 2am.**
- Every story must contain at least ONE hyper-specific, concrete detail of
  modern life — the kind that makes a reader think "this is me." A precise small
  thing beats any grand statement. Specificity reads as true; abstraction reads
  as machine-written.
- Draw texture from the real emotional vocabulary of being young and online late
  at night (use sparingly, never as a checklist, never all at once): a message
  left on read; the typing bubble that appears and disappears; the "active 2h
  ago"; the contact you can't bring yourself to delete; a draft rewritten four
  times and never sent; doomscrolling past someone's story; the gap between the
  version of you online and the one in the dark; muting instead of unfollowing;
  a screenshot of an old conversation; the 3am job application; the quiet of a
  group chat that used to be loud.
- Reference the feeling, not the brand. Name behaviours and textures, not
  trend-words or app names that will date in a year. No slang cosplay — don't
  perform "Gen Z voice." Authentic beats current.

**The STORY:**
- Takes place after 2am, or in its emotional aftermath. The register is
  after-2am; the trigger does NOT have to be "I'm lying in bed." Vary the entry
  point across the batch: a notification, a noise in the building, an old photo,
  a half-typed text, the walk home, the empty kitchen.
- Ordinary and believable. Do NOT invent dramatic events, supernatural turns, or
  heavy symbolism. But ordinary is not the same as eventless — something must
  shift, however small. Give the reader a moment, not just a mood.
- **One quiet turn.** No plot twists and no neat resolution, but the final line
  should quietly turn — a small realization, or a detail that recolors what came
  before. Earned by the story, never engineered or invented. This last-line
  landing is the unit of shareability; spend your best line there.
- Apply the chosen intensity level honestly. Restraint scales with it; never go
  graphic.
- Length: roughly 120–320 words.

**The TITLE:**
- Max 6 words. Specific and concrete.
- References a real detail or recurring thought in the story.
- A quiet label, not a headline. No new imagery the body doesn't contain.

**The HOOK (≤120 chars) — the line that makes a reader stop scrolling:**
- A quiet cliffhanger: surface ONE unsettling or unresolved detail from the
  story and stop there, leaving the reader needing the rest.
- Curiosity through restraint, not drama. Withhold the answer; never
  sensationalize or over-explain.
- Pull from a real moment in the story — never invent events the body doesn't
  contain. First person, present feel. No clean resolution. No spoilers/emojis.
- Example: "I counted the hallway twice tonight. The number wasn't the same."

**TAGS:** 3–5 lowercase tags, directly grounded in the story text. No generic
tags like "story" or "thoughts".

**AUTHOR:** anonymous, never a real identity; feels like a person online, not a
concept. Quiet, tired, understated. Username-style, lowercase, 1–2 short words.
No numbers/emojis; optional single dot or underscore only.

**SEO:**
- `seo.title` (≤60 chars): calm, descriptive, specific, based on the situation.
- `seo.description` (120–160 chars): no spoilers, reads like an invitation.
- `seo.keywords`: 1–5 grounded keywords.

---

## Output schema (the POST body)

```json
{
  "title": "string, 1–60 chars",
  "excerpt": "string, 1–160 chars",
  "hook": "string, 1–120 chars — quiet-cliffhanger line that hooks the reader (see HOOK rules)",
  "mood": "one of the allowed mood values",
  "categories": ["1–3 of the allowed category values"],
  "tags": ["1–5 lowercase tags"],
  "intensity": 1,
  "author": "string, 1–100 chars (e.g. Anon or a quiet pseudonym)",
  "htmlBody": "<p>HTML-formatted story body</p>",
  "readTime": 1,
  "wordCount": 140,
  "seo": {
    "title": "string, 1–60 chars",
    "description": "string, 1–160 chars",
    "keywords": ["1–5 strings"]
  }
}
```

`htmlBody` is converted to Payload's Lexical format and tags are upserted
server-side, so send plain semantic HTML (`<p>`, `<em>`, etc.). The endpoint
validates this exact shape against the same schema the app uses; consistency is
enforced there.

---

## Notes

- The reader-submission ("whisper") flow is separate and unaffected. It is
  reviewed by the night-editor agent, which shares the same voice spec
  (`src/lib/content/voice.ts`).
- One story per slug — reruns are safe (duplicates return 409 and are skipped).
- Derived slug = lowercase, hyphenated `title`; keep titles distinct.
