import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Category, Mood } from "@/lib/content/taxonomy";
import type { Story, StoryCollection, StorySummary } from "@/lib/types";
import { sanitizeStoryHtml } from "@/lib/utils/sanitize-story-html";

/**
 * A loosely-typed Payload `stories` document. We avoid depending on the
 * generated `payload-types` here so the app compiles without the generated
 * file (Payload regenerates it on dev startup).
 */
export type StoryDoc = {
  id: string | number;
  title: string;
  slug: string;
  author?: string | null;
  excerpt?: string | null;
  hook?: string | null;
  content?: SerializedEditorState | null;
  mood: string;
  categories?: string[] | null;
  intensity?: number | null;
  readTime?: number | null;
  wordCount?: number | null;
  viewCount?: number | null;
  tags?: Array<string | number | { name?: string }> | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  meta?: {
    title?: string | null;
    description?: string | null;
    image?: { url?: string | null } | string | number | null;
  } | null;
};

function tagNames(tags: StoryDoc["tags"]): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => (typeof t === "object" && t ? (t.name ?? "") : ""))
    .filter(Boolean);
}

function contentToHtml(content?: SerializedEditorState | null): string {
  if (!content) return "";
  try {
    // Every consumer renders this HTML with dangerouslySetInnerHTML, so it
    // is funneled through the allowlist sanitizer here — a tampered DB row
    // or prompt-injected agent output cannot become stored XSS.
    return sanitizeStoryHtml(
      convertLexicalToHTML({ data: content, disableContainer: true })
    );
  } catch {
    return "";
  }
}

/** Normalize a Payload story document into the app `Story` shape. */
export function normalizeStory(doc: StoryDoc): Story {
  const image =
    doc.meta?.image && typeof doc.meta.image === "object"
      ? (doc.meta.image.url ?? null)
      : null;

  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    author: doc.author ?? null,
    excerpt: doc.excerpt ?? null,
    hook: doc.hook ?? null,
    content: contentToHtml(doc.content),
    mood: doc.mood as Mood,
    categories: (doc.categories ?? []) as Category[],
    tags: tagNames(doc.tags),
    intensity: doc.intensity ?? 3,
    readTime: doc.readTime ?? 1,
    wordCount: doc.wordCount ?? 0,
    viewCount: doc.viewCount ?? 0,
    publishedAt: doc.publishedAt ?? null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
    seo: {
      title: doc.meta?.title ?? null,
      description: doc.meta?.description ?? null,
      image,
    },
  };
}

/** Normalize a Payload story document into a lightweight summary. */
export function normalizeStorySummary(doc: StoryDoc): StorySummary {
  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    author: doc.author ?? null,
    excerpt: doc.excerpt ?? null,
    mood: doc.mood as Mood,
    categories: (doc.categories ?? []) as Category[],
    tags: tagNames(doc.tags),
    readTime: doc.readTime ?? 1,
    viewCount: doc.viewCount ?? 0,
    publishedAt: doc.publishedAt ?? null,
    updatedAt: doc.updatedAt ?? null,
  };
}

/** A loosely-typed Payload `collections` document (see StoryDoc note above). */
export type CollectionDoc = {
  id: string | number;
  title: string;
  slug: string;
  hook?: string | null;
  intro?: SerializedEditorState | null;
  stories?: Array<string | number | { id?: string | number }> | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  meta?: {
    title?: string | null;
    description?: string | null;
  } | null;
};

/**
 * Normalize a Payload collection document. Member stories are resolved
 * against the published-story cache (`storiesById`) rather than a deep
 * populate, so drafts and unpublished members silently drop out and the
 * summaries carry properly-populated tags.
 */
export function normalizeStoryCollection(
  doc: CollectionDoc,
  storiesById: ReadonlyMap<string, StorySummary>
): StoryCollection {
  const stories = (doc.stories ?? [])
    .map((entry) =>
      typeof entry === "object" && entry
        ? String(entry.id ?? "")
        : String(entry)
    )
    .map((id) => storiesById.get(id))
    .filter((story): story is StorySummary => Boolean(story));

  return {
    id: String(doc.id),
    title: doc.title,
    slug: doc.slug,
    hook: doc.hook ?? null,
    introHtml: contentToHtml(doc.intro),
    stories,
    publishedAt: doc.publishedAt ?? null,
    updatedAt: doc.updatedAt ?? null,
    seo: doc.meta
      ? {
          title: doc.meta.title ?? null,
          description: doc.meta.description ?? null,
        }
      : null,
  };
}
