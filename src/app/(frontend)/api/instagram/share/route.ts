import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import type { InstagramPostFormat } from "@/lib/services/instagram/carousel-plan";
import { shareStoryToInstagram } from "@/lib/services/instagram/share-story";

/** Manually share a story to the connected Instagram account. Admin-only. */
export async function POST(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { storyId?: string | number; format?: InstagramPostFormat };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.storyId) {
    return NextResponse.json({ error: "storyId is required" }, { status: 400 });
  }

  const format: InstagramPostFormat =
    body.format === "carousel" ? "carousel" : "image";

  try {
    const result = await shareStoryToInstagram(payload, body.storyId, {
      format,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to share story";
    console.error("[instagram/share]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
