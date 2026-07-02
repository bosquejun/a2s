/**
 * Pure Lexical helpers (no Payload config dependency) so they can be safely
 * imported from collection hooks without creating an import cycle.
 */

type LexicalNode = {
  type?: string;
  text?: string;
  children?: LexicalNode[];
};

/** Flatten a Lexical editor state to plain text (for word/read-time counts). */
export function lexicalToPlainText(
  state?: { root?: LexicalNode } | null
): string {
  if (!state?.root) return "";

  const walk = (node?: LexicalNode): string => {
    if (!node) return "";
    if (node.type === "text") return node.text ?? "";
    if (node.type === "linebreak") return "\n";

    const inner = Array.isArray(node.children)
      ? node.children.map(walk).join("")
      : "";

    const blockTypes = ["paragraph", "heading", "quote", "listitem", "list"];
    return blockTypes.includes(node.type ?? "") ? `${inner}\n` : inner;
  };

  return walk(state.root)
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** Estimate word count and reading time (minutes) from plain text. */
export function computeReadingStats(text: string): {
  wordCount: number;
  readTime: number;
} {
  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));
  return { wordCount, readTime };
}
