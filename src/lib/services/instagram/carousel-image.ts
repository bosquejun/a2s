import "server-only";

import { CATEGORY_ACCENTS } from "@/lib/content/taxonomy";
import {
  carouselContentImage,
  carouselCoverImage,
  carouselCtaImage,
} from "@/lib/og/ig-carousel";
import type { Story } from "@/lib/types";

import { toJpeg } from "./ig-image";
import type { CarouselSlide } from "./carousel-plan";

/**
 * Render a single carousel slide to a 1080×1080 JPEG. Every slide is rendered
 * natively square, so the result only needs re-encoding to JPEG (the format
 * Instagram's content API requires).
 */
export async function renderCarouselSlideJpeg(
  story: Story,
  slide: CarouselSlide
): Promise<Buffer> {
  const accent = story.categories[0]
    ? CATEGORY_ACCENTS[story.categories[0]]
    : undefined;

  let image;
  if (slide.kind === "cover") {
    image = await carouselCoverImage(story);
  } else if (slide.kind === "content") {
    image = await carouselContentImage({
      text: slide.text,
      page: slide.page,
      pageCount: slide.pageCount,
      accent,
    });
  } else {
    image = await carouselCtaImage({ accent });
  }
  return toJpeg(Buffer.from(await image.arrayBuffer()));
}
