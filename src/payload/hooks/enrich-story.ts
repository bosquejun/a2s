import type { CollectionBeforeChangeHook } from "payload";
import slugify from "slugify";
import {
  computeReadingStats,
  lexicalToPlainText,
} from "../../lib/content/lexical";

/**
 * Keep derived Story fields in sync on every write: slug from title,
 * word count + read time from the body, and a publish timestamp.
 */
export const enrichStory: CollectionBeforeChangeHook = ({ data }) => {
  if (data.title && !data.slug) {
    data.slug = slugify(data.title, {
      lower: true,
      strict: true,
      locale: "en",
    });
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
