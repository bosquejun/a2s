import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookMarked } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { getAllPublishedCollections } from "@/lib/services/collections/get-collections";
import { absoluteUrl, SITE_KEYWORDS, SITE_NAME } from "@/lib/seo";
import {
  breadcrumbList,
  serializeJsonLd,
  WEBSITE_ID,
} from "@/lib/utils/json-ld";

const COLLECTIONS_DESCRIPTION =
  "Curated sets of stories for a specific kind of night: hand-picked, ordered, and introduced. Start with a feeling, leave with seven stories.";

export async function generateMetadata(): Promise<Metadata> {
  const collections = await getAllPublishedCollections();

  return {
    title: "Story Collections",
    description: COLLECTIONS_DESCRIPTION,
    keywords: [...SITE_KEYWORDS, "story collections", "curated stories"],
    alternates: { canonical: "/collections" },
    // Keep the index out of search until there's something on it.
    robots: collections.length ? undefined : { index: false, follow: true },
    openGraph: {
      title: `Story Collections | ${SITE_NAME}`,
      description: COLLECTIONS_DESCRIPTION,
      type: "website",
      url: absoluteUrl("/collections"),
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `Story Collections | ${SITE_NAME}`,
      description: COLLECTIONS_DESCRIPTION,
    },
  };
}

export default async function CollectionsPage() {
  const collections = await getAllPublishedCollections();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `Story Collections — ${SITE_NAME}`,
        description: COLLECTIONS_DESCRIPTION,
        url: absoluteUrl("/collections"),
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: collections.map((collection, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: collection.title,
            url: absoluteUrl(`/collections/${collection.slug}`),
          })),
        },
      },
      breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Collections", path: "/collections" },
      ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="relative min-h-screen text-foreground font-sans">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <header className="mb-12 flex flex-col items-center gap-5 text-center animate-fade-up">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 transition-colors hover:text-foreground/80"
            >
              <ArrowLeft size={12} />
              All stories
            </Link>
            <h1 className="flex items-center gap-2.5 font-serif text-3xl italic text-foreground/90 text-glow sm:text-4xl">
              <BookMarked size={24} className="text-muted-foreground/50" />
              Collections
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Hand-picked sets of stories for a specific kind of night, in the
              order they&rsquo;re meant to be read.
            </p>
          </header>

          {collections.length === 0 ? (
            <p className="py-16 text-center font-serif italic text-muted-foreground/60">
              The first collection is still being gathered. Check back after
              2am.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-border/40 bg-card/30 px-6 py-5 backdrop-blur-sm transition-all hover:border-indigo-400/30 hover:bg-card/60"
                >
                  <h2 className="font-serif text-xl italic text-foreground/90 transition-colors group-hover:text-foreground">
                    {collection.title}
                  </h2>
                  {collection.hook && (
                    <p className="text-sm text-muted-foreground">
                      {collection.hook}
                    </p>
                  )}
                  <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50">
                    {collection.stories.length} stories
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <SiteFooter />
        <div className="grain-overlay" aria-hidden="true" />
      </div>
    </>
  );
}
