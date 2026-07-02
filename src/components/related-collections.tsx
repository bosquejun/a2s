import Link from "next/link";
import { BookMarked } from "lucide-react";

interface RelatedCollectionsProps {
  collections: { slug: string; title: string }[];
}

/**
 * Quiet row of collection links under an archive intro. Renders nothing when
 * there's nothing to link, so archive pages stay unchanged until collections
 * exist.
 */
export function RelatedCollections({ collections }: RelatedCollectionsProps) {
  if (!collections.length) return null;

  return (
    <div className="mx-auto mb-12 -mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-2">
      <span className="mr-1 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.4em] text-muted-foreground/50">
        <BookMarked size={12} className="opacity-60" />
        Collections
      </span>
      {collections.map((collection) => (
        <Link
          key={collection.slug}
          href={`/collections/${collection.slug}`}
          className="rounded-full border border-border/50 bg-card/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:bg-card hover:text-foreground/80"
        >
          {collection.title}
        </Link>
      ))}
    </div>
  );
}
