import type { CollectionConfig } from "payload";
import {
  CATEGORY_LABELS,
  MOOD_LABELS,
  toSelectOptions,
} from "../../lib/content/taxonomy";
import { enrichStory } from "../hooks/enrich-story";
import { publishToFacebook } from "../hooks/publish-to-facebook";
import { publishToInstagram } from "../hooks/publish-to-instagram";
import { revalidateStory, revalidateStoryDelete } from "../hooks/revalidate";

export const Stories: CollectionConfig = {
  slug: "stories",
  labels: { singular: "Story", plural: "Stories" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "mood", "author", "_status", "publishedAt"],
    group: "Content",
  },
  access: {
    // Public reads are limited to published stories; signed-in editors see all.
    read: ({ req: { user } }) =>
      user ? true : { _status: { equals: "published" } },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  versions: {
    drafts: { autosave: false },
    maxPerDoc: 20,
  },
  hooks: {
    beforeChange: [enrichStory],
    afterChange: [revalidateStory, publishToFacebook, publishToInstagram],
    afterDelete: [revalidateStoryDelete],
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
      name: "author",
      type: "text",
      admin: {
        description: "Anonymous, lowercase username (e.g. quiet.hours).",
      },
    },
    { name: "excerpt", type: "textarea", maxLength: 200 },
    {
      name: "hook",
      type: "text",
      maxLength: 120,
      admin: {
        description:
          "Short, punchy one-line hook used on social share (OG) images.",
      },
    },
    { name: "content", type: "richText", required: true },
    {
      type: "row",
      fields: [
        {
          name: "mood",
          type: "select",
          required: true,
          index: true,
          options: toSelectOptions(MOOD_LABELS),
        },
        {
          name: "intensity",
          type: "number",
          min: 1,
          max: 5,
          defaultValue: 3,
          admin: { description: "1 (cozy) → 5 (intense, non-graphic)." },
        },
      ],
    },
    {
      name: "categories",
      type: "select",
      hasMany: true,
      options: toSelectOptions(CATEGORY_LABELS),
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "readTime",
          type: "number",
          admin: { readOnly: true, description: "Minutes (auto)." },
        },
        {
          name: "wordCount",
          type: "number",
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: "notes",
      type: "textarea",
      admin: { description: "Moderation notes (AI or human)." },
    },
    {
      name: "viewCount",
      type: "number",
      defaultValue: 0,
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Total views (auto, updated outside the admin).",
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
    {
      name: "storyRequest",
      type: "relationship",
      relationTo: "story-requests",
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "autoPostToFacebook",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Post to the connected Facebook Page when published.",
      },
    },
    {
      name: "facebookPostId",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Set automatically after the story is posted to Facebook.",
      },
    },
    {
      name: "shareToFacebook",
      type: "ui",
      admin: {
        position: "sidebar",
        components: {
          Field: "/components/admin/FacebookShareButton#FacebookShareButton",
        },
      },
    },
    {
      name: "autoPostToInstagram",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Post to the connected Instagram account when published.",
      },
    },
    {
      name: "instagramPostId",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Set automatically after the story is posted to Instagram.",
      },
    },
    {
      name: "shareToInstagram",
      type: "ui",
      admin: {
        position: "sidebar",
        components: {
          Field:
            "/components/admin/InstagramShareButton#InstagramShareButton",
        },
      },
    },
  ],
};
