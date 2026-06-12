import type { CollectionConfig } from "payload";
import { STORY_REQUEST_STATUSES } from "../../lib/content/taxonomy";

/**
 * Reader-submitted "whispers" awaiting editorial review. Public access is
 * intentionally closed — the frontend reads/writes these via the Local API
 * with overridden access (e.g. tracking by trackCode).
 */
export const StoryRequests: CollectionConfig = {
  slug: "story-requests",
  labels: { singular: "Story Request", plural: "Story Requests" },
  admin: {
    useAsTitle: "trackCode",
    defaultColumns: ["trackCode", "status", "createdAt"],
    group: "Content",
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "content", type: "textarea", required: true },
    { name: "author", type: "text" },
    {
      name: "status",
      type: "select",
      defaultValue: "PENDING",
      options: STORY_REQUEST_STATUSES.map((value) => ({ label: value, value })),
    },
    { name: "notes", type: "textarea" },
    {
      name: "trackCode",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    { name: "approvedAt", type: "date" },
    { name: "story", type: "relationship", relationTo: "stories" },
  ],
};
