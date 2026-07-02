# Collection Curation Routine

Weekly `/schedule` Claude routine that curates ONE story collection from
already-published stories and submits it as a **draft** for human review.
Collections are the site's highest-trust search pages (see
`docs/seo-quality-roadmap.md`, Phase 2): long-form, query-matching pages like
"seven stories for when you can't sleep" that pass authority down to stories.

**Run environment provides:**
- `{SITE}` — production base URL
- `STORY_GENERATION_SECRET` — bearer token for the ingest endpoint

**Cadence: at most one collection per run, one run per week.** If nothing
coheres, submit nothing and say so in the report. A thin or forced collection
is worse than none — skipping the week is a correct outcome, not a failure.

---

## What to do each run

1. **Survey the catalog.**
   `GET {SITE}/payload-api/stories?sort=-publishedAt&limit=100&depth=0`
   Also pull the most-read set:
   `GET {SITE}/payload-api/stories?sort=-viewCount&limit=30&depth=0`

2. **Check existing collections so you don't repeat one.**
   `GET {SITE}/payload-api/collections?limit=50&depth=0`
   Note their titles and member story ids. A new collection must not share
   its premise with an existing one, and should reuse at most 2 stories from
   any earlier collection.

3. **Find a real seam.** A collection is a *query* someone types at 2am,
   answered with stories that genuinely cohere. Good seams:
   - a situation ("stories about the text you never sent")
   - a night ("seven stories for when you can't sleep")
   - a relationship ("stories about the friend you outgrew")
   - a place ("stories from the night shift")
   Mood and category are ingredients, not seams — "six DARK stories" is a
   tag page, not a collection. Prefer seams that cut across moods.

4. **Pick 5–9 stories, in reading order.** Every story must earn its slot:
   it fits the seam on its own terms, not by stretch. Favor stories with
   engagement (step 1's most-read set) but include at least one
   under-surfaced story that deserves the traffic. Order for arc: open with
   the most immediately relatable, end with the one whose last line lands
   hardest.

5. **Write the intro: 400–800 words of HTML (`<p>` paragraphs only).**
   This is the page's ranking text and it must read human. Follow the voice
   rules in `story-generation.md` (no em dashes, no AI vocabulary, no
   rule-of-three padding, no negative parallelisms) with these additions:
   - Name the night the reader is having in the first paragraph, plainly.
   - Say what the stories are and how they were chosen; one line per story
     is allowed but don't summarize all of them mechanically.
   - Weave the natural search phrase for the seam into the prose once
     (e.g. "stories to read when you can't sleep"), never stuffed.
   - End by telling the reader how to read it: in order, one per night,
     all at once — whatever fits the seam.

6. **Self-review against the AI-pattern checklist in
   `story-generation.md` (step 4.5).** A collection intro that fails more
   than two checks gets rewritten, not patched.

7. **Submit as a draft:**
   `POST {SITE}/api/collections/ingest`
   Headers: `Authorization: Bearer {STORY_GENERATION_SECRET}`,
   `Content-Type: application/json`

   ```json
   {
     "title": "Seven stories for when you can't sleep",
     "hook": "One per sleepless night. No promises about the sleeping.",
     "introHtml": "<p>...400-800 words...</p>",
     "storySlugs": ["slug-one", "slug-two", "..."],
     "seo": {
       "title": "Stories to Read When You Can't Sleep — a collection",
       "description": "Seven short stories for sleepless nights, chosen and ordered. 140-160 chars, written as the search snippet."
     }
   }
   ```

   - `201` → draft created; record the returned slug
   - `400` → validation error; read the message, fix, retry once
   - `401`/other → record as failure, do not retry

8. **Report:** the seam you chose, the member slugs in order, why each
   earned its slot, and anything you considered and rejected. If you skipped
   the week, say what you looked at and why nothing cohered.

## What happens after

The draft waits in `/admin` → Collections. A human edits the intro where it
needs it, re-orders if the arc is off, and publishes. Publishing is what adds
the page to the sitemap, the archives' collection rows, and the member
stories' "From the collection" backlinks — none of that happens while it's a
draft.
