import Link from "next/link";
import { Clock } from "lucide-react";
import { CATEGORY_LABELS, MOOD_LABELS } from "@/lib/content/taxonomy";
import type { StorySummary } from "@/lib/types";

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StoryCard({ story }: { story: StorySummary }) {
  const date = formatDate(story.publishedAt);
  const primaryCategory = story.categories[0];

  return (
    <Link
      href={`/story/${story.slug}`}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/30 p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 hover:border-indigo-400/30 hover:bg-card/60 hover:shadow-[0_0_40px_-12px_rgba(129,140,248,0.25)]"
    >
      <div className="flex items-center gap-2.5 text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
        <span className="text-indigo-300/80">{MOOD_LABELS[story.mood]}</span>
        {primaryCategory && (
          <>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{CATEGORY_LABELS[primaryCategory]}</span>
          </>
        )}
      </div>

      <h3 className="font-serif text-xl sm:text-2xl italic leading-snug text-foreground/90 transition-colors group-hover:text-foreground">
        {story.title}
      </h3>

      {story.excerpt && (
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {story.excerpt}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {story.author && (
          <span className="font-serif italic text-muted-foreground normal-case tracking-normal">
            {story.author}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Clock size={11} className="opacity-60" />
          {story.readTime} min
        </span>
        {date && <span>{date}</span>}
      </div>
    </Link>
  );
}
