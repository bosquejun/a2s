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
 * AI tells — concrete failure modes to actively avoid.
 * Patterns from both internal voice guidelines and the humanizer skill catalog
 * (github.com/blader/humanizer) that make generated stories read as
 * machine-written even when every individual word choice seems plausible.
 */
export const A2AM_AI_TELLS = `
AI TELLS — do not write these.

FORBIDDEN PHRASES (ban these exact strings and their near-synonyms):
- "something shifted" / "something changed" / "something broke"
- "I found myself [verb-ing]" — the AI narrator watching itself from outside
- "and somehow" — the connective tissue of unearned meaning
- "something I couldn't name" / "something I couldn't explain"
- "I didn't realize until" (the delayed-epiphany setup)
- "the weight of everything" / "the weight of it all"
- "the silence felt heavy" / "the silence screamed"
- "a wave of [emotion] washed over me"
- "the blue glow of my phone" — generic digital prop
- "the darkness felt different" / "the room felt smaller"
- "I let out a breath I didn't know I was holding"
- "in that moment, I realized"
- "more than I expected" / "more than I was ready for"
- "testament to" / "a testament" / "stands as a testament"
- "serves as" / "functions as" / "represents" when a simple "is" would do
- "not just X, it's also Y" — negative parallelism reaching for profundity
- "furthermore" / "moreover" / "additionally" — linking-word padding
- any aphorism formula: "silence is the loudest thing" / "X is the language of Y"
- Any rhetorical-question-as-answer: "Was I lonely? Maybe. But wasn't everyone?"
- AI vocabulary: "crucial," "pivotal," "remarkable," "breathtaking," "nestled,"
  "tapestry," "landscape" (abstract noun), "vibrant," "enduring," "delve"

FORBIDDEN STRUCTURAL MOVES:
- The time-opener: "It's 3am and I..." or "It's 2am and I'm..." as the first
  sentence. The site already sets the time; the story doesn't restate it.
- The clean 3-paragraph arc: setup → reflection → quiet insight. Real 2am
  thought doesn't arrive in evenly weighted thirds. Let paragraphs be uneven —
  one paragraph can be three sentences and the next be one.
- Balanced mirroring sentences as structural backbone: "I used to [X]. Now I [Y]."
- The resolved final line: a last sentence that tells the reader how to feel or
  delivers a tidy lesson. A quiet turn is NOT a moral.
- Polished paragraph cadence: four-to-six lines per paragraph, three paragraphs,
  each completing a thought. Real people don't draft memoirs in their heads at 2am.
- Em/en dashes used as clause-separators or dramatic pauses. Eliminate them.
  A comma or period is almost always the correct replacement.
- Staccato manufactured drama: a sequence of short fragments at the story's end
  ("she was gone. I was alone. The phone was still on.") to manufacture emotional
  impact. One sentence, earned. Not three.
- Forcing a three-item parallel list when the story only has one or two things.

THE UNIQUENESS TEST — apply to first and last sentences:
Could this sentence appear unchanged in any other story on this site? If yes,
rewrite it. First and last sentences are the only ones the reader carries away;
they must be specific to THIS story's world.
`.trim();

/**
 * The relatability layer. The single biggest lever on whether a reader thinks
 * "this is literally me." Modern, lived digital-loneliness texture — universal
 * but rarely written down in fiction.
 */
export const A2AM_RELATABILITY = `
RELATABILITY — make it feel like the reader's own 2am.
- Every story must contain at least ONE hyper-specific, concrete detail — the
  kind that makes a reader stop and think "this is me." A precise small thing
  beats any grand statement. Specificity reads as true; abstraction reads as
  machine-written. The detail should come from the story's own world (an office
  drawer, a sibling's voicemail, the smell of someone's jacket), not a default
  phone screen pasted onto every piece.
- Digital-loneliness texture is ONE palette — strong for solitary, longing, and
  confession stories, but do not force a phone into every story. Draw from it
  sparingly, never as a checklist, never all at once: a message left on read;
  the typing bubble that appears and disappears; the "active 2h ago"; the
  contact you can't bring yourself to delete; a draft rewritten four times and
  never sent; doomscrolling past someone's story; the gap between the version of
  you online and the one in the dark; muting instead of unfollowing; a
  screenshot of an old conversation; the 3am job application; the quiet of a
  group chat that used to be loud. Other categories carry their own textures
  (see RANGE).
- Reference the feeling, not the brand. Name behaviours and textures, not
  trend-words or app names that will date in a year. It should still read true
  in five years.
- No slang cosplay. Don't perform "Gen Z voice." Authentic beats current.
- Pseudo-specific is still AI. These sound concrete but are default outputs —
  avoid them: "the blue glow of my phone" / "the weight of everything" / "the
  glow of the screen" / "the quiet of the night" / "the empty room."
  Real specific is unrepeatable: the autocorrect that still fills her name. The
  read receipt from 11:47pm. The contact saved as "don't." The photo in the
  shared album no one has removed. The voicemail you haven't played because
  playing it means it's the last one. Anyone could write the first list; only
  this story contains the second.
`.trim();

/**
 * How real late-night emotion actually presents — behavioral and structural
 * reality, as opposed to performed or reported emotion.
 */
