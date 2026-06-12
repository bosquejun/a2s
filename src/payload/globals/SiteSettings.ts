import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Settings",
  admin: { group: "Settings" },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "siteTitle", type: "text", defaultValue: "After 2AM Stories" },
    {
      name: "tagline",
      type: "text",
      defaultValue: "Midnight whispers & late night confessions",
    },
    { name: "description", type: "textarea" },
    {
      name: "featuredStory",
      type: "relationship",
      relationTo: "stories",
      admin: { description: "Pinned to the top of the home feed." },
    },
    {
      name: "social",
      type: "array",
      fields: [
        { name: "platform", type: "text" },
        { name: "url", type: "text" },
      ],
    },
    {
      name: "nightGate",
      type: "group",
      admin: {
        description: "Soft, atmospheric gate shown outside late-night hours.",
      },
      fields: [
        { name: "enabled", type: "checkbox", defaultValue: true },
        { name: "startHour", type: "number", defaultValue: 0, min: 0, max: 23 },
        { name: "endHour", type: "number", defaultValue: 5, min: 0, max: 23 },
        {
          name: "message",
          type: "text",
          defaultValue: "This feels better after midnight.",
        },
      ],
    },
  ],
};
