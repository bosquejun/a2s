import { getPayloadClient } from "@/lib/payload";
import { renderCarouselSlideJpeg } from "@/lib/services/instagram/carousel-image";
import { planCarouselSlides } from "@/lib/services/instagram/carousel-plan";
import { getLinkInCommentSettings } from "@/lib/services/social/settings";
import { getStoryBySlug } from "@/lib/services/stories/get-story";

/**
 * One slide of a story's Instagram carousel (`/story/[slug]/ig/carousel/[index]`).
 * The plan is deterministic, so each index always maps to the same slide; the
 * Instagram share flow references these URLs as the carousel's child media.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; index: string }> }
) {
  const { slug, index } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return new Response("Not found", { status: 404 });

  const slides = planCarouselSlides(story);
  const i = Number.parseInt(index, 10);
  if (!Number.isInteger(i) || i < 0 || i >= slides.length) {
    return new Response("Not found", { status: 404 });
  }

  // Only the CTA slide's wording depends on the link-in-comment toggle, so we
  // avoid the settings read for every content slide Instagram fetches.
  const linkInComment =
    slides[i].kind === "cta"
      ? (await getLinkInCommentSettings(await getPayloadClient())).instagram
      : false;
  const jpeg = await renderCarouselSlideJpeg(story, slides[i], {
    linkInComment,
  });
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "public, max-age=3600",
    },
  });
}
