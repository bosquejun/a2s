import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ArchiveIntro } from "@/components/archive-intro";
import { SiteFooter } from "@/components/site-footer";
import { StoryFeed } from "@/components/story-feed";
import { CATEGORY_ARCHIVE_COPY } from "@/lib/content/archive-copy";
import {
  CATEGORIES,
  CATEGORY_ACCENTS,
  CATEGORY_LABELS,
  CATEGORY_TAGLINES,
  type Category,
} from "@/lib/content/taxonomy";
import { absoluteUrl, SITE_KEYWORDS, SITE_NAME } from "@/lib/seo";
import { getStoriesByCategory } from "@/lib/services/stories/get-stories-by-category";
import {
  breadcrumbList,
  serializeJsonLd,
  storyItemList,
  WEBSITE_ID,
} from "@/lib/utils/json-ld";

interface PageProps {
  params: Promise<{ category: string }>;
}

function parseCategory(param: string): Category | null {
  const candidate = param.toUpperCase() as Category;
  return CATEGORIES.includes(candidate) ? candidate : null;
}

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.toLowerCase() }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: param } = await params;
  const category = parseCategory(param);
  if (!category) return {};

  const label = CATEGORY_LABELS[category];
  const description = CATEGORY_ARCHIVE_COPY[category].seoDescription;
  const url = absoluteUrl(`/category/${category.toLowerCase()}`);

  return {
    title: `${label} Stories — ${CATEGORY_TAGLINES[category]}`,
    description,
    keywords: [
      `${label.toLowerCase()} stories`,
      label.toLowerCase(),
      ...SITE_KEYWORDS,
    ],
    alternates: { canonical: `/category/${category.toLowerCase()}` },
    openGraph: {
      title: `${label} Stories | ${SITE_NAME}`,
      description,
      type: "website",
      url,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} Stories | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: param } = await params;
  const category = parseCategory(param);
  if (!category) {
    notFound();
  }

  const stories = await getStoriesByCategory(category);
  const label = CATEGORY_LABELS[category];
  const slug = category.toLowerCase();
  const accent = CATEGORY_ACCENTS[category];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${label} Stories — After 2AM Stories`,
        description: CATEGORY_ARCHIVE_COPY[category].seoDescription,
        url: absoluteUrl(`/category/${slug}`),
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: storyItemList(stories),
      },
      breadcrumbList([
        { name: "Home", path: "/" },
        { name: "Stories", path: "/stories" },
        { name: label, path: `/category/${slug}` },
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
            <h1 className="font-serif text-3xl italic text-foreground/90 text-glow sm:text-4xl md:text-5xl">
              {label}
            </h1>
            <p
              className="font-serif italic text-sm"
              style={{ color: accent, opacity: 0.75 }}
            >
              {CATEGORY_TAGLINES[category]}
            </p>
          </header>

          <ArchiveIntro copy={CATEGORY_ARCHIVE_COPY[category]} />

          <StoryFeed
            stories={stories}
            emptyMessage="Nothing here yet in this vein. Check back after 2am."
          />
        </div>

        <SiteFooter />

        <div className="grain-overlay" aria-hidden="true" />
        <div
          className="pointer-events-none fixed left-[-10%] top-[-12%] h-[45%] w-[45%] rounded-full blur-[130px] animate-drift"
          style={{ backgroundColor: `${accent}14` }}
        />
      </div>
    </>
  );
}
