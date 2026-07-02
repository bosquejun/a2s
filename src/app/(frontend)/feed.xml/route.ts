import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { getAllPublishedStories } from "@/lib/services/stories/get-all-published-stories";

// Most recent stories only — a feed is a tail, not the whole archive.
const FEED_LIMIT = 50;

/** Escape the five XML predefined entities for safe text/attribute output. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS 2.0 feed of the newest published stories. Discoverable via the
 * `application/rss+xml` alternate link in the root layout metadata, and useful
 * for syndication, feed readers, and Google Discover ingestion.
 */
export async function GET() {
  const stories = await getAllPublishedStories(FEED_LIMIT);
  const feedUrl = absoluteUrl("/feed.xml");

  const items = stories
    .map((story) => {
      const url = absoluteUrl(`/story/${story.slug}`);
      const pubDate = new Date(
        story.publishedAt ?? story.updatedAt ?? Date.now()
      ).toUTCString();
      const creator = story.author
        ? `\n      <dc:creator>${escapeXml(story.author)}</dc:creator>`
        : "";

      return `    <item>
      <title>${escapeXml(story.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>${creator}
      <description>${escapeXml(story.excerpt ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-US</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
