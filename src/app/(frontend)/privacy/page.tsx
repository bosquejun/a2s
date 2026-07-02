import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What After 2AM Stories collects, what it doesn't, and how the quiet stays quiet.",
  alternates: { canonical: "/privacy" },
};

// Update when the substance of this policy changes.
const LAST_UPDATED = "June 15, 2026";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen text-foreground font-sans">
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-600 transition-colors hover:text-slate-300"
        >
          <ArrowLeft size={12} />
          Home
        </Link>

        <h1 className="mt-12 font-serif text-3xl italic text-slate-100 sm:text-4xl">
          Privacy
        </h1>
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-600">
          Last updated {LAST_UPDATED}
        </p>

        <div className="mt-10 space-y-10 text-slate-300/90">
          <section className="space-y-4 font-serif text-lg leading-relaxed sm:text-xl">
            <p>
              After 2AM Stories is meant to feel like a quiet room, not a
              surveillance camera. We collect as little as we can, and we
              don&rsquo;t sell or trade any of it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">
              What we collect
            </h2>
            <ul className="space-y-3 text-base leading-relaxed text-slate-300/80">
              <li>
                <span className="text-slate-100">Stories you whisper.</span>{" "}
                When you submit a story, we keep the text and any details you
                choose to include, plus the tracking code we generate so you can
                follow it. Don&rsquo;t include anything you wouldn&rsquo;t want
                read aloud in the dark.
              </li>
              <li>
                <span className="text-slate-100">Anonymous reading.</span> We
                count how many times a story is read so we know what resonates.
                These counts are aggregate &mdash; not tied to who you are.
              </li>
              <li>
                <span className="text-slate-100">Basic analytics.</span> We use
                Vercel Analytics, which is cookieless and doesn&rsquo;t follow
                you across other sites. It tells us roughly how many people
                visit and which pages &mdash; nothing that identifies you.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">
              What we don&rsquo;t do
            </h2>
            <ul className="space-y-3 text-base leading-relaxed text-slate-300/80">
              <li>No ad trackers, no third-party advertising cookies.</li>
              <li>No selling, renting, or trading your data.</li>
              <li>
                No account required to read. Reading leaves no name behind.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">
              Your whispered story
            </h2>
            <p className="text-base leading-relaxed text-slate-300/80">
              Changed your mind? Email us with your tracking code and
              we&rsquo;ll take it down. It&rsquo;s your story &mdash; you can
              ask for it back.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">
              Contact
            </h2>
            <p className="text-base leading-relaxed text-slate-300/80">
              Questions about privacy? Write to{" "}
              <a
                href="mailto:hello@after2amstories.com"
                className="text-slate-100 underline decoration-slate-700 underline-offset-4 transition-colors hover:decoration-indigo-400"
              >
                hello@after2amstories.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      <SiteFooter />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
