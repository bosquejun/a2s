/**
 * Serialize structured data for a JSON-LD <script> tag.
 * `<` is escaped so values containing "</script>" can never break out of
 * the script element (stored XSS through structured data). Line/paragraph
 * separators are escaped because they are invalid in inline scripts.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
