# Instagram Auto-Share Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-share a story to the connected Instagram business account when it is published (plus a manual admin button), mirroring the existing Facebook Page integration.

**Architecture:** Reuse the existing Facebook Page connection — an Instagram business account is discoverable from the linked Page, and publishing uses the same Page access token. A new `lib/services/instagram` module wraps the Graph content-publishing API (create media container → publish). The post image is the story's OG design rendered to a 1080×1080 JPEG via `sharp`. A Payload `afterChange` hook fires the share on the published transition; an admin sidebar button fires it manually.

**Tech Stack:** Next.js 16 (App Router), Payload CMS, Postgres (`@payloadcms/db-postgres`), `next/og`, `sharp` 0.34.5, Vitest. Facebook/Instagram Graph API v21.

---

## File Structure

**Create:**
- `src/lib/services/instagram/client.ts` — Graph helpers: discover IG user id, create media container, publish.
- `src/lib/services/instagram/share-story.ts` — `shareStoryToInstagram()` orchestration + caption builder.
- `src/lib/services/instagram/ig-image.ts` — `toSquareJpeg()` PNG→JPEG/1080² helper.
- `src/app/(frontend)/story/[slug]/ig/route.tsx` — public JPEG image endpoint.
- `src/app/(frontend)/api/instagram/share/route.ts` — admin-only manual share.
- `src/components/admin/InstagramShareButton.tsx` — sidebar button.
- `src/payload/hooks/publish-to-instagram.ts` — auto-post afterChange hook.
- `src/migrations/20260616_000000_instagram_integration.sql` — new columns.
- Test files alongside (see tasks).

**Modify:**
- `src/lib/services/facebook/client.ts` — add Instagram OAuth scopes.
- `src/lib/services/facebook/connection.ts` — `instagramUserId` in `StoredConnection`; discover + store it in `saveConnection`.
- `src/payload/globals/FacebookConnection.ts` — read-only `instagramUserId` field.
- `src/payload/collections/Stories.ts` — `autoPostToInstagram`, `instagramPostId`, `shareToInstagram` fields + add `publishToInstagram` to `afterChange`.
- `src/app/(payload)/admin/importMap.js` — register `InstagramShareButton`.

---

## Task 1: Instagram Graph client

**Files:**
- Create: `src/lib/services/instagram/client.ts`
- Test: `src/lib/services/instagram/__tests__/client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/services/instagram/__tests__/client.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMediaContainer,
  getInstagramUserId,
  publishMedia,
} from "../client";
import { FacebookGraphError } from "@/lib/services/facebook/client";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status: ok ? status : status === 200 ? 400 : status,
      })
    );
}

afterEach(() => vi.restoreAllMocks());

describe("getInstagramUserId", () => {
  it("returns the linked instagram_business_account id", async () => {
    mockFetchOnce({ instagram_business_account: { id: "178414" } });
    const id = await getInstagramUserId("PAGE1", "TOKEN");
    expect(id).toBe("178414");
  });

  it("returns null when no instagram account is linked", async () => {
    mockFetchOnce({ id: "PAGE1" });
    const id = await getInstagramUserId("PAGE1", "TOKEN");
    expect(id).toBeNull();
  });
});

describe("createMediaContainer", () => {
  it("posts image_url + caption and returns the creation id", async () => {
    const spy = mockFetchOnce({ id: "CONTAINER1" });
    const id = await createMediaContainer({
      igUserId: "IG1",
      pageAccessToken: "TOKEN",
      imageUrl: "https://x/og.jpg",
      caption: "hi",
    });
    expect(id).toBe("CONTAINER1");
    const [, init] = spy.mock.calls[0];
    const body = init?.body as URLSearchParams;
    expect(body.get("image_url")).toBe("https://x/og.jpg");
    expect(body.get("caption")).toBe("hi");
  });

  it("throws FacebookGraphError with the Graph error code", async () => {
    mockFetchOnce({ error: { message: "bad", code: 190 } }, false);
    await expect(
      createMediaContainer({
        igUserId: "IG1",
        pageAccessToken: "TOKEN",
        imageUrl: "https://x/og.jpg",
        caption: "hi",
      })
    ).rejects.toMatchObject({ code: 190 });
  });
});

describe("publishMedia", () => {
  it("publishes the creation id and returns the media id", async () => {
    const spy = mockFetchOnce({ id: "MEDIA1" });
    const id = await publishMedia({
      igUserId: "IG1",
      pageAccessToken: "TOKEN",
      creationId: "CONTAINER1",
    });
    expect(id).toBe("MEDIA1");
    const [, init] = spy.mock.calls[0];
    const body = init?.body as URLSearchParams;
    expect(body.get("creation_id")).toBe("CONTAINER1");
  });
});

it("reuses FacebookGraphError class", () => {
  expect(new FacebookGraphError("x", 1)).toBeInstanceOf(Error);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/services/instagram/__tests__/client.test.ts`
