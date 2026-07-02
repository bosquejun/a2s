import { featureFlags } from "@/lib/feature-flags";
import { getPayloadClient } from "@/lib/payload";
import { redis } from "@/lib/redis";
import { triggerWorkflow } from "@/lib/workflow-client/client";
import { getAnonId } from "@/utils/get-anon-id";
import { generateTrackCode } from "@/utils/track-code";
import { createStoryRequestSchema } from "@/validations/story.validation";
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";

// Allow 1 submission per day per anonymous identity.
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, "1 d"),
  prefix: "a2s:stories:write",
  enableProtection: true,
  ephemeralCache: process.env.NODE_ENV === "production" ? new Map() : false,
});

export async function POST(request: Request) {
  if (!featureFlags.whisper) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const validated = createStoryRequestSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      {
        error: validated.error.issues.map((issue) => issue.message).join("\n"),
      },
      { status: 400 }
    );
  }

  // Rate-limit per anon cookie; if the cookie is missing (cleared or
  // blocked), fall back to the client IP so cookieless clients neither
  // share one bucket nor bypass the limit entirely.
  let anonId = await getAnonId();
  if (anonId === "anon_unknown") {
    const forwardedFor = request.headers.get("x-forwarded-for");
    anonId = `ip_${forwardedFor?.split(",")[0]?.trim() || "unknown"}`;
  }

  try {
    const { success } = await ratelimit.limit(anonId);

    if (!success) {
      return NextResponse.json(
        { error: "Writing request limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const payload = await getPayloadClient();
    const storyRequest = await payload.create({
      collection: "story-requests",
      data: {
        content: validated.data.content,
        trackCode: generateTrackCode(),
        status: "PENDING",
      },
    });

    await triggerWorkflow("writeStory", {
      trackCode: storyRequest.trackCode as string,
    });

    return NextResponse.json(storyRequest);
  } catch (error) {
    await ratelimit.resetUsedTokens(anonId);
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit story. Please try again later." },
      { status: 500 }
    );
  }
}