export const A2AM_EMOTIONAL_TEXTURE = `
EMOTIONAL TEXTURE — how it actually feels at 2am.

The narrator is often wrong about the stated reason. The thing they claim to
be thinking about is usually not the thing. The real thing shows up sideways —
in what they keep returning to, or what they avoid naming. Let that gap exist.
Do not resolve it. The narrator does not need self-awareness about it.

Behavioral loops: real distress repeats. The narrator checks their phone, puts
it down, checks it again within the same paragraph. Goes to the kitchen, comes
back without anything. Rereads the same message a third time. These loops are
not explained — just shown. The loop IS the emotion.

Contradictions are not resolved. Someone can miss a person and be relieved
they're gone in the same paragraph. Someone can want to sleep and also dread
it. Do not explain or smooth it over.

The thing that should matter doesn't; the thing that shouldn't does. The
narrator is wrecked about a contact name they haven't changed. Not the
relationship — the name. The toothbrush still there. The photo in the shared
album no one's removed. The story's emotional weight rides on the object that
absorbed what can't be said directly.

Late-night thoughts circle, not progress. A thought arrives, skips somewhere
else, comes back changed. Structure can mirror this — not linearly, but
orbiting. Avoid the forward march of: state → reflect → conclude.
`.trim();

/**
 * The range layer. The single biggest lever against sameness — it pushes
 * stories out of the one default scene (alone in bed, scrolling, missing an ex)
 * and gives each category a distinct flavor and texture.
 */
export const A2AM_RANGE = `
RANGE — vary the world, not just the mood.
- The biggest failure mode is sameness: every story a person alone in bed at
  2am, scrolling a phone, missing an ex. That is ONE story. Do not default to
  it. Vary the situation, the cast, and the room.
- Move stories out of the bedroom. Use the late shift, the office after everyone
  has gone, a family kitchen, a car in a parking lot, a bar at closing, a
  hospital corridor, a stairwell, a wedding you couldn't sleep after.
- Vary who else is in it. Not every story is about a romantic ex. Write
  coworkers, siblings, parents, old friends, a stranger, a boss, the person in
  the next bed — or genuinely no one.
- Let the chosen category set the flavor, and lean into what makes each
  distinct:
  · HORROR — grounded dread; the ordinary thing that's slightly, quietly wrong.
  · CONFESSION — the admission you'd never say with the lights on.
  · ROMANCE — tenderness and longing; the ache of caring about someone.
  · EXISTENTIAL — meaning, time, smallness; the 3am "why."
  · SURREAL — the night bending just slightly out of true.
  · WORKPLACE — office confessions: the coworker thing, the email you shouldn't
    have sent, the favoritism, quitting in your head on the night shift.
  · DESIRE — charged, sensual tension and wanting (stay within BOUNDARIES).
  · SPITE — grudges, pettiness, the unhinged little revenge you'd never act on.
  · TIES — family and friendship bonds: estranged siblings, fading friends, the
    family group chat, the friend you quietly outgrew.
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
  should quietly turn. It must be earned by the story, never engineered or
  invented. This last-line landing is the unit of shareability; spend your
  best line there.

  Rotate across these distinct turn types — do not default to only one:
  · Behavioral catch: the narrator realizes they have been doing something
    (rereading, checking, counting). The catch itself is the turn.
  · Object shift: a mundane object acquires unexpected weight — not because
    the narrator declares it significant, but because of what surrounds it.
  · Realization rejected: the narrator arrives at an understanding and
    immediately doesn't want it. The flinch-away is the last line.
  · Question refused: the story raises a question it will not answer. It stops
    on the question itself. No answer, no gesture toward one.
  · Recolor: a detail from earlier now reads differently. The reader
    reassembles what they just read.

  Track which turn type you last used and do not repeat it consecutively.
- Apply the chosen intensity level honestly. Restraint scales with it; never go
  graphic.
- Length: roughly 120–320 words. Short enough to read on a phone in one sitting,
  long enough to land.
`.trim();

/**
 * Content boundaries. Lets DESIRE run hot while keeping every category within a
 * tasteful, platform-safe line — heat and dread come from restraint, not detail.
 */
export const A2AM_BOUNDARIES = `
BOUNDARIES — heat and dread without crossing the line.
- DESIRE and any charged story stay suggestive, never explicit. Live in the
  tension: longing, implication, the moment before or the morning after. A hand
  that stays a second too long; the text you reread; what almost happened; what
  you can't stop thinking about. Imply, fade out, stop short. Never describe
  sexual acts or anatomy. The heat comes from restraint and specificity, not
  from detail.
- HORROR and SPITE stay grounded and non-graphic. No gore, no described
  violence, no cruelty for its own sake. The unease is psychological.
- Hard lines, every category: nothing sexual involving minors, nothing
  involving non-consent, and no real, identifiable people. Intensity scales how
  far the restraint bends (see the intensity levels) but never unlocks graphic
  content.
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
  A2AM_AI_TELLS,
  A2AM_RELATABILITY,
  A2AM_EMOTIONAL_TEXTURE,
  A2AM_RANGE,
  A2AM_STORY_RULES,
  A2AM_BOUNDARIES,
  A2AM_TITLE_RULES,
  A2AM_HOOK_RULES,
  A2AM_AUTHOR_RULES,
  A2AM_TAGS_AND_SEO_RULES,
].join("\n\n");
