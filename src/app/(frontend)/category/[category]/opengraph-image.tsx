import {
  CATEGORIES,
  CATEGORY_ACCENTS,
  CATEGORY_LABELS,
  CATEGORY_TAGLINES,
  type Category,
} from "@/lib/content/taxonomy";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  pageOgImage,
  siteOgImage,
} from "@/lib/og/og-kit";

export const alt = "After 2AM Stories";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Pre-render one card per category at build time. */
export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.toLowerCase() }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryParam } = await params;
  const category = categoryParam.toUpperCase() as Category;

  // Unknown category → fall back to the brand card.
  if (!CATEGORIES.includes(category)) {
    return siteOgImage();
  }

  return pageOgImage({
    title: CATEGORY_LABELS[category],
    subtitle: CATEGORY_TAGLINES[category],
    accent: CATEGORY_ACCENTS[category],
  });
}