Expected: FAIL — cannot resolve `../client`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/services/instagram/client.ts
import "server-only";

import { FacebookGraphError } from "@/lib/services/facebook/client";

const GRAPH_VERSION = "v21.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

async function graphPost(
  path: string,
  params: Record<string, string>
): Promise<{ id?: string }> {
  const body = new URLSearchParams(params);
  const res = await fetch(`${GRAPH}/${path}`, { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new FacebookGraphError(
      json?.error?.message ?? "Instagram Graph request failed",
      json?.error?.code
    );
  }
  return json;
}

/**
 * Resolve the Instagram business account linked to a Facebook Page. Returns
 * null when the Page has no linked Instagram business/creator account.
 */
export async function getInstagramUserId(
  pageId: string,
  pageAccessToken: string
): Promise<string | null> {
  const url = new URL(`${GRAPH}/${pageId}`);
  url.searchParams.set("fields", "instagram_business_account");
  url.searchParams.set("access_token", pageAccessToken);
  const res = await fetch(url, { method: "GET" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.error) {
    throw new FacebookGraphError(
      json?.error?.message ?? "Failed to read linked Instagram account",
      json?.error?.code
    );
  }
  return json?.instagram_business_account?.id ?? null;
}

/** Step 1 of publishing: stage the image + caption, get a creation id. */
export async function createMediaContainer(opts: {
  igUserId: string;
  pageAccessToken: string;
  imageUrl: string;
  caption: string;
}): Promise<string> {
  const json = await graphPost(`${opts.igUserId}/media`, {
    image_url: opts.imageUrl,
    caption: opts.caption,
    access_token: opts.pageAccessToken,
  });
  return json.id as string;
}

/** Step 2 of publishing: publish a staged creation id, get the media id. */
export async function publishMedia(opts: {
  igUserId: string;
  pageAccessToken: string;
  creationId: string;
}): Promise<string> {
  const json = await graphPost(`${opts.igUserId}/media_publish`, {
    creation_id: opts.creationId,
    access_token: opts.pageAccessToken,
  });
  return json.id as string;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/services/instagram/__tests__/client.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/instagram/client.ts src/lib/services/instagram/__tests__/client.test.ts
git commit -m "feat: Instagram Graph publishing client"
```

---

## Task 2: Caption builder

**Files:**
- Create: `src/lib/services/instagram/share-story.ts` (caption export only this task)
- Test: `src/lib/services/instagram/__tests__/caption.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/services/instagram/__tests__/caption.test.ts
import { describe, expect, it } from "vitest";
import { buildInstagramCaption } from "../share-story";

describe("buildInstagramCaption", () => {
  it("prefers the hook and appends the link-in-bio line", () => {
    const c = buildInstagramCaption({ hook: "H", excerpt: "E", title: "T" });
    expect(c).toBe("H\n\nRead the full story — link in bio 🔗");
  });

  it("falls back to excerpt, then title", () => {
    expect(buildInstagramCaption({ excerpt: "E", title: "T" })).toContain("E\n\n");
    expect(buildInstagramCaption({ title: "T" })).toContain("T\n\n");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/services/instagram/__tests__/caption.test.ts`
Expected: FAIL — `buildInstagramCaption` not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/services/instagram/share-story.ts
import "server-only";

const LINK_IN_BIO = "Read the full story — link in bio 🔗";

/**
 * Instagram captions cannot contain clickable links, so the caption leads with
 * the story's social hook (or excerpt/title) and points readers to the bio.
 */
export function buildInstagramCaption(story: {
  hook?: string | null;
  excerpt?: string | null;
  title: string;
}): string {
  const lead = story.hook || story.excerpt || story.title;
  return `${lead}\n\n${LINK_IN_BIO}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/services/instagram/__tests__/caption.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/instagram/share-story.ts src/lib/services/instagram/__tests__/caption.test.ts
git commit -m "feat: Instagram caption builder"
```

---

## Task 3: Square-JPEG image helper

**Files:**
- Create: `src/lib/services/instagram/ig-image.ts`
- Test: `src/lib/services/instagram/__tests__/ig-image.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/services/instagram/__tests__/ig-image.test.ts
import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { IG_IMAGE_SIZE, toSquareJpeg } from "../ig-image";

async function makePng(w: number, h: number): Promise<Buffer> {
  return sharp({
    create: { width: w, height: h, channels: 3, background: "#101018" },
  })
    .png()
    .toBuffer();
}

describe("toSquareJpeg", () => {
  it("produces a 1080x1080 JPEG from a landscape PNG", async () => {
    const png = await makePng(1200, 630);
    const jpeg = await toSquareJpeg(png);
    const meta = await sharp(jpeg).metadata();
    expect(meta.format).toBe("jpeg");
    expect(meta.width).toBe(IG_IMAGE_SIZE);
    expect(meta.height).toBe(IG_IMAGE_SIZE);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/services/instagram/__tests__/ig-image.test.ts`
Expected: FAIL — cannot resolve `../ig-image`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/services/instagram/ig-image.ts
import "server-only";

import sharp from "sharp";

import { OG_COLORS } from "@/lib/og/og-kit";

export const IG_IMAGE_SIZE = 1080;

/**
 * Convert the story's OG PNG into a 1080×1080 JPEG suitable for an Instagram
 * feed post. The landscape OG art is fit (letterboxed) onto a square canvas in
 * the site's base colour so nothing is cropped, then encoded as JPEG (the only
 * format the Instagram feed accepts).
 */
export async function toSquareJpeg(png: Buffer): Promise<Buffer> {
  return sharp(png)
    .resize(IG_IMAGE_SIZE, IG_IMAGE_SIZE, {
      fit: "contain",
      background: OG_COLORS.base,
    })
    .jpeg({ quality: 90 })
    .toBuffer();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/services/instagram/__tests__/ig-image.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/instagram/ig-image.ts src/lib/services/instagram/__tests__/ig-image.test.ts
git commit -m "feat: OG-to-square-JPEG helper for Instagram"
```

---

## Task 4: IG image route

**Files:**
- Create: `src/app/(frontend)/story/[slug]/ig/route.tsx`

No unit test (thin wiring of tested helpers + Next route). Verified by build + manual fetch.

- [ ] **Step 1: Write the route**

```tsx
// src/app/(frontend)/story/[slug]/ig/route.tsx
import { getStoryBySlug } from "@/lib/services/stories/get-story";
import { storyOgImage } from "@/lib/og/og-kit";
import { toSquareJpeg } from "@/lib/services/instagram/ig-image";

/**
 * Instagram feed image for a story (`/story/[slug]/ig`). Renders the same OG
 * design as the social card, then converts it to a 1080×1080 JPEG — the format
 * and aspect Instagram's content-publishing API requires. Referenced as the
 * `image_url` when posting to Instagram.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  const og = await storyOgImage(story);
  const png = Buffer.from(await og.arrayBuffer());
  const jpeg = await toSquareJpeg(png);
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "public, max-age=3600",
    },
  });
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(frontend)/story/[slug]/ig/route.tsx"
git commit -m "feat: /story/[slug]/ig JPEG image route"
```

---

## Task 5: Extend connection — IG scopes, storage, discovery

**Files:**
- Modify: `src/lib/services/facebook/client.ts` (scopes)
- Modify: `src/lib/services/facebook/connection.ts:18-40` (StoredConnection + getConnection), `saveConnection`
- Modify: `src/payload/globals/FacebookConnection.ts`

- [ ] **Step 1: Add Instagram scopes**

In `src/lib/services/facebook/client.ts`, extend `FACEBOOK_SCOPES`:

```ts
export const FACEBOOK_SCOPES = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
];
```

- [ ] **Step 2: Add `instagramUserId` to the stored connection**

In `src/lib/services/facebook/connection.ts`:

Add to the imports at the top:

```ts
import { getInstagramUserId } from "@/lib/services/instagram/client";
```

Add to the `StoredConnection` interface:

```ts
  instagramUserId: string | null;
```

In `getConnection`, add to the returned object:

```ts
    instagramUserId: global?.instagramUserId ?? null,
```

Replace `saveConnection` so it discovers and stores the linked Instagram
account (best-effort — a missing/unlinked account must not break the Facebook
connection):

```ts
export async function saveConnection(
  payload: Payload,
  data: {
    pageId: string;
    pageName: string;
    userName?: string | null;
    pageAccessToken: string;
  }
): Promise<void> {
  let instagramUserId: string | null = null;
  try {
    instagramUserId = await getInstagramUserId(data.pageId, data.pageAccessToken);
  } catch {
    instagramUserId = null;
  }

  await payload.updateGlobal({
    slug: GLOBAL_SLUG,
    overrideAccess: true,
    data: {
      connected: true,
      pageId: data.pageId,
      pageName: data.pageName,
      userName: data.userName ?? null,
      pageAccessToken: encryptToken(data.pageAccessToken),
      userAccessToken: null,
      instagramUserId,
      connectedAt: new Date().toISOString(),
    },
  });
}
```

In `clearConnection`, add `instagramUserId: null,` to the cleared `data`.

- [ ] **Step 3: Add the global field**

In `src/payload/globals/FacebookConnection.ts`, add after the `pageId` field:

```ts
    {
      name: "instagramUserId",
      type: "text",
      admin: {
        readOnly: true,
        description:
          "Instagram business account linked to the connected Page (auto-detected).",
      },
    },
```

- [ ] **Step 4: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Run the full suite (no regressions)**

Run: `pnpm test`
Expected: all prior tests + Tasks 1-3 pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/services/facebook/client.ts src/lib/services/facebook/connection.ts src/payload/globals/FacebookConnection.ts
git commit -m "feat: discover and store linked Instagram account on connect"
```

---

## Task 6: shareStoryToInstagram service

**Files:**
- Modify: `src/lib/services/instagram/share-story.ts`
- Test: `src/lib/services/instagram/__tests__/share-story.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/services/instagram/__tests__/share-story.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../client", () => ({
  createMediaContainer: vi.fn(),
  publishMedia: vi.fn(),
}));
vi.mock("@/lib/services/facebook/connection", () => ({
  getConnection: vi.fn(),
  clearConnection: vi.fn(),
}));

import { shareStoryToInstagram } from "../share-story";
import { createMediaContainer, publishMedia } from "../client";
import { clearConnection, getConnection } from "@/lib/services/facebook/connection";
import { FacebookGraphError } from "@/lib/services/facebook/client";

const story = { id: 1, slug: "s", title: "T", hook: "H", excerpt: "E" };

function fakePayload(overrides = {}) {
  return {
    findByID: vi.fn().mockResolvedValue(story),
    update: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as never;
}

const connected = {
  connected: true,
  pageId: "P",
  pageAccessToken: "TOK",
  instagramUserId: "IG1",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SITE_URL = "https://after2amstories.com";
});

describe("shareStoryToInstagram", () => {
  it("creates a container, publishes, and stores the media id", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createMediaContainer as ReturnType<typeof vi.fn>).mockResolvedValue("C1");
    (publishMedia as ReturnType<typeof vi.fn>).mockResolvedValue("M1");
    const payload = fakePayload();

    const result = await shareStoryToInstagram(payload, 1);

    expect(createMediaContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        igUserId: "IG1",
        imageUrl: "https://after2amstories.com/story/s/ig",
        caption: expect.stringContaining("H"),
      })
    );
    expect(result).toEqual({ postId: "M1" });
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { instagramPostId: "M1" },
        context: { skipInstagramAutoPost: true },
      })
    );
  });

  it("short-circuits when already shared", async () => {
    const payload = fakePayload({
      findByID: vi.fn().mockResolvedValue({ ...story, instagramPostId: "OLD" }),
    });
    const result = await shareStoryToInstagram(payload, 1);
    expect(result).toEqual({ postId: "OLD", alreadyShared: true });
    expect(createMediaContainer).not.toHaveBeenCalled();
  });

  it("errors when no Instagram account is linked", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...connected,
      instagramUserId: null,
    });
    await expect(shareStoryToInstagram(fakePayload(), 1)).rejects.toThrow(
      /Instagram/
    );
  });

  it("clears the connection on Graph error 190", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createMediaContainer as ReturnType<typeof vi.fn>).mockRejectedValue(
      new FacebookGraphError("expired", 190)
    );
    await expect(shareStoryToInstagram(fakePayload(), 1)).rejects.toThrow();
    expect(clearConnection).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/services/instagram/__tests__/share-story.test.ts`
Expected: FAIL — `shareStoryToInstagram` not exported.

- [ ] **Step 3: Add the implementation**

Append to `src/lib/services/instagram/share-story.ts` (keep the existing
`buildInstagramCaption`):

```ts
import type { Payload } from "payload";

