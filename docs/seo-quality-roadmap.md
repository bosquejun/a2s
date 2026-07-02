# SEO Quality Roadmap — quality over quantity

Companion to `seo-indexing-audit.md`. That doc diagnosed; this one is the
build plan. North star: **every indexable page must answer a query or get
pruned.** Volume is not a goal anywhere below.

How the pieces fit: archives and collections become the pages that *rank*;
stories become the pages that *retain and get shared*. Impressions should
migrate toward archive/collection URLs — that is success, not a problem.

---

## Phase 0 — Ship & baseline (now, ~1 day)

1. Merge and deploy the audit branch (sitemap lastmod fixes, homepage
   alternates).
2. GSC: resubmit the sitemap; run the checklist at the end of the audit doc
   to identify which non-indexed bucket grew after June 12.
3. Record a baseline before anything else changes: indexed/submitted per
   page type, impressions split by URL pattern (`/story/`, `/mood/`,
   `/category/`, `/tag/`), Discover clicks. GSC regex filters are enough.
4. **Decision (owner call, blocks nothing else): disclosure posture.**
   Options, in order of decreasing safety:
   - a. Attribute stories to the site (JSON-LD `Organization` author, keep
     display pseudonyms as bylines styled as personas, not people).
   - b. Add one honest About-page line ("fiction written for these hours,
     some of it machine-assisted, all of it edited") and keep `Person`.
   - c. Keep as-is and accept the scaled-content-abuse exposure.

## Phase 1 — Make archives the ranking surface (week 1–2)

The 6 mood + 9 category pages are the site's realistic rankers ("stories to
read when you can't sleep", "short unsettling stories"). Today they carry
one whisper line and a card grid — no reason for Google to pick them over
anyone else's page.

**Code (small):**
- New module `src/lib/content/archive-copy.ts`: per-mood and per-category
  editorial intros (300–500 words each) plus a unique meta description.
  Keyed off the existing `Mood`/`Category` types so a missing entry is a
  type error, same pattern as `MOOD_LABELS`.
- Archive pages render the intro between header and feed — first paragraph
  visible, rest behind a quiet "more" disclosure so reader UX stays intact.
  Full text is in the HTML either way (`<details>` or equivalent, not JS
  fetch).
- Metadata: swap the current templated descriptions for the per-archive ones.
- Top ~10 indexable tags get the same treatment via a map keyed by tag slug;
  unmapped tags keep today's template + `TAG_INDEX_MIN` noindex gate.

**Copy (the actual work, one-time):** 15 essays + 10 tag intros. Drafted in
the site voice, **human-reviewed before merge** — these are the pages we're
asking Google to trust, they cannot read machine-templated. Each must name
the feeling, what the stories here do, and when to read them; no two may
share phrasing.

**Done when:** every sitemap-listed archive has ≥300 words of unique text
and a unique title/description.

## Phase 2 — Collections (week 2–4)

The consolidation format: curated, long-form pages that match real query
intent ("seven stories for when you miss someone at 2am") and pass authority
down to stories. Repackaging existing stories, not new generation.

**Code (the one real feature):**
- Payload collection `collections`: `title`, `slug`, `hook`, `intro`
  (richText, 400–800 words), ordered `stories` relationship, `seo` group,
  drafts enabled (`_status`) so nothing publishes without admin review.
- Routes: `/collections/[slug]` + a `/collections` index. CollectionPage +
  ItemList JSON-LD, OG card, honest sitemap entries (lastmod = collection
  `updatedAt`).
- Cross-linking: story reader shows "part of: {collection}" backlinks;
  mood/category archives link related collections; a homepage lane once
  ≥3 exist.
- Reuse the existing revalidate-hook pattern (`collections` cache tag).

**Editorial cadence: one per week, maximum.** Add
`docs/routines/collection-curation.md` for the night-editor agent: survey
published stories, pick 5–9 that genuinely cohere, write the intro and
per-story blurbs, save as **draft**. A human publishes. If nothing coheres
that week, skip the week — a thin collection is worse than none.

**Done when:** 4 collections live, each ≥600 words of unique text, each
linked from at least one archive and its member stories.

## Phase 3 — Prune and rebalance (ongoing from week 4)

Quality over quantity applied to the existing catalog and the pipeline.

- **Noindex mechanism:** a `search.noindex` checkbox on stories →
  `generateMetadata` emits `robots: noindex` and the sitemap skips it. Page
  stays live for readers, social, and the in-site loop.
- **Prune rule (manual first):** monthly, stories ≥8 weeks old with zero GSC
  impressions and negligible views get noindexed. Run it by hand from the
  admin list (viewCount column exists) + a GSC export for two cycles before
  considering automation — the rule needs validating, not scaling.
- **Cadence cut in `story-generation.md`:** from a daily batch to **≤4
  stories/week**, and make the quality gate explicit license: "if fewer than
  the batch size clear the self-review checklist, publish fewer — zero is an
  acceptable batch."
- **Tag discipline in the same doc:** prefer existing indexable tags
  (`GET /tag` surface) over inventing near-synonyms, so tag pages
  concentrate instead of sprawling.

## Phase 4 — Distribution that compounds (parallel, low effort)

Story pages earn via Discover, social, and RSS — not classic ranking.
Already in place: large OG images, `max-image-preview:large`, RSS, social
auto-posting. Remaining:
- Watch GSC → Discover once it has data; Discover rewards exactly the
  hook-first cards this site already generates.
- Collections are also the best social objects — share those, not only
  stories.

## KPIs (review monthly)

| Metric | Now | Target (90 days) |
| --- | --- | --- |
| Archive+collection share of impressions | ~0 | > 50% |
| Indexed / submitted ratio (sitemap) | stalled since Jun 12 | > 80% |
| Stories earning ≥1 impression within 8 weeks | unknown | > 40%, rest pruned |
| Indexable pages with ≥300 words unique text | ~15% | 100% |

## Sequencing note

Phases 1 and 2 are independent of GSC access and can start immediately.
Phase 3's prune rule needs GSC data flowing again, so its start date is
gated on Phase 0 confirming the sitemap reads clean. Nothing here increases
publishing volume; three of the four phases reduce or repackage it.
