import type { CollectionBeforeChangeHook } from "payload";
import slugify from "slugify";

/**
 * Derived Collection fields: slug from title (deduplicated the same way
 * stories are, so agent-drafted titles that repeat don't trip the unique
 * index) and a publish timestamp on first publish.
 */
export const enrichCollection: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  if (data.title && !data.slug) {
    const base =
      slugify(data.title, { lower: true, strict: true, locale: "en" }) ||
      "collection";

    let candidate = base;
    for (let attempt = 2; ; attempt++) {
      const existing = await req.payload.find({
        collection: "collections",
        where: { slug: { equals: candidate } },
        limit: 1,
        depth: 0,
        draft: true,
      });
      const match = existing.docs[0];
      if (!match || (originalDoc && match.id === originalDoc.id)) break;

      if (attempt > 20) {
        candidate = `${base}-${Date.now().toString(36)}`;
        break;
      }
      candidate = `${base}-${attempt}`;
    }

    data.slug = candidate;
  }

  if (data._status === "published" && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }

  return data;
};
