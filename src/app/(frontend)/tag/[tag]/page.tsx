import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Hash } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { StoryFeed } from "@/components/story-feed";
import { absoluteUrl, SITE_KEYWORDS, SITE_NAME } from "@/lib/seo";
import {
  getIndexableTags,
  getStoriesByTagSlug,
  TAG_INDEX_MIN,
} from "@/lib/services/stories/get-stories-by-tag";
import {
  breadcrumbList,
  serializeJsonLd,
  storyItemList,
  WEBSITE_ID,
} from "@/lib/utils/json-ld";

interface PageProps {
  params: Promise<{ tag: string }>;
}

// Prerender index-worthy tags; thinner tags are still reachable from story
// pages, rendered on demand (and left noindex below). Under Cache Components,
// params beyond this list render dynamically by default — no dynamicParams flag.
export async function generateStaticParams() {
  const tags = await getIndexableTags();
  return tags.map((entry) => ({ tag: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag: param } = await params;
  const listing = await getStoriesByTagSlug(param);
  if (!listing) return {};

  const { tag, slug, stories } = listing;
  const description = `Stories tagged "${tag}" — late-night writing from After 2AM Stories.`;
  const url = absoluteUrl(`/tag/${slug}`);
  const indexable = stories.length >= TAG_INDEX_MIN;

  return {
    title: `#${tag} Stories`,
    description,
    keywords: [`${tag} stories`, tag, ...SITE_KEYWORDS],
    alternates: { canonical: `/tag/${slug}` },
    // Keep thin tag pages out of the index while still reachable for readers.
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: `#${tag} Stories | ${SITE_NAME}`,
      description,
      type: "website",
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `#${tag} Stories | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag: param } = await params;
  const listing = await getStoriesByTagSlug(param);
  if (!listing) {
    notFound();
  }

  const { tag, slug, stories } = listing;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `Stories tagged "${tag}" — After 2AM Stories`,
        description: `Stories tagged "${tag}".`,
        url: absoluteUrl(`/tag/${slug}`),
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: storyItemList(stories),
      },
      breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Stories", path: "/stories" },
        { name: `#${tag}`, path: `/tag/${slug}` },
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
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <header className="mb-12 flex flex-col items-center gap-5 text-center animate-fade-up">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 transition-colors hover:text-foreground/80"
            >
              <ArrowLeft size={12} />
              All stories
            </Link>
            <h1 className="flex items-center gap-2 font-serif text-3xl italic text-foreground/90 text-glow sm:text-4xl">
              <Hash size={22} className="text-muted-foreground/50" />
              {tag}
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Everything written after 2am and tagged{" "}
              <span className="text-foreground/80">{tag}</span>.
            </p>
          </header>

          <StoryFeed
            stories={stories}
            emptyMessage="Nothing here yet under this tag."
          />
        </div>

        <SiteFooter />

        <div className="grain-overlay" aria-hidden="true" />
        <div className="pointer-events-none fixed left-[-10%] top-[-12%] h-[45%] w-[45%] rounded-full bg-indigo-500/8 blur-[130px] animate-drift" />
      </div>
    </>
  );
}
