import type { CollectionBeforeChangeHook } from "payload";
import slugify from "slugify";
import {
  computeReadingStats,
  lexicalToPlainText,
} from "../../lib/content/lexical";

/**
 * Keep derived Story fields in sync on every write: slug from title,
 * word count + read time from the body, and a publish timestamp.
 *
 * Slugs are deduplicated against existing stories (drafts included) so
 * AI-generated titles that repeat don't trip the unique index and fail
 * the generation workflow.
 */
export const enrichStory: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  if (data.title && !data.slug) {
    const base =
      slugify(data.title, { lower: true, strict: true, locale: "en" }) ||
      "untitled";

    let candidate = base;
    for (let attempt = 2; ; attempt++) {
      const existing = await req.payload.find({
        collection: "stories",
        where: { slug: { equals: candidate } },
        limit: 1,
        depth: 0,
        draft: true,
      });
      const match = existing.docs[0];
      if (!match || (originalDoc && match.id === originalDoc.id)) break;

      if (attempt > 20) {
        // Pathological duplication — fall back to a timestamp suffix.
        candidate = `${base}-${Date.now().toString(36)}`;
        break;
      }
      candidate = `${base}-${attempt}`;
    }

    data.slug = candidate;
  }

  if (data.content) {
    const text = lexicalToPlainText(data.content);
    const { wordCount, readTime } = computeReadingStats(text);
    data.wordCount = wordCount;
    data.readTime = readTime;
  }

  if (data._status === "published" && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }

  return data;
};
