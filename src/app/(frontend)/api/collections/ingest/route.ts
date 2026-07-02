import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { htmlToLexical } from "@/lib/content/html-to-lexical";
import { getPayloadClient } from "@/lib/payload";

/**
 * Ingest an agent-curated story collection as a DRAFT. Unlike story ingest,
 * this endpoint never publishes: collections are the site's highest-trust
 * search pages, so a human reviews and publishes each one in /admin
 * (docs/seo-quality-roadmap.md, Phase 2).
 *
 * Shares the story-generation bearer secret since the same routine
 * infrastructure calls both endpoints.
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

interface CollectionIngestInput {
  title: string;
  hook?: string;
  introHtml: string;
  storySlugs: string[];
  seo?: { title?: string; description?: string };
}

function parseInput(
  body: unknown
):
  | { ok: true; input: CollectionIngestInput }
  | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const raw = (body ?? {}) as Record<string, unknown>;

  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (title.length < 3 || title.length > 120) {
    errors.push("title: required, 3-120 characters");
  }

  const hook = typeof raw.hook === "string" ? raw.hook.trim() : undefined;
  if (hook && hook.length > 140) {
    errors.push("hook: at most 140 characters");
  }

  const introHtml =
    typeof raw.introHtml === "string" ? raw.introHtml.trim() : "";
  // ~400 words minimum is the roadmap bar; 1500 chars is a generous floor
  // that still rejects a one-liner posing as an essay.
  if (introHtml.length < 1500) {
    errors.push(
      "introHtml: required, at least ~400 words of HTML (<p> paragraphs)"
    );
  }

  const storySlugs = Array.isArray(raw.storySlugs)
    ? raw.storySlugs.filter((s): s is string => typeof s === "string")
    : [];
  if (storySlugs.length < 3 || storySlugs.length > 12) {
    errors.push("storySlugs: 3-12 published story slugs, in reading order");
  }
  if (new Set(storySlugs).size !== storySlugs.length) {
    errors.push("storySlugs: duplicates are not allowed");
  }

  const seoRaw = (raw.seo ?? undefined) as Record<string, unknown> | undefined;
  const seo = seoRaw
    ? {
        title: typeof seoRaw.title === "string" ? seoRaw.title : undefined,
        description:
          typeof seoRaw.description === "string"
            ? seoRaw.description
            : undefined,
      }
    : undefined;
  if (seo?.description && seo.description.length > 170) {
    errors.push("seo.description: at most 170 characters");
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, input: { title, hook, introHtml, storySlugs, seo } };
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

  const parsed = parseInput(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.errors.join("\n") },
      { status: 400 }
    );
  }
  const { input } = parsed;

  try {
    const payload = await getPayloadClient();

    // Resolve slugs to ids, preserving the curated order.
    const { docs: stories } = await payload.find({
      collection: "stories",
      where: {
        slug: { in: input.storySlugs },
        _status: { equals: "published" },
      },
      depth: 0,
      limit: input.storySlugs.length,
      pagination: false,
    });
    const idBySlug = new Map(
      stories.map((story) => [
        (story as { slug?: string }).slug ?? "",
        story.id,
      ])
    );
    const missing = input.storySlugs.filter((slug) => !idBySlug.has(slug));
    if (missing.length) {
      return NextResponse.json(
        { error: `Unknown or unpublished story slugs: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const intro = await htmlToLexical(input.introHtml);

    const collection = await payload.create({
      collection: "collections",
      draft: true,
      data: {
        title: input.title,
        hook: input.hook,
        intro,
        stories: input.storySlugs.map((slug) => idBySlug.get(slug)),
        _status: "draft",
        ...(input.seo
          ? {
              meta: {
                title: input.seo.title,
                description: input.seo.description,
              },
            }
          : {}),
      } as Record<string, unknown>,
    });

    return NextResponse.json(
      {
        id: collection.id,
        slug: (collection as { slug?: string }).slug,
        status: "draft",
        note: "Awaiting human review in /admin before publish.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Collection ingest failed", error);
    return NextResponse.json(
      { error: "Failed to create collection draft" },
      { status: 500 }
    );
  }
}
