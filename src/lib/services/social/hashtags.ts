import { CATEGORY_LABELS, type Category } from "@/lib/content/taxonomy";

/** Always-on brand hashtag, prepended to every set. */
const BRAND_HASHTAG = "After2AM";

/**
 * Collapse an arbitrary label ("True Crime", "HORROR", "miss-someone") into a
 * single CamelCase hashtag token (no leading `#`). Punctuation and spaces are
 * dropped so the result is a valid, readable tag; returns "" when nothing
 * usable remains.
 */
function toToken(text: string): string {
  const cleaned = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "") // strip diacritics
    .replace(/[^a-zA-Z0-9\s]/g, " ") // punctuation -> space
    .trim();
  if (!cleaned) return "";
  return cleaned
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export interface HashtagSource {
  /** Story category values (e.g. "HORROR"); mapped to their display label. */
  categories?: (string | null | undefined)[] | null;
  /** Editorial tag names (e.g. "true crime"). */
  tags?: (string | null | undefined)[] | null;
}

/**
 * Build a deterministic, deduped set of hashtags from a story's taxonomy, led
 * by the brand tag and capped at `max`. Categories come first (most relevant
 * for discovery), then editorial tags. Returns a space-joined string like
 * "#After2AM #Horror #Confession", or "" when nothing usable.
 */
export function buildHashtags(source: HashtagSource, max = 8): string {
  if (max <= 0) return "";

  const seen = new Set<string>();
  const tokens: string[] = [];

  const add = (raw: string) => {
    const token = toToken(raw);
    if (!token) return;
    const key = token.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    tokens.push(token);
  };

  add(BRAND_HASHTAG);
  for (const c of source.categories ?? []) {
    if (c) add(CATEGORY_LABELS[c as Category] ?? c);
  }
  for (const t of source.tags ?? []) {
    if (t) add(t);
  }

  return tokens
    .slice(0, max)
    .map((t) => `#${t}`)
    .join(" ");
}

/**
 * Normalize Payload relationship/select values into plain strings. Tags arrive
 * as populated `{ name }` objects (depth >= 1) or bare ids; categories arrive
 * as plain strings. `key` selects the field to read from object entries.
 */
export function extractNames(value: unknown, key = "name"): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object" && key in entry) {
        const v = (entry as Record<string, unknown>)[key];
        return typeof v === "string" ? v : "";
      }
      return "";
    })
    .filter((s): s is string => Boolean(s));
}
