import "server-only";

import type { Payload } from "payload";

/**
 * Whether the story link should be posted as the first comment (rather than in
 * the post body) for each platform. Driven by the `linkInComment` group on the
 * SiteSettings global so it can be toggled from the admin without a deploy.
 */
export interface LinkInCommentSettings {
  facebook: boolean;
  instagram: boolean;
}

/**
 * Read the link-in-comment toggles from SiteSettings. Reading settings must
 * never be the thing that blocks a share, so any failure (missing global,
 * unmigrated column) falls back to "off" for every platform.
 */
export async function getLinkInCommentSettings(
  payload: Payload
): Promise<LinkInCommentSettings> {
  try {
    const settings = await payload.findGlobal({
      slug: "site-settings",
      overrideAccess: true,
      depth: 0,
    });
    const group = (
      settings as {
        linkInComment?: {
          facebook?: boolean | null;
          instagram?: boolean | null;
        };
      }
    )?.linkInComment;
    return {
      facebook: Boolean(group?.facebook),
      instagram: Boolean(group?.instagram),
    };
  } catch {
    return { facebook: false, instagram: false };
  }
}
