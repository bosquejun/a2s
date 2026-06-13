# View Tracking — Design

**Date:** 2026-06-13
**Status:** Approved (pending spec review)

## Goal

Track and display per-story **view counts**. Counts are durable, visible/sortable in
the Payload admin, and shown to readers on both the story reader and the story
listing cards.

> Likes/upvotes are explicitly **out of scope** for now (see Out of scope).

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Storage | Payload number field (`viewCount`) in Postgres |
| View counting | Raw count per page load (no session de-dup) |
| Display | Story reader **and** listing/mood cards |

## Constraints discovered in the codebase

1. `getStoryBySlug` (and the list services) use `'use cache'` with `cacheLife("hours")`.
   Rendered count values are therefore **hours-stale**.
2. `Stories` collection `afterChange` hook (`revalidateStory`) calls `revalidateTag`.
   A normal `payload.update()` per view would nuke the story cache on every view
   **and** churn the version table (`versions.maxPerDoc: 20`). Both unacceptable.
3. Story pages are statically cached → the server component does **not** re-run per
   view, so views cannot be counted during server render.

These force the architecture below.

## Architecture

### 1. Schema (`src/payload/collections/Stories.ts`)

Add one field:

```ts
{
  name: "viewCount",
  type: "number",
  defaultValue: 0,
  index: true,
  admin: {
    position: "sidebar",
    readOnly: true,
    description: "Total views (auto).",
  },
}
```

- Durable in Postgres, read-only + sortable in admin (`index: true` for sorting).
- Applied via a Payload **migration** (not blind dev push) — see Risks.

### 2. Write path — atomic raw SQL, bypassing Payload hooks

The view mutation uses `payload.db.drizzle` (raw SQL `UPDATE`) so it skips
`beforeChange`/`afterChange` hooks, skips version creation, skips cache revalidation,
and is atomic under concurrency.

New routes under `src/app/(frontend)/api/stories/[slug]/`:

- **`POST view`** → `UPDATE stories SET view_count = COALESCE(view_count,0) + 1 WHERE slug = $1 AND _status = 'published'`.
  Fire-and-forget, returns `204`. Rate-limited by hashed IP to curb refresh/bot spam.
  **Environment guard:** the increment only runs when the deploy is production
  (`process.env.VERCEL_ENV === "production"`, falling back to
  `process.env.NODE_ENV === "production"` when `VERCEL_ENV` is unset). Otherwise the
  route returns `204` without writing. This prevents local dev and Vercel **preview**
  loads from inflating real counts — important because `.env` points at the prod DB.
  (`NODE_ENV` alone is `"production"` on preview deploys too, so `VERCEL_ENV` is the
  precise gate.)
- **`GET stats`** → `{ views }`, **uncached** (live read for display overlay).

Reuse the `@upstash/ratelimit` pattern already in
`src/app/(frontend)/api/stories/write/route.ts` (sliding window).

### 3. Read / display path

**Types** (`src/lib/types.ts`): add `viewCount: number` to both `Story` and
`StorySummary`.

**Normalize** (`src/lib/content/normalize.ts`): map `doc.viewCount ?? 0` in both
`normalizeStory` and `normalizeStorySummary`. Add `viewCount` to `StoryDoc`.

**Cards** (`src/components/story-card.tsx`): render the view count read-only (an eye
icon + number) from `StorySummary`. No interactivity. Values are hours-stale
(acceptable for cards). Payload `find` already returns top-level fields, so no
list-query change is needed.

**Reader** (`src/components/story-reader.tsx`, already `"use client"`): a new
`StoryStats` client component (or inline block) that:
- On mount: fires the `POST .../view` beacon **once** (guard against React 18
  double-mount via a ref), then `GET .../stats` for the fresh count.
- Renders the live view count.
- SSR-rendered `story.viewCount` is the initial fallback before `GET stats` resolves.

## Data flow

```
Reader mount ─POST /view (once) ─► raw UPDATE +1
            └GET /stats ─────────► raw SELECT ─► {views} (live)
Card render ── SSR from StorySummary (hours-stale count, display only)
Admin ────── reads/sorts view_count column
```

## Error handling

- View beacon failure: silent (fire-and-forget); no user-facing error.
- Rate-limit hit: `429`; client treats as no-op.
- Unknown / unpublished slug: routes return `404`/no-op; never create rows.
- `GET stats` failure: reader falls back to SSR count.

## Testing

- Unit: `normalizeStory`/`normalizeStorySummary` include `viewCount`, default to 0.
- Route tests (vitest, mirroring existing `api/stories` test style): view increments
  by 1, rate-limit returns 429, unpublished/unknown slug is a no-op.

## Risks

- **⚠️ Prod DB schema change.** Per project memory, `.env DATABASE_URL` points at the
  **production** database. Adding `viewCount` is a schema change. Execute via a
  reviewed Payload migration, run deliberately against prod — do **not** rely on an
  accidental dev push. Confirm before applying. (The env guard below does **not**
  cover this — it only gates writes, not schema.)
- **⚠️ Count pollution from non-prod loads.** Because `.env` points at prod, local dev
  and preview page loads would otherwise inflate real `view_count`. Mitigated by the
  `VERCEL_ENV`/`NODE_ENV` guard on the `POST view` route (see Write path).
- **Write volume.** Raw-per-load views = one Postgres write per page view. Fine at
  current scale; revisit (Redis buffer + flush) if traffic grows.

## Out of scope (YAGNI)

- **Likes / upvotes** — deferred. The architecture leaves room: a `likeCount` field +
  `POST like` route + localStorage toggle can be added later without reworking this.
- Sorting stories by popularity in the UI (the field is sortable in admin now).
- Redis counter buffering / periodic flush.
