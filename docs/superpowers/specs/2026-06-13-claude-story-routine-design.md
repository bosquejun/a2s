# Design — Claude-authored story generation routine

**Date:** 2026-06-13
**Status:** Approved (design); pending implementation plan
**Branch:** `feat/claude-story-routine`

## Summary

Replace the existing OpenRouter-agent auto-generation pipeline with a Claude
Code scheduled routine that authors stories and publishes them directly to the
deployed Payload CMS via a thin, schema-validated ingest endpoint. Generated
stories must be **consistent with Payload's schema** — enforced by routing
every story through the same validation and ingest path the rest of the app
already uses.

The reader-submission ("whisper") path (`/api/stories/write` + night-editor
agent) is **out of scope** and remains untouched.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Role vs existing pipeline | **Replace** the generate path; Claude becomes the author |
| Publish mechanism | **Direct upload** (no git / CI) |
| Scheduler | **`/schedule` cloud agent**, runs daily |
| Publish target | **Deployed production site** |
| Volume | **Small batch daily** — 1–2 stories per run |
| Variety | **Claude picks** mood × category for variety, informed by recent stories |
| OpenRouter generate path | **Delete** (not kept dormant) |
| Routine spec storage | **Repo doc** (`docs/routines/`) + wired via `/schedule` |

## Consistency model (primary goal)

One source of truth, enforced at three gates so nothing off-schema can land:

1. **Taxonomy** — `src/lib/content/taxonomy.ts` (Mood, Category enums, intensity range).
2. **Output schema** — `src/validations/story.validation.ts` (the zod schema already
   used by the night-writer agent).
3. **Payload collection** — `Stories` field validation on create.

Flow per story: Claude generates → ingest endpoint **zod-validates** against the
existing schema (HTTP 400 on mismatch) → `ingestStory(..., { publish: true })`
performs HTML→Lexical conversion, tag upsert, and SEO mapping → Payload validates
on `create`. The routine's prompt is fed the taxonomy and schema verbatim, so it
produces conformant output by construction; the endpoint is the hard gate.

## Architecture & data flow

```
/schedule cloud routine (daily cron)
  1. GET  {SITE}/api/stories            → recent titles + moods (variety context)
  2. Claude authors 1–2 stories         → varied mood × category, night-writer voice
  3. for each story:
       POST {SITE}/api/stories/ingest    (Authorization: Bearer <secret>)
         → zod validate (story.validation)
         → ingestStory(payload, {...}, { publish: true })
         → published Story document
  4. routine reports created slugs + any rejected stories
```

## Components

### New — `POST /api/stories/ingest`
- Location: `src/app/(frontend)/api/stories/ingest/route.ts`.
- Auth: bearer secret, reusing the `STORY_GENERATION_SECRET` / `timingSafeEqual`
  pattern from `src/app/(frontend)/api/stories/start/route.ts`.
- Body: `{ title, htmlBody, excerpt, hook, author, mood, category, tags,
  intensity, seo }` — the shape the night-writer schema already defines.
- Behavior: validate with the existing zod schema → call `ingestStory` with
  `{ publish: true }` → return `{ slug, id }` (201) or structured error (400/401/500).
- Idempotency: when a story with the derived slug already exists, return 409;
  the routine treats 409 as skip-and-continue, so reruns don't double-publish.

### New — routine spec
- Location: `docs/routines/story-generation.md`.
- Contents: night-writer voice rules (lifted from `night-writer.agent.ts`),
  the taxonomy, the output schema, variety instructions (avoid recent
  moods/titles), batch size (1–2), and the ingest call contract (URL, auth,
  body). This doc is the prompt the `/schedule` job runs.

### Reused (unchanged)
- `ingestStory` (`src/lib/services/stories/ingest-story.ts`)
- `story.validation.ts`, `taxonomy.ts`
- Night-writer prompt text (copied into the routine spec, then the agent file is deleted)

## Removals (replace decision)

Delete the OpenRouter generate path and its triggers:
- `src/app/(frontend)/api/stories/start/route.ts` (cron trigger)
- `src/app/(frontend)/api/stories/generate/route.ts` (OpenRouter workflow)
- `src/lib/agents/night-writer.agent.ts`
- `generateStory` entry in `src/lib/workflow-client/client.ts`
- `crons` entry in `vercel.json`

Keep: `/api/stories/write`, night-editor agent, `ingestStory`, workflow client
(still used by the whisper path).

## Error handling

- **Per-story isolation:** the routine loops; a single failed story logs and is
  skipped, the batch continues.
- **Endpoint:** structured responses — 400 (zod issues joined), 401
  (auth), 409 (duplicate slug), 500 (ingest failure).
- **Routine report:** lists created slugs and rejected stories with reasons.

## Prerequisite (step 0 of the plan)

Production build is currently broken and must be fixed before prod publishing
works:
- `cacheComponents: true` → `EmptyGenerateStaticParamsError` on `/story/[slug]`,
  while the frontend `src/lib/services/stories/*` use `use cache` / `cacheLife`
  which require `cacheComponents`. The conflict must be reconciled so the app
  deploys and the ingest endpoint goes live.

## Out of scope

- Reader-submission ("whisper") flow and the night-editor agent.
- Git-as-content-store / GitHub Action publishing (rejected in favor of direct upload).
- Image/media generation for stories.

## Open risks

- OpenRouter preset `@preset/a2s-story-telling-models` is removed with the agent;
  ensure no other code references it.
- The `/schedule` job needs the prod base URL and the bearer secret available in
  its environment.
