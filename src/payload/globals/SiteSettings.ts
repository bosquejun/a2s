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
      name: "linkInComment",
      type: "group",
      label: "Link in first comment",
      admin: {
        description:
          "Post the story link as the first comment instead of in the post body. " +
          "Platforms downrank posts that carry an outbound link, so commenting the " +
          "link can boost reach and engagement.",
      },
      fields: [
        {
          name: "facebook",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "Facebook: keep the link out of the post body and post it as the first comment instead.",
          },
        },
        {
          name: "instagram",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "Instagram: post the link as the first comment. Note: Instagram comments are not clickable.",
          },
        },
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
