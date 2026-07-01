# SEO / Indexing Audit — July 1, 2026

Symptom: Search Console page indexing has been flat since **June 12, 2026** —
no new pages indexed, impressions/clicks plateaued.

This audit covers the codebase (sitemap, robots, metadata, caching, publish
pipeline) plus the deploy history around June 12. The live site could not be
fetched from the audit environment, so anything marked **verify in GSC/live**
needs a manual check.

## What is healthy

- `robots.txt` allows all public content; only utility routes (`/api/`,
  `/admin`, `/write`, `/create`, `/track/`, `/mood/*/random`) are disallowed,
  and it advertises the sitemap.
- Every indexable page declares its own self-referential canonical; thin tag
  pages (< `TAG_INDEX_MIN` stories) are `noindex, follow` and excluded from the
  sitemap — correct handling.
- Story pages ship Article + BreadcrumbList JSON-LD, full OG/Twitter cards,
  and a stable OG image URL.
- View counting uses raw SQL on purpose, so reader views do **not** bump
  `updatedAt` or churn caches.
- Publishing goes through Payload hooks that `revalidateTag("stories")`, so
  the sitemap and story lists refresh without a deploy.

## Defects found (fixed in this change)

1. **Sitemap `lastmod` was fabricated.** Static, mood, category, and tag
   entries all reported `lastModified: new Date()` — i.e. "changed this
   second" on every fetch. Google's documented behavior is to ignore `lastmod`
   site-wide once it catches it lying, which also discards the *real* dates on
   story entries. New/updated stories then only get picked up by generic
   recrawl, which is slow for a young site. The sitemap now derives archive
   `lastmod` from the newest story each archive contains, and evergreen pages
   (`/about`, `/privacy`, `/terms`) omit it.
2. **Empty archives were listed.** Moods/categories with zero published
   stories appeared in the sitemap with a fresh fake `lastmod`. Submitting
   empty, thin pages invites "Crawled – currently not indexed" and erodes
   sitemap trust. They are now omitted until they have content.
3. **Homepage lost its RSS + hreflang alternates.** The homepage's
   `alternates: { canonical: "/" }` replaced the layout's `alternates` object
   wholesale (Next.js metadata does not deep-merge), dropping the
   `application/rss+xml` feed link and hreflang from the most-crawled page.
   Restated there now.

## Known noise (left as-is, monitor)

- **Social write-backs bump `updatedAt`.** Each platform share
  (Facebook/Instagram/Threads/X) does a `payload.update` to store post IDs,
  so a story's `updatedAt` (and sitemap `lastmod`) moves a few times in the
  hours after publish without a content change. Bounded, but if it ever grows
  (e.g. periodic re-posts), switch story `lastmod` to a dedicated
  content-change timestamp.
- Story `updatedAt` also changes on any admin edit, which is legitimate.

## Why indexing likely stalled on June 12 — verify in GSC/live

June 12–15 is exactly when the site's crawlable surface exploded: mood
archives became real pages (June 12), tag/category archives + image entries
landed in the sitemap (June 14), and story prerendering changed (June 15).
Ranked hypotheses:

1. **Crawl-budget / quality throttling of new URLs.** A young domain that
   suddenly adds many taxonomy pages plus daily AI-generated stories is the
   classic profile for Google parking URLs in *Discovered/Crawled – currently
   not indexed*. Check **GSC → Pages** and read the reason buckets; if that's
   where the growth went, this is a content-trust problem, not a technical one.
2. **Sitemap distrust from fake `lastmod`** (fixed above) compounding #1 —
   Google had no reliable freshness signal to prioritize new stories.
3. **Sitemap fetch failures.** Check **GSC → Sitemaps → last read date** and
   status. If "last read" is stuck ≈ June 12–14, the June 14 sitemap rewrite
   may have been erroring in production. Fetch
   `https://after2amstories.com/sitemap.xml` and confirm HTTP 200, valid XML,
   and that stories published *this week* appear in it.
4. **Crawler-level blocking.** If Vercel Deployment Protection, Attack
   Challenge Mode, or a WAF/bot rule was enabled around June 12, Googlebot
   gets 401/403s while browsers work. Check **GSC → Settings → Crawl stats**
   for a spike in 4xx/5xx around June 12, and run **URL Inspection → Live
   test** on a recent story.

## Part 2 — Content-trust deep dive (editorial layer)

Follow-up audit of the layer Google's quality systems evaluate. Structurally
the site is in better shape than most AI-content sites:

- **Internal linking is strong.** Mood/category/tag archives render their
  full story lists as real anchors (only `/stories` is scroll-loaded, and it's
  redundant with the mood archives). The reader links next/related stories,
  categories, and tags. Every story sits ≤ 3 hops from home.
- Stories carry visible publish dates, unique ingest-supplied SEO
  titles/descriptions, and a serious anti-AI-tell voice spec with a
  self-review gate before publish.

The risk profile is therefore not template hygiene — it's the shape of the
content itself:

1. **Story pages don't match any query.** At 120–320 words of fiction with
   invented titles, individual stories have no search demand to satisfy.
   Google indexes pages it can imagine serving for some query; hundreds of
   short fiction snippets with near-identical intent is exactly what the
   *Crawled – currently not indexed* bucket is for. The pages that CAN rank —
   mood/category/tag archives matching queries like "short unsettling stories
   to read at night" — are the site's real search surface.
2. **Scaled-content-abuse profile.** Daily automated batches + pseudonymous
   `Person` authors in JSON-LD + About-page copy implying human authorship
   ("whispered in by people who couldn't sleep") is the pattern Google's
   March-2024 spam policies target. Pseudonymous fiction is fine; the
   combination of scale, automation, and implied human origin is the exposure.

### Recommendations, in priority order

1. **Aim ranking effort at archives, not stories.** Give each mood/category —
   and the top tags — a few hundred words of unique, query-aware intro copy
   (what these stories feel like, when to read them). These pages already
   have the internal links and the sitemap entries; they just need enough
   unique text to be answers rather than lists.
2. **Add consolidation pages.** Curated collections ("seven stories for when
   you can't sleep", "stories about the text you never sent") are the format
   that matches real query intent at useful length, and they funnel authority
   to individual stories. One good collection page a week beats seven new
   stories for search.
3. **Decide the disclosure posture.** Either align the About page with how
   stories are actually made, or attribute stories to the site
   (`Organization`) rather than invented `Person` authors in JSON-LD. This is
   a positioning/brand call — flagging, not changing it here.
4. **Prune the index.** Once GSC data flows again, periodically `noindex`
   stories with zero impressions/engagement after ~8 weeks so the indexed set
   stays high-signal. Keep them live for readers and the in-site loop.
5. **Keep cadence small.** The generation routine's 1–2 stories/day with a
   quality gate is the right zone; resist scaling volume before archives and
   collections are earning impressions.
6. Story pages will mostly earn traffic via **Discover, social, and RSS**
   rather than classic ranking — measure them on that basis, not impressions.

## Checklist

- [ ] GSC → Sitemaps: "last read" is recent; submitted vs. indexed counts.
- [ ] GSC → Pages: which non-indexed bucket grew after June 12.
- [ ] GSC → Crawl stats: response-code mix and crawl volume around June 12.
- [ ] URL Inspection live test on a story published after June 12.
- [ ] Vercel: confirm no deployment protection / challenge mode on production.
- [ ] After deploying this change: resubmit the sitemap in GSC and request
      indexing for a handful of recent stories.
