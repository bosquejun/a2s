# Claude-authored Story Routine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the OpenRouter auto-generation pipeline with a `/schedule` Claude routine that authors a daily batch of stories and publishes them to prod Payload through a schema-validated ingest endpoint.

**Architecture:** A new bearer-authenticated `POST /api/stories/ingest` validates the request body against the existing `nightWriterStoryWorkflowOutputSchema` and calls the existing `ingestStory(..., { publish: true })`. A repo-stored routine prompt drives a `/schedule` cloud agent that generates stories and POSTs them to this endpoint. The old OpenRouter generate path, its Vercel cron, and the night-writer agent are deleted. The whisper (reader-submission) path is untouched.

**Tech Stack:** Next.js 16 (App Router, Turbopack), Payload 3.85, TypeScript, zod, vitest (new), tsx.

**Spec:** `docs/superpowers/specs/2026-06-13-claude-story-routine-design.md`

---

## File Structure

- `next.config.ts` — keep `cacheComponents: true` (required by `use cache` services).
- `src/app/(frontend)/story/[slug]/page.tsx` — **modify**: remove build-time `generateStaticParams` (cause of `EmptyGenerateStaticParamsError`).
- `src/lib/services/stories/ingest-request.ts` — **create**: pure `parseIngestRequest(body)` helper (validate + map to `StoryIngestInput`).
- `src/app/(frontend)/api/stories/ingest/route.ts` — **create**: bearer-auth POST endpoint.
- `src/lib/services/stories/__tests__/ingest-request.test.ts` — **create**: unit tests.
- `vitest.config.ts`, `package.json` — **create/modify**: test infra.
- `docs/routines/story-generation.md` — **create**: the routine prompt/spec.
- **Delete**: `src/app/(frontend)/api/stories/start/route.ts`, `src/app/(frontend)/api/stories/generate/route.ts`, `src/lib/agents/night-writer.agent.ts`, `crons` block in `vercel.json`, `generateStory` entry in `src/lib/workflow-client/client.ts`.

---

## Task 1: Fix the production build (prerequisite)

**Files:**
- Modify: `src/app/(frontend)/story/[slug]/page.tsx` (remove `generateStaticParams`, lines ~24-30)

- [ ] **Step 1: Reproduce the failing build**

Run: `rm -rf .next && npm run build`
Expected: FAIL with `EmptyGenerateStaticParamsError` for `/story/[slug]` (Cache Components requires `generateStaticParams` to return ≥1 result; it returns `[]` when the DB has no published stories at build time).

- [ ] **Step 2: Remove the build-time `generateStaticParams`**

Delete this block from `src/app/(frontend)/story/[slug]/page.tsx`:

```tsx
export async function generateStaticParams() {
  const posts = await getAllPublishedStories(100);

  return posts.map((post) => ({
    slug: post.slug,
  }))
}
```

Also remove the now-unused import:

```tsx
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";
```

The route renders on-demand (PPR); story data is still cached via `"use cache"` + `cacheTag("stories")` in `getStoryBySlug`, and revalidated by the Stories `afterChange` hook on publish.

- [ ] **Step 3: Verify the build passes**

Run: `rm -rf .next && npm run build`
Expected: PASS — build completes, `/story/[slug]` listed as dynamic (ƒ) not static.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(frontend)/story/[slug]/page.tsx"
git commit -m "Fix prod build: render story pages on-demand under Cache Components"
```

---

## Task 2: Add vitest test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `test` script + devDeps)

- [ ] **Step 1: Install vitest**

Run: `pnpm add -D vitest`
Expected: vitest added to devDependencies.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Install the path-alias plugin (so `@/` resolves in tests)**

Run: `pnpm add -D vite-tsconfig-paths`
Expected: added to devDependencies.

- [ ] **Step 4: Add the test script**

In `package.json` `scripts`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify the runner starts (no tests yet)**

Run: `pnpm test`
Expected: vitest runs, reports "No test files found" (exit 0 or a clear no-tests message). Acceptable at this step.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "Add vitest test infrastructure"
```

