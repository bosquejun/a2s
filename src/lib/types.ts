import type { Category, Mood } from "@/lib/content/taxonomy";

/**
 * App-facing Story shape consumed by pages and the reader. This is normalized
 * from a Payload `stories` document (Lexical content rendered to HTML).
 */
export interface Story {
  id: string;
  title: string;
  slug: string;
  author?: string | null;
  excerpt?: string | null;
  /** Short, punchy one-line hook used on social share (OG) images. */
  hook?: string | null;
  /** Rendered HTML (converted from the Lexical `content` field). */
  content: string;
  mood: Mood;
  categories: Category[];
  tags: string[];
  intensity: number;
  readTime: number;
  wordCount: number;
  viewCount: number;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: string | null;
  } | null;
}

/** Lightweight Story shape used for feeds, cards and sitemaps. */
export interface StorySummary {
  id: string;
  title: string;
  slug: string;
  author?: string | null;
  excerpt?: string | null;
  mood: Mood;
  categories: Category[];
  tags: string[];
  readTime: number;
  viewCount: number;
  publishedAt?: string | null;
  updatedAt?: string | null;
}
