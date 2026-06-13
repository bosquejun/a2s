import { getViewCount } from "@/lib/services/stories/view-count";
import { NextResponse } from "next/server";

// Live, uncached read — the cached story page HTML can be hours stale. Under
// Cache Components a route handler is dynamic by default (no `'use cache'`), so
// no segment config is needed; `export const dynamic` is rejected by the build.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const views = await getViewCount(slug);
    if (views === null) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ views });
  } catch (error) {
    console.error("Failed to read view count", error);
    return NextResponse.json({ error: "Unavailable" }, { status: 500 });
  }
}
