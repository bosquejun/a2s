/**
 * The After 2AM crescent mark — same shape as the logo. Uses currentColor so it
 * adapts to its context (muted in the footer, accent in the header).
 */
export function MoonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <mask id="moonmark">
        <circle cx="18" cy="20" r="13" fill="#fff" />
        <circle cx="24" cy="15" r="11" fill="#000" />
      </mask>
      <circle
        cx="18"
        cy="20"
        r="13"
        fill="currentColor"
        mask="url(#moonmark)"
      />
    </svg>
  );
}
