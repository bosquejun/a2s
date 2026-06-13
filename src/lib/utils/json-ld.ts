import { absoluteUrl, SITE_URL } from "@/lib/seo";
import type { StorySummary } from "@/lib/types";

/**
 * Serialize structured data for a JSON-LD <script> tag.
 * `<` is escaped so values containing "</script>" can never break out of
 * the script element (stored XSS through structured data). Line/paragraph
 * separators are escaped because they are invalid in inline scripts.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Stable @id refs for the site-wide Organization / WebSite nodes (root layout). */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** A schema.org BreadcrumbList from an ordered list of crumbs. */
export function breadcrumbList(crumbs: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** An ItemList of story links \u2014 used on collection/listing pages. */
export function storyItemList(stories: StorySummary[]) {
  return {
    "@type": "ItemList",
    numberOfItems: stories.length,
    itemListElement: stories.map((story, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/story/${story.slug}`),
      name: story.title,
    })),
  };
}
