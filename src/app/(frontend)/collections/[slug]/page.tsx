import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { MOOD_LABELS } from "@/lib/content/taxonomy";
import { getCollectionBySlug } from "@/lib/services/collections/get-collections";
import { absoluteUrl, SITE_KEYWORDS, SITE_NAME } from "@/lib/seo";
import {
  breadcrumbList,
  serializeJsonLd,
  storyItemList,
  WEBSITE_ID,
} from "@/lib/utils/json-ld";

// No generateStaticParams: Cache Components fails the build when it returns
// an empty array (EmptyGenerateStaticParamsError), and zero published
// collections is this route's normal starting state. Pages render on demand
// from the cached collections list instead, with the dynamic section inside
// <Suspense> so the static shell prerenders (same pattern as /stories).

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};

  const title = collection.seo?.title || `${collection.title} — a collection`;
  const description =
    collection.seo?.description ||
    collection.hook ||
    `${collection.stories.length} stories, chosen and ordered for one kind of night.`;
  const url = absoluteUrl(`/collections/${collection.slug}`);

  return {
    title,
    description,
    keywords: [...SITE_KEYWORDS, "story collection", collection.title],
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      title: `${collection.title} | ${SITE_NAME}`,
      description,
      type: "website",
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.title} | ${SITE_NAME}`,
      description,
    },
  };
}

export default function CollectionPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CollectionFallback />}>
      <CollectionContent params={params} />
    </Suspense>
  );
}

function CollectionFallback() {
  return (
    <div className="relative min-h-screen text-foreground font-sans">
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 flex flex-col items-center gap-5">
          <div className="h-3 w-24 rounded-full bg-card/60 animate-pulse" />
          <div className="h-9 w-72 max-w-full rounded-lg bg-card/60 animate-pulse" />
          <div className="h-4 w-52 max-w-full rounded-full bg-card/40 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-border/40 bg-card/30 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

async function CollectionContent({ params }: PageProps) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) {
    notFound();
  }

  const url = absoluteUrl(`/collections/${collection.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${collection.title} — ${SITE_NAME}`,
        description: collection.seo?.description || collection.hook || "",
        url,
        isPartOf: { "@id": WEBSITE_ID },
        datePublished: collection.publishedAt ?? undefined,
        dateModified:
          collection.updatedAt ?? collection.publishedAt ?? undefined,
        mainEntity: storyItemList(collection.stories),
      },
      breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Collections", path: "/collections" },
        { name: collection.title, path: `/collections/${collection.slug}` },
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
        <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
          <header className="mb-10 flex flex-col items-center gap-5 text-center animate-fade-up">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 transition-colors hover:text-foreground/80"
            >
              <ArrowLeft size={12} />
              All collections
            </Link>
            <h1 className="font-serif text-3xl italic text-foreground/90 text-glow sm:text-4xl">
              {collection.title}
            </h1>
            {collection.hook && (
              <p className="font-serif italic text-sm text-muted-foreground/70">
                {collection.hook}
              </p>
            )}
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50">
              {collection.stories.length} stories, in order
            </span>
          </header>

          {/* Editorial intro — the reason this page exists for search. */}
          <div
            className="mb-12 font-serif text-base leading-relaxed text-muted-foreground sm:text-lg [&_p]:mb-5 [&_p:last-child]:mb-0 [&_em]:italic [&_strong]:font-semibold [&_strong]:text-foreground/90"
            dangerouslySetInnerHTML={{ __html: collection.introHtml }}
          />

          <ol className="flex flex-col gap-4">
            {collection.stories.map((story, index) => (
              <li key={story.id}>
                <Link
                  href={`/story/${story.slug}`}
                  className="group flex gap-4 rounded-2xl border border-border/40 bg-card/30 px-5 py-4 backdrop-blur-sm transition-all hover:border-indigo-400/30 hover:bg-card/60"
                >
                  <span
                    className="mt-0.5 font-serif text-2xl italic text-muted-foreground/40"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <span className="font-serif text-lg italic text-foreground/90 transition-colors group-hover:text-foreground">
                      {story.title}
                    </span>
                    {story.excerpt && (
                      <span className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {story.excerpt}
                      </span>
                    )}
                    <span className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/50">
                      <span>{MOOD_LABELS[story.mood]}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={10} />
                        {story.readTime} min
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <SiteFooter />
        <div className="grain-overlay" aria-hidden="true" />
        <div className="pointer-events-none fixed left-[-10%] top-[-12%] h-[45%] w-[45%] rounded-full bg-indigo-500/8 blur-[130px] animate-drift" />
      </div>
    </>
  );
}
