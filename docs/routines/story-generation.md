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

1. **Survey recent stories (for structural variety).**
   `GET {SITE}/payload-api/stories?sort=-publishedAt&limit=20&depth=0`
   Note the recent `mood`, `categories`, and `titles`. Also tag each story
   across these four structural dimensions (use `hook` + title to infer opening
   trigger; read a few bodies for cast and turn type):

   - **Opening trigger**: `notification` / `found-object` / `behavioral-catch`
     / `overheard` / `place` / `memory` / `other`
   - **Cast dynamics**: `solo` / `romantic-ex` / `sibling` / `parent` /
     `coworker` / `stranger` / `group` / `other`
   - **Setting**: `bedroom` / `office` / `vehicle` / `kitchen` /
     `public-space` / `outdoor` / `other`
   - **Turn type**: `behavioral-catch` / `object-shift` / `realization-rejected`
     / `question-refused` / `recolor`

   Build a tally. Structural sameness is as deadening as mood sameness.

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

3. **Choose 1–2 distinct combinations.** Pick mood × category pairs that are
   *not* heavily represented in the recent list (step 1), weighted toward what
   performs (step 2). Vary intensity across the batch. Vary the *entry point*
   and *the world* too (see the **Range** voice rules) so the batch doesn't all
   open the same way or take place in the same room — push beyond the lonely
   person scrolling in bed. Reach across the full category set, including
   `WORKPLACE`, `DESIRE`, `SPITE`, and `TIES`, not just horror/confession.
   Avoid repeating recent titles or premises.
   Vary structural dimensions too, not just taxonomy. The batch must not share
   the same opening trigger, must not be all-solo cast, and must not reuse the
   same turn type twice. Consult the step 1 tally and pick combinations absent
   or underrepresented across all four structural dimensions.

4. **Write each story** following the voice rules and output schema below.

4.5. **Self-review each story against the AI pattern checklist before publishing.**
     Re-read the story body and apply these targeted fixes — a fast pattern
     pass, not a full rewrite:

     - **Em/en dashes**: eliminate entirely. Replace "—" used as a pause with a
       period or comma. Replace " — " clause-separators with commas.
     - **AI vocabulary**: scan for and replace "testament," "landscape,"
       "crucial," "remarkable," "pivotal," "nestled," "breathtaking,"
       "additionally," "furthermore," "moreover."
     - **Copula avoidance**: rewrite "serves as," "represents," "stands as,"
       "functions as" to use "is" or "are."
     - **Negative parallelisms**: rewrite "not just X, it's also Y" as a direct
       statement.
     - **Forced three-item lists**: check whether one or two items is more natural.
     - **Passive voice**: rewrite subjectless passives to name the actor.
     - **Staccato manufactured drama**: a run of short fragments at the end is
       not a quiet turn — rewrite into one earned sentence.
     - **Aphorism formulas**: delete "X is the language of Y," "silence says
       what words cannot," and similar clichés.
     - **Generic closers**: "and that's something I'm still sitting with" used
       as a final-line evasion — rewrite to something specific to this story.

     A story that fails more than two of these checks should be rewritten, not
     patched. Only publish after this pass.

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

**categories** (1–3 of): `HORROR`, `CONFESSION`, `ROMANCE`, `EXISTENTIAL`, `SURREAL`, `WORKPLACE`, `DESIRE`, `SPITE`, `TIES`

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
- Digital-loneliness texture is ONE palette — strong for solitary/longing/
  confession stories, but don't force a phone into every story. Other categories
  carry their own textures (see **Range**).

**Range — vary the world, not just the mood.**
- The biggest failure mode is sameness: every story a person alone in bed at
  2am, scrolling a phone, missing an ex. That is ONE story. Don't default to it.
  Vary the situation, the cast, and the room across the batch.
- Move stories out of the bedroom: the late shift, the office after everyone's
  gone, a family kitchen, a car in a parking lot, a bar at closing, a hospital
  corridor, a stairwell, a wedding you couldn't sleep after.
- Vary who else is in it: coworkers, siblings, parents, old friends, a stranger,
  a boss, the person in the next bed — or genuinely no one. Not always an ex.
