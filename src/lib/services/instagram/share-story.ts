import "server-only";

const LINK_IN_BIO = "Read the full story — link in bio 🔗";

/**
 * Instagram captions cannot contain clickable links, so the caption leads with
 * the story's social hook (or excerpt/title) and points readers to the bio.
 */
export function buildInstagramCaption(story: {
  hook?: string | null;
  excerpt?: string | null;
  title: string;
}): string {
  const lead = story.hook || story.excerpt || story.title;
  return `${lead}\n\n${LINK_IN_BIO}`;
}
