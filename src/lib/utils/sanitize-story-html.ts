import sanitizeHtml from "sanitize-html";

/**
 * Story content is stored as HTML (produced by the NightWriter agent or the
 * Tiptap editor) and rendered with dangerouslySetInnerHTML. Everything is
 * funneled through this allowlist on the server before it reaches the
 * reader, so a compromised row or a prompt-injected agent response cannot
 * become stored XSS.
 */
const STORY_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "del",
    "mark",
    "sub",
    "sup",
    "span",
    "a",
    "ul",
    "ol",
    "li",
    "pre",
    "code",
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "rel"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    code: ["class"],
    pre: ["class"],
  },
  allowedSchemes: ["https", "http", "mailto"],
  // Force safe link behavior regardless of what was stored.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    }),
  },
  disallowedTagsMode: "discard",
};

export function sanitizeStoryHtml(html: string): string {
  return sanitizeHtml(html, STORY_SANITIZE_OPTIONS);
}

/** Plain-text projection of story HTML (for JSON-LD articleBody, etc.). */
export function storyHtmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}
