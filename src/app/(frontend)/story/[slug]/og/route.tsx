import { getStoryBySlug } from "@/lib/services/stories/get-story";
import { storyOgImage } from "@/lib/og/og-kit";

/**
 * Stable OG/Twitter card endpoint for a story (`/story/[slug]/og`). Unlike the
 * hashed `opengraph-image` metadata route, this URL is predictable, so it can
 * be referenced from `generateMetadata`, the Article JSON-LD and the sitemap.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  return storyOgImage(story);
}