import { FacebookGraphError } from "@/lib/services/facebook/client";
import { clearConnection, getConnection } from "@/lib/services/facebook/connection";
import { createMediaContainer, publishMedia } from "./client";

function igImageUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/story/${slug}/ig`;
}

export interface InstagramShareResult {
  postId: string;
  alreadyShared?: boolean;
}

/**
 * Publish a story to the connected Instagram business account: render the OG
 * image as the post media, create a media container, then publish it. The
 * `instagramPostId` guard prevents duplicate posts; an expired token (Graph
 * error 190) clears the connection so the admin is prompted to reconnect.
 */
export async function shareStoryToInstagram(
  payload: Payload,
  storyId: string | number
): Promise<InstagramShareResult> {
  const story = await payload.findByID({
    collection: "stories",
    id: storyId,
    depth: 0,
    overrideAccess: true,
  });
  if (!story) throw new Error("Story not found");
  if (story.instagramPostId) {
    return { postId: story.instagramPostId, alreadyShared: true };
  }

  const connection = await getConnection(payload);
  if (!connection.connected || !connection.pageAccessToken) {
    throw new Error("No Facebook Page is connected.");
  }
  if (!connection.instagramUserId) {
    throw new Error(
      "No Instagram business account is linked to the connected Page."
    );
  }
  if (!story.slug) throw new Error("Story has no slug");

  try {
    const creationId = await createMediaContainer({
      igUserId: connection.instagramUserId,
      pageAccessToken: connection.pageAccessToken,
      imageUrl: igImageUrl(story.slug),
      caption: buildInstagramCaption(story),
    });
    const postId = await publishMedia({
      igUserId: connection.instagramUserId,
      pageAccessToken: connection.pageAccessToken,
      creationId,
    });

    await payload.update({
      collection: "stories",
      id: storyId,
      data: { instagramPostId: postId },
      overrideAccess: true,
      context: { skipInstagramAutoPost: true },
    });

    return { postId };
  } catch (err) {
    if (err instanceof FacebookGraphError && err.code === 190) {
      await clearConnection(payload);
    }
    throw err;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/services/instagram/__tests__/share-story.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/services/instagram/share-story.ts src/lib/services/instagram/__tests__/share-story.test.ts
git commit -m "feat: shareStoryToInstagram orchestration"
```

