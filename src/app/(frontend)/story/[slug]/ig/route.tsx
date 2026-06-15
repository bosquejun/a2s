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