---

## Task 3: Build the ingest-request parser (TDD)

This is the pure, testable core: validate the incoming body against the existing
night-writer schema and map it to `StoryIngestInput`. No DB, no network.

**Files:**
- Create: `src/lib/services/stories/__tests__/ingest-request.test.ts`
- Create: `src/lib/services/stories/ingest-request.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { parseIngestRequest } from "@/lib/services/stories/ingest-request";

const valid = {
  title: "The Light Left On",
  excerpt: "A short note about the hallway light at 3am.",
  hook: "Some lights you leave on for people who aren't coming back.",
  mood: "EMPTY",
  categories: ["ROMANCE"],
  tags: ["hallway", "insomnia", "memory"],
  intensity: 3,
  author: "Anon",
  htmlBody: "<p>The light was still on when I got up.</p>",
  readTime: 1,
  wordCount: 140,
  seo: {
    title: "The Light Left On",
    description:
      "A quiet after-2am note about the hallway light and who it was for.",
    keywords: ["hallway", "insomnia", "late night"],
  },
};

describe("parseIngestRequest", () => {
  it("accepts a valid night-writer payload and maps it to ingest input", () => {
    const result = parseIngestRequest(valid);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.input.title).toBe("The Light Left On");
    expect(result.input.categories).toEqual(["ROMANCE"]);
    expect(result.input.mood).toBe("EMPTY");
    expect(result.input.seo?.title).toBe("The Light Left On");
  });

  it("rejects an unknown mood with a 400-style error list", () => {
    const result = parseIngestRequest({ ...valid, mood: "NOT_A_MOOD" });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors.join(" ")).toMatch(/mood/i);
  });

  it("rejects a missing required field (title)", () => {
    const { title: _omit, ...withoutTitle } = valid;
    const result = parseIngestRequest(withoutTitle);
    expect(result.ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/lib/services/stories/__tests__/ingest-request.test.ts`
Expected: FAIL — `parseIngestRequest` is not defined / module not found.

- [ ] **Step 3: Write the minimal implementation**

```ts
import type { StoryIngestInput } from "@/lib/services/stories/ingest-story";
import { nightWriterStoryWorkflowOutputSchema } from "@/validations/story.validation";

export type ParseIngestResult =
  | { ok: true; input: StoryIngestInput }
  | { ok: false; errors: string[] };

/**
 * Validate an ingest request body against the same schema the night-writer
 * agent used, then map it to the ingestStory input shape. Pure: no DB/network.
 */
export function parseIngestRequest(body: unknown): ParseIngestResult {
  const parsed = nightWriterStoryWorkflowOutputSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`
      ),
    };
  }

  const story = parsed.data;
  const input: StoryIngestInput = {
    title: story.title,
    htmlBody: story.htmlBody,
    excerpt: story.excerpt,
    hook: story.hook,
    author: story.author,
    mood: story.mood,
    categories: story.categories,
    tags: story.tags,
    intensity: story.intensity,
    seo: story.seo,
  };

  return { ok: true, input };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/lib/services/stories/__tests__/ingest-request.test.ts`
Expected: PASS — all three tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/stories/ingest-request.ts src/lib/services/stories/__tests__/ingest-request.test.ts
git commit -m "Add ingest-request parser with validation tests"
```

---

## Task 4: Build the ingest endpoint

**Files:**
- Create: `src/app/(frontend)/api/stories/ingest/route.ts`

- [ ] **Step 1: Write the route**

