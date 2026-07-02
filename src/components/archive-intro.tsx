import type { ArchiveCopy } from "@/lib/content/archive-copy";

interface ArchiveIntroProps {
  copy: ArchiveCopy;
}

/**
 * Editorial intro for archive pages. The lede stays visible; the remaining
 * paragraphs sit inside a native <details> disclosure so the reading surface
 * stays quiet while the full text still ships in the HTML for crawlers
 * (collapsed content is indexed at full weight under mobile-first indexing).
 */
export function ArchiveIntro({ copy }: ArchiveIntroProps) {
  const [lede, ...rest] = copy.intro;
  if (!lede) return null;

  return (
    <section className="mx-auto mb-12 max-w-2xl animate-fade-up">
      <p className="text-center font-serif text-base italic leading-relaxed text-muted-foreground sm:text-lg">
        {lede}
      </p>

      {rest.length > 0 && (
        <details className="group mt-5">
          <summary className="cursor-pointer list-none text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50 transition-colors hover:text-foreground/70 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">about these stories</span>
            <span className="hidden group-open:inline">fold it away</span>
          </summary>
          <div className="mt-5 space-y-4 text-left text-sm leading-relaxed text-muted-foreground/80">
            {rest.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