- Let the category set the flavor:
  - `HORROR` — grounded dread; the ordinary thing that's quietly wrong.
  - `CONFESSION` — the admission you'd never say with the lights on.
  - `ROMANCE` — tenderness and longing; the ache of caring about someone.
  - `EXISTENTIAL` — meaning, time, smallness; the 3am "why."
  - `SURREAL` — the night bending just slightly out of true.
  - `WORKPLACE` — office confessions: the coworker thing, the email you
    shouldn't have sent, favoritism, quitting in your head on the night shift.
  - `DESIRE` — charged, sensual tension and wanting (stay within **Boundaries**).
  - `SPITE` — grudges, pettiness, the unhinged little revenge you'd never act on.
  - `TIES` — family and friendship: estranged siblings, fading friends, the
    family group chat, the friend you quietly outgrew.

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

**Avoiding AI tells — concrete things not to write.**
- Forbidden phrases: "something shifted," "I found myself [doing]," "and
  somehow," "something I couldn't name," "the weight of everything," "the blue
  glow of my phone," "in that moment I realized," "a wave of [emotion] washed
  over me," "I let out a breath I didn't know I was holding," any
  rhetorical-question-that-is-also-its-own-answer.
- AI vocabulary to cut: "crucial," "pivotal," "remarkable," "breathtaking,"
  "nestled," "tapestry," "landscape" (abstract noun), "vibrant," "enduring,"
  "delve," "testament," "furthermore," "additionally."
- Forbidden structural moves: time-opener as first sentence ("It's 3am and
  I..."), clean 3-paragraph arc with evenly-weighted paragraphs, balanced
  mirroring sentences as backbone ("I used to X. Now I Y."), em/en dashes
  (replace with comma or period), staccato fragments stacked at the end,
  resolved or lesson-giving final line.
- Uniqueness test: could this story's first or last sentence appear unchanged
  in any other story on this site? If yes, rewrite it.

**Emotional texture — how it actually feels at 2am.**
- The narrator is often wrong about what they're actually upset about. Let the
  real thing show up sideways — do not resolve or explain the gap.
- Show behavioral loops: checks phone, puts it down, checks again. Goes to the
  kitchen a third time without getting anything. The loop IS the emotion.
- Let contradictions sit: missing someone and relieved they're gone in the same
  breath. Do not smooth them over.
- Emotional weight rides on a small object or fact, not the big feeling itself.
  Not "I miss her" — the contact name still unsaved, the voicemail not played.
  That specific thing is the story.
- Thoughts circle and orbit; they don't progress cleanly toward a conclusion.

**Quiet turn variety — rotate across these five types.**
- `behavioral-catch`: narrator notices they've been doing something without
  realizing. The noticing is the turn.
- `object-shift`: mundane thing acquires weight through surrounding context,
  not declaration.
- `realization-rejected`: narrator arrives at understanding; last line flinches
  away from it.
- `question-refused`: story raises a question and stops there. No answer.
- `recolor`: an earlier detail now reads differently. Reader reassembles.

Do not use the same turn type twice in one batch. Consult the step 1 tally to
avoid the type already over-represented in recent stories.

**Boundaries — heat and dread without crossing the line.**
- `DESIRE` and any charged story stay suggestive, never explicit. Live in the
  tension: longing, implication, the moment before or the morning after. A hand
  that stays a second too long; the text you reread; what almost happened. Imply,
  fade out, stop short. Never describe sexual acts or anatomy — the heat comes
  from restraint and specificity, not detail.
- `HORROR` and `SPITE` stay grounded and non-graphic. No gore, no described
  violence, no cruelty for its own sake. The unease is psychological.
- Hard lines, every category: nothing sexual involving minors, nothing involving
  non-consent, no real identifiable people. Intensity bends the restraint but
  never unlocks graphic content.

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
  "author": "string, 1–100 chars — anonymous lowercase username per AUTHOR rules, e.g. quiet.hours (never literally \"Anon\")",
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

- **Social posting is dripped, not bursted.** Stories published through this
  routine do NOT post to Facebook/Instagram/X the instant they're created.
  Instead each story is handed a single, human-uneven slot inside the
  **2–4am Asia/Manila** window (via the social-post workflow) so a freshly
  generated batch trickles out over the small hours instead of firing all at
  once. All enabled platforms for a story go out together (stories are
  staggered, not platforms). Stories published manually in the admin still
  auto-post right away, with only a small jitter to de-sync simultaneous saves.
- The reader-submission ("whisper") flow is separate and unaffected. It is
  reviewed by the night-editor agent, which shares the same voice spec
  (`src/lib/content/voice.ts`).
- One story per slug — reruns are safe (duplicates return 409 and are skipped).
- Derived slug = lowercase, hyphenated `title`; keep titles distinct.
