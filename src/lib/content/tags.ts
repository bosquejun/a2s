/**
 * Tag URL helpers. Tags are free-form strings entered by the writer/editor
 * agents, so the public tag routes key off a normalized slug rather than the
 * raw value. Slugging is intentionally lossy (case-insensitive, spaces and
 * punctuation collapsed to hyphens); matching back to stories is always done by
 * comparing slugs, so distinct tags that normalize the same share one page.
 */
export function tagToSlug(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
