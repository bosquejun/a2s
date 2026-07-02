import type { CollectionConfig } from "payload";
import {
  revalidateCollection,
  revalidateCollectionDelete,
} from "../hooks/revalidate-collection";
import { enrichCollection } from "../hooks/enrich-collection";

/**
 * Curated story collections ("seven stories for when you can't sleep").
 * The consolidation format from docs/seo-quality-roadmap.md Phase 2: long-form
 * pages that match real query intent and pass authority down to stories.
 * Drafts are enabled so agent-curated collections wait for human review;
 * nothing publishes without an editor pressing the button.
 */
export const Collections: CollectionConfig = {
  slug: "collections",
  labels: { singular: "Collection", plural: "Collections" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "_status", "publishedAt"],
    group: "Content",
  },
  access: {
    read: ({ req: { user } }) =>
      user ? true : { _status: { equals: "published" } },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 10,
  },
  hooks: {
    beforeChange: [enrichCollection],
    afterChange: [revalidateCollection],
    afterDelete: [revalidateCollectionDelete],
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Auto-generated from the title when left blank.",
      },
    },
    {
      name: "hook",
      type: "text",
      maxLength: 140,
      admin: {
        description: "One-line promise used on cards and social shares.",
      },
    },
    {
      name: "intro",
      type: "richText",
      required: true,
      admin: {
        description:
          "The editorial essay above the stories: 400-800 words, site voice, " +
          "written for the query the collection answers.",
      },
    },
    {
      name: "stories",
      type: "relationship",
      relationTo: "stories",
      hasMany: true,
      required: true,
      minRows: 3,
      admin: {
        description:
          "Ordered. 5-9 stories that genuinely cohere; fewer is a draft, not a collection.",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
  ],
};
