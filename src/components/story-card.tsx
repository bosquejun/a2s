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
      className="group relative flex flex-col gap-4 rounded-2xl border border-slate-900 bg-slate-900/20 p-6 sm:p-7 transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-900/40"
    >
      <div className="flex items-center gap-2.5 text-[9px] uppercase tracking-[0.25em] text-slate-500">
        <span className="text-indigo-300/80">{MOOD_LABELS[story.mood]}</span>
        {primaryCategory && (
          <>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>{CATEGORY_LABELS[primaryCategory]}</span>
          </>
        )}
      </div>

      <h3 className="font-serif text-xl sm:text-2xl italic leading-snug text-slate-100 transition-colors group-hover:text-white">
        {story.title}
      </h3>

      {story.excerpt && (
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-400/90">
          {story.excerpt}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-[10px] uppercase tracking-[0.2em] text-slate-600">
        {story.author && (
          <span className="font-serif italic text-slate-500 normal-case tracking-normal">
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
