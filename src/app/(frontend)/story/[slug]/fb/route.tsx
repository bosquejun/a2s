import sharp from "sharp";

import { getStoryBySlug } from "@/lib/services/stories/get-story";
import { storyOgImage } from "@/lib/og/og-kit";

/**
 * Facebook feed image for a story (`/story/[slug]/fb`). Renders the same OG hook
 * card as the social link preview, then encodes it as a 1200×630 JPEG — the
 * landscape format Facebook's Page photo publishing prefers. Referenced as the
 * `url` when posting a single photo to a Facebook Page.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  const og = await storyOgImage(story);
  const png = Buffer.from(await og.arrayBuffer());
  const jpeg = await sharp(png).jpeg({ quality: 90 }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "public, max-age=3600",
    },
  });
}