```ts
import { timingSafeEqual } from "crypto";
import slugify from "slugify";
import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { ingestStory } from "@/lib/services/stories/ingest-story";
import { parseIngestRequest } from "@/lib/services/stories/ingest-request";

/**
 * Publishing a story is an operator action, so it requires the same bearer
 * secret as the (now-removed) generation trigger. Set STORY_GENERATION_SECRET
 * in the environment.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.STORY_GENERATION_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const headerBuffer = Buffer.from(header);
  const expectedBuffer = Buffer.from(expected);
  return (
    headerBuffer.length === expectedBuffer.length &&
    timingSafeEqual(headerBuffer, expectedBuffer)
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseIngestRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.errors.join("\n") }, { status: 400 });
  }

  try {
    const payload = await getPayloadClient();
    const slug = slugify(parsed.input.title, { lower: true, strict: true });

    const existing = await payload.find({
      collection: "stories",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    });

    if (existing.docs[0]) {
      return NextResponse.json(
        { error: "Story with this slug already exists", slug },
        { status: 409 }
      );
    }

    const story = await ingestStory(parsed.input, { publish: true });
    return NextResponse.json(
      { id: String(story.id), slug: story.slug },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/stories/ingest] ingest failed", error);
    return NextResponse.json({ error: "Failed to ingest story" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS — no type errors. (Confirm `ingestStory` returns a doc with `id` and `slug`; both are used above.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/(frontend)/api/stories/ingest/route.ts"
git commit -m "Add authenticated story ingest endpoint"
```

---

## Task 5: Live end-to-end verification

Verifies the endpoint against a running instance (the same local-run technique
used to validate the old pipeline).

**Files:** none (verification only)

- [ ] **Step 1: Start the app with a known secret**

Run (background):
```bash
STORY_GENERATION_SECRET=local-test-secret npm run dev
```
Wait for: `Ready in`.

- [ ] **Step 2: POST a valid story**

Run:
```bash
curl -s -X POST http://localhost:3000/api/stories/ingest \
  -H "Authorization: Bearer local-test-secret" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Light Left On","excerpt":"A short note about the hallway light at 3am.","hook":"Some lights you leave on for people who arent coming back.","mood":"EMPTY","categories":["ROMANCE"],"tags":["hallway","insomnia","memory"],"intensity":3,"author":"Anon","htmlBody":"<p>The light was still on when I got up.</p>","readTime":1,"wordCount":140,"seo":{"title":"The Light Left On","description":"A quiet after-2am note about the hallway light and who it was for.","keywords":["hallway","insomnia","late night"]}}' \
  -w "\nHTTP %{http_code}\n"
```
Expected: `HTTP 201`, body `{ "id": "...", "slug": "the-light-left-on" }`.

- [ ] **Step 2b: Verify it published**

Run: `curl -s http://localhost:3000/api/stories | grep -c "the-light-left-on"`
Expected: `1` (story appears in the published list).

- [ ] **Step 3: Verify auth + dedup + validation guards**

Run (no auth → 401):
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/stories/ingest -H "Content-Type: application/json" -d '{}'
```
Expected: `401`.

Run (re-POST same story → 409): repeat the Step 2 curl.
Expected: `HTTP 409`.

Run (bad mood → 400):
```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/stories/ingest -H "Authorization: Bearer local-test-secret" -H "Content-Type: application/json" -d '{"title":"x","mood":"NOPE"}'
```
Expected: `400`.

- [ ] **Step 4: Stop the dev server.** No commit (verification only).

---

## Task 6: Remove the OpenRouter generate path

**Files:**
- Delete: `src/app/(frontend)/api/stories/start/route.ts`
- Delete: `src/app/(frontend)/api/stories/generate/route.ts`
- Delete: `src/lib/agents/night-writer.agent.ts`
- Modify: `vercel.json` (remove `crons`)
- Modify: `src/lib/workflow-client/client.ts` (remove `generateStory` endpoint)

- [ ] **Step 1: Confirm nothing else references the targets**

Run:
```bash
grep -rn "night-writer.agent\|stories/generate\|stories/start\|generateStory\|a2s-story-telling-models" src
```
Expected: only the files being deleted/edited appear. If anything else references them, stop and surface it.

- [ ] **Step 2: Delete the generate-path files**

```bash
git rm "src/app/(frontend)/api/stories/start/route.ts" \
       "src/app/(frontend)/api/stories/generate/route.ts" \
       src/lib/agents/night-writer.agent.ts