---

## Task 7: Manual share API route + admin button

**Files:**
- Create: `src/app/(frontend)/api/instagram/share/route.ts`
- Create: `src/components/admin/InstagramShareButton.tsx`
- Modify: `src/app/(payload)/admin/importMap.js`

- [ ] **Step 1: Write the API route**

```ts
// src/app/(frontend)/api/instagram/share/route.ts
import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { shareStoryToInstagram } from "@/lib/services/instagram/share-story";

/** Manually share a story to the connected Instagram account. Admin-only. */
export async function POST(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { storyId?: string | number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.storyId) {
    return NextResponse.json({ error: "storyId is required" }, { status: 400 });
  }

  try {
    const result = await shareStoryToInstagram(payload, body.storyId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to share story";
    console.error("[instagram/share]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

- [ ] **Step 2: Write the admin button** (mirror of `FacebookShareButton`)

```tsx
// src/components/admin/InstagramShareButton.tsx
"use client";

import { Button, useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useState } from "react";

/**
 * Sidebar button on the Story edit view. Posts the current story to the
 * connected Instagram account on demand. Disabled until the story is published
 * and replaced with a confirmation once it has already been shared.
 */
export function InstagramShareButton() {
  const { id } = useDocumentInfo();
  const status = useFormFields(
    ([fields]) => fields?._status?.value as string | undefined
  );
  const existingPostId = useFormFields(
    ([fields]) => fields?.instagramPostId?.value as string | undefined
  );

  const [busy, setBusy] = useState(false);
  const [postId, setPostId] = useState<string | undefined>(existingPostId);
  const [error, setError] = useState<string | null>(null);

  if (!id) {
    return (
      <p style={{ opacity: 0.7, fontSize: "0.8rem" }}>
        Save the story to enable Instagram sharing.
      </p>
    );
  }

  if (postId) {
    return (
      <div>
        <p style={{ marginBottom: "0.25rem" }}>✓ Shared to Instagram</p>
        <a
          href={`https://www.instagram.com/p/${postId}`}
          target="_blank"
          rel="noreferrer"
        >
          View post
        </a>
      </div>
    );
  }

  async function share() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/instagram/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ storyId: id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Failed to share");
        return;
      }
      setPostId(json.postId);
    } catch {
      setError("Failed to share");
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || status !== "published";

  return (
    <div>
      <Button buttonStyle="secondary" onClick={share} disabled={disabled}>
        {busy ? "Sharing…" : "Share to Instagram"}
      </Button>
      {status !== "published" && (
        <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.25rem" }}>
          Publish the story first.
        </p>
      )}
      {error && (
        <p
          style={{
            color: "var(--theme-error-500)",
            fontSize: "0.8rem",
            marginTop: "0.25rem",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Register in importMap**

Open `src/app/(payload)/admin/importMap.js`. Mirror the existing
`FacebookShareButton` entry. Find the import line for `FacebookShareButton` and
add an analogous import, then add the matching key to the `importMap` object.
Use the same two patterns already present for `FacebookShareButton`, e.g.:

```js
import { InstagramShareButton as InstagramShareButton_0 } from '@/components/admin/InstagramShareButton'
```

and in the map object:

```js
  "/components/admin/InstagramShareButton#InstagramShareButton": InstagramShareButton_0,
```

(Match the existing suffix-numbering convention in the file; if Payload
regenerates this file via `payload generate:importmap`, running that is
equivalent.)

- [ ] **Step 4: Type-check**

Run: `pnpm exec tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(frontend)/api/instagram/share/route.ts" src/components/admin/InstagramShareButton.tsx "src/app/(payload)/admin/importMap.js"
git commit -m "feat: manual Instagram share route + admin button"
```

---

## Task 8: Collection fields + auto-post hook

**Files:**
- Create: `src/payload/hooks/publish-to-instagram.ts`
- Modify: `src/payload/collections/Stories.ts`

- [ ] **Step 1: Write the hook** (mirror of `publishToFacebook`)

```ts
// src/payload/hooks/publish-to-instagram.ts
import type { CollectionAfterChangeHook } from "payload";

import { shareStoryToInstagram } from "@/lib/services/instagram/share-story";

/**
 * Auto-post a story to the connected Instagram account the moment it
 * transitions to published, when auto-posting is enabled and it hasn't been
 * shared yet. Fire-and-forget: a Graph failure is logged but never blocks
 * saving, and the `instagramPostId` guard prevents duplicate posts.
 */
export const publishToInstagram: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  if (context?.skipInstagramAutoPost) return doc;

  const becamePublished =
    doc?._status === "published" && previousDoc?._status !== "published";
  if (!becamePublished) return doc;
  if (!doc?.autoPostToInstagram) return doc;
  if (doc?.instagramPostId) return doc;

  void shareStoryToInstagram(req.payload, doc.id).catch((err) => {
    req.payload.logger.error(
      { err },
      "[instagram] auto-post on publish failed"
    );
  });

  return doc;
};
```

- [ ] **Step 2: Wire the hook + add fields in `Stories.ts`**

Add the import near the existing `publishToFacebook` import (line ~8):

```ts
import { publishToInstagram } from "../hooks/publish-to-instagram";
```

Update the `afterChange` array (currently `[revalidateStory, publishToFacebook]`):

```ts
    afterChange: [revalidateStory, publishToFacebook, publishToInstagram],
```

Add these three fields directly after the `shareToFacebook` field (after line ~170, before the closing `]`):

```ts
    {
      name: "autoPostToInstagram",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Post to the connected Instagram account when published.",
      },
    },
    {
      name: "instagramPostId",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Set automatically after the story is posted to Instagram.",
      },
    },
    {
      name: "shareToInstagram",
      type: "ui",
      admin: {
        position: "sidebar",
        components: {
          Field:
            "/components/admin/InstagramShareButton#InstagramShareButton",
        },
      },
    },
```

- [ ] **Step 3: Type-check + full suite**

Run: `pnpm exec tsc --noEmit && pnpm test`
Expected: no new type errors; all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/payload/hooks/publish-to-instagram.ts src/payload/collections/Stories.ts
git commit -m "feat: Instagram auto-post hook + story fields"
```

---

## Task 9: Database migration

**Files:**
- Create: `src/migrations/20260616_000000_instagram_integration.sql`

- [ ] **Step 1: Write the migration** (mirror the Facebook migration's column naming — Payload snake_cases camelCase fields)

```sql
-- Instagram integration schema.
-- Adds Instagram auto-post controls to stories and the linked Instagram
-- account id to the facebook_connection global. Mirrors exactly what Payload's
-- dev push generates for these fields.

ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "auto_post_to_instagram" boolean DEFAULT true;
ALTER TABLE "stories" ADD COLUMN IF NOT EXISTS "instagram_post_id" varchar;

ALTER TABLE "facebook_connection" ADD COLUMN IF NOT EXISTS "instagram_user_id" varchar;
```

- [ ] **Step 2: Verify migration runner picks it up (dry inspection)**

Run: `ls src/migrations`
Expected: the new `20260616_000000_instagram_integration.sql` is listed after the Facebook one (lexical sort).

> NOTE: Do NOT run `pnpm migrate` against the configured `DATABASE_URL` here —
> per project memory the local `.env` `DATABASE_URL` points at the **production**
> database. Applying the migration is a deploy-time step. The runner is
> idempotent (`IF NOT EXISTS` + `payload_migrations` tracking).

- [ ] **Step 3: Commit**

```bash
git add src/migrations/20260616_000000_instagram_integration.sql
git commit -m "feat: migration for Instagram fields"
```

---

## Final verification

- [ ] **Step 1: Full test suite**

Run: `pnpm test`
Expected: all tests pass (prior 25 + new Instagram tests).

- [ ] **Step 2: Type-check + lint + build**

Run: `pnpm exec tsc --noEmit && pnpm lint && pnpm build`
Expected: clean. (Build also confirms the new route handlers compile.)

- [ ] **Step 3: Manual smoke (optional, requires connected account)**

In a deployed/preview environment with a reconnected Page + linked IG account:
publish a story → confirm an Instagram feed post appears with the OG image and
the link-in-bio caption, and `instagramPostId` is set on the story.

---

## Operational notes (carry into PR description)

- **Reconnect required:** existing Facebook connections were authorized without
  `instagram_basic` / `instagram_content_publish`. The admin must click "Connect
  Facebook Page" again to grant them and trigger Instagram-account discovery.
- **App Review:** `instagram_content_publish` requires Meta App Review for
  production use.
- **Account requirement:** the Instagram account must be Business/Creator and
  linked to the connected Page, or sharing returns a clear error.
- **Public image URL:** Instagram fetches `image_url` server-side, so auto-post
  only works where `/story/[slug]/ig` is publicly reachable (not localhost).
- **Rate limit:** 25 published posts per Instagram account per 24h.
