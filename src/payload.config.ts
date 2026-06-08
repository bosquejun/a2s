import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "./payload/collections/Media";
import { Stories } from "./payload/collections/Stories";
import { StoryRequests } from "./payload/collections/StoryRequests";
import { Tags } from "./payload/collections/Tags";
import { Users } from "./payload/collections/Users";
import { SiteSettings } from "./payload/globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: " — After 2AM Stories",
    },
  },
  collections: [Stories, StoryRequests, Tags, Media, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
  }),
  sharp,
  // Payload's REST/GraphQL live under /payload-api so they don't collide with
  // the app's existing /api/* routes. The frontend mostly uses the Local API.
  routes: {
    api: "/payload-api",
  },
  plugins: [
    seoPlugin({
      collections: ["stories"],
      uploadsCollection: "media",
      generateTitle: ({ doc }: { doc?: { title?: string } }) =>
        doc?.title ? `${doc.title} — After 2AM` : "After 2AM Stories",
      generateDescription: ({ doc }: { doc?: { excerpt?: string } }) =>
        doc?.excerpt ?? "",
    }),
  ],
});
