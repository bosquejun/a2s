import "server-only";

import { CATEGORY_ACCENTS } from "@/lib/content/taxonomy";
import { carouselContentImage, carouselCtaImage } from "@/lib/og/ig-carousel";
import { storyOgImage } from "@/lib/og/og-kit";
import type { Story } from "@/lib/types";

import { toJpeg, toSquareJpeg } from "./ig-image";
import type { CarouselSlide } from "./carousel-plan";

/**
 * Render a single carousel slide to a 1080×1080 JPEG. The cover reuses the OG
 * card (letterboxed onto the square canvas); body and CTA slides are rendered
 * natively square, so they only need re-encoding to JPEG.
 */
export async function renderCarouselSlideJpeg(
  story: Story,
  slide: CarouselSlide
): Promise<Buffer> {
  if (slide.kind === "cover") {
    const og = await storyOgImage(story);
    return toSquareJpeg(Buffer.from(await og.arrayBuffer()));
  }

  const accent = story.categories[0]
    ? CATEGORY_ACCENTS[story.categories[0]]
    : undefined;
  const image =
    slide.kind === "content"
      ? await carouselContentImage({
          text: slide.text,
          page: slide.page,
          pageCount: slide.pageCount,
          accent,
        })
      : await carouselCtaImage({ accent });
  return toJpeg(Buffer.from(await image.arrayBuffer()));
}
