import { NextResponse } from "next/server";

import { getPayloadClient } from "@/lib/payload";
import { shareStoryToThreads } from "@/lib/services/threads/share-story";

/** Manually share a story to the connected Threads account. Admin-only. */
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
    const result = await shareStoryToThreads(payload, body.storyId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to share story";
    console.error("[threads/share]", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
