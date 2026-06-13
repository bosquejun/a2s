import { redis } from "@/lib/redis";
import { incrementViewCount } from "@/lib/services/stories/view-count";
import { Ratelimit } from "@upstash/ratelimit";
import { NextResponse } from "next/server";

// Cap how often one client can inflate a single story's count.
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "a2s:stories:view",
  ephemeralCache: process.env.NODE_ENV === "production" ? new Map() : false,
});

/**
 * Only count views from the production deploy. `.env` points at the prod DB,
 * so local dev and Vercel preview loads would otherwise inflate real counts.
 * `NODE_ENV` is "production" on preview too, so `VERCEL_ENV` is the precise gate.
 */
function isProductionDeploy(): boolean {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  return env === "production";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!isProductionDeploy()) {
    return new NextResponse(null, { status: 204 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

  const { success } = await ratelimit.limit(`${ip}:${slug}`);
  if (!success) {
    return new NextResponse(null, { status: 429 });
  }

  try {
    await incrementViewCount(slug);
  } catch (error) {
    // Fire-and-forget: a failed view must never surface to the reader.
    console.error("Failed to increment view count", error);
  }

  return new NextResponse(null, { status: 204 });
}
