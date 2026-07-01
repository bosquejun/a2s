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

## Checklist

- [ ] GSC → Sitemaps: "last read" is recent; submitted vs. indexed counts.
- [ ] GSC → Pages: which non-indexed bucket grew after June 12.
- [ ] GSC → Crawl stats: response-code mix and crawl volume around June 12.
- [ ] URL Inspection live test on a story published after June 12.
- [ ] Vercel: confirm no deployment protection / challenge mode on production.
- [ ] After deploying this change: resubmit the sitemap in GSC and request
      indexing for a handful of recent stories.