```

- [ ] **Step 3: Remove the `generateStory` endpoint from the workflow client**

In `src/lib/workflow-client/client.ts`, change:

```ts
const ENDPOINTS = {
  writeStory: "api/stories",
  generateStory: "api/stories/generate",
};
```
to:
```ts
const ENDPOINTS = {
  writeStory: "api/stories",
};
```

- [ ] **Step 4: Empty the Vercel cron**

Replace `vercel.json` contents with:
```json
{}
```
(The schedule is now owned by the `/schedule` Claude routine, not Vercel Cron.)

- [ ] **Step 5: Typecheck + build**

Run: `npx tsc --noEmit && rm -rf .next && npm run build`
Expected: PASS — no dangling references, build green.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Remove OpenRouter generate path and Vercel cron"
```

---

## Task 7: Write the routine spec (the `/schedule` prompt)

**Files:**
- Create: `docs/routines/story-generation.md`

- [ ] **Step 1: Write the routine doc**

Content must include, verbatim where noted:
1. **Voice rules** — copy the CORE PRINCIPLES + TASKS prose from the old
   `createUserPrompt` in `night-writer.agent.ts` (preserve before deleting in Task 6; lift the text into this doc).
2. **Taxonomy** — the allowed `Mood` and `Category` values (from `src/lib/content/taxonomy.ts`) and intensity 1–5 meanings.
3. **Output schema** — the exact JSON shape of `nightWriterStoryWorkflowOutputSchema`
   (title ≤60, excerpt ≤160, hook ≤120, mood, categories[1–3], tags[1–5],
   intensity 1–5, author, htmlBody, readTime, wordCount, seo{title≤60,
   description 120–160, keywords[1–5]}).
4. **Variety step** — `GET {SITE}/api/stories`, read recent titles + moods,
   deliberately choose 3–5 distinct mood × category combinations that avoid the
   most recent ones.
5. **Publish step** — for each story: `POST {SITE}/api/stories/ingest` with
   `Authorization: Bearer $STORY_GENERATION_SECRET` and the JSON body. Treat 201
   as success, 409 as "already exists, skip", 400 as "fix and retry once", other
   as failure to report.
6. **Report** — list created slugs and any skipped/failed with reason.

Use `{SITE}` = the production base URL placeholder; the actual value and secret
come from the `/schedule` job environment.

- [ ] **Step 2: Commit**

```bash
git add docs/routines/story-generation.md
git commit -m "Add story-generation routine spec for /schedule"
```

- [ ] **Step 3: Wire the `/schedule` job (manual, user-driven)**

`/schedule` jobs are created interactively and run in Anthropic's cloud. After
merge, the user runs the `/schedule` skill to create a daily routine whose prompt
is the contents of `docs/routines/story-generation.md`, with `{SITE}` and
`STORY_GENERATION_SECRET` provided to the job. This step is documented here, not
automated by the plan.

---

## Self-Review Notes

- **Spec coverage:** consistency model → Tasks 3/4 (shared schema + ingestStory); direct upload → Task 4; build prereq → Task 1; removals → Task 6; routine → Task 7; cadence/variety → Task 7. All covered.
- **Type consistency:** `parseIngestRequest` returns `{ ok, input | errors }`, consumed identically in the route. `StoryIngestInput` fields match `ingestStory`. `nightWriterStoryWorkflowOutputSchema` is the single validation source.
- **Open dependency:** Task 5 live test and prod publishing require `STORY_GENERATION_SECRET` (and, for prod, a working deploy from Task 1).
