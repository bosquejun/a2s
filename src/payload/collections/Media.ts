import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "og", width: 1200, height: 630, position: "centre" },
      { name: "card", width: 768, height: 480, position: "centre" },
    ],
  },
  fields: [{ name: "alt", type: "text" }],
};
