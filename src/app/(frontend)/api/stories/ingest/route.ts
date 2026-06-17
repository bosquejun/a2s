import { timingSafeEqual } from "crypto";
import slugify from "slugify";
import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { ingestStory } from "@/lib/services/stories/ingest-story";
import { parseIngestRequest } from "@/lib/services/stories/ingest-request";

/**
 * Publishing a story is an operator action (the Claude generation routine calls
 * this), so it requires a bearer secret. Set STORY_GENERATION_SECRET in the
 * environment.
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

/**
 * Ingest a Claude-authored story and publish it. The body is validated against
 * the same schema the night-writer agent produced, then handed to ingestStory,
 * keeping generated stories consistent with the Payload Stories schema.
 */
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
    return NextResponse.json(
      { error: parsed.errors.join("\n") },
      { status: 400 }
    );
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

    const story = await ingestStory(parsed.input, {
      publish: true,
      scheduleSocialForNightWindow: true,
    });
    return NextResponse.json(
      { id: String(story.id), slug: story.slug },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/stories/ingest] ingest failed", error);
    return NextResponse.json(
      { error: "Failed to ingest story" },
      { status: 500 }
    );
  }
}
