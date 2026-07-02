import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "The simple understanding between you and After 2AM Stories — reading, whispering, and keeping the place kind.",
  alternates: { canonical: "/terms" },
};

// Update when the substance of these terms changes.
const LAST_UPDATED = "June 15, 2026";

export default function TermsPage() {
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
          Terms
        </h1>
        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-slate-600">
          Last updated {LAST_UPDATED}
        </p>

        <div className="mt-10 space-y-10 text-slate-300/90">
          <section className="space-y-4 font-serif text-lg leading-relaxed sm:text-xl">
            <p>
              These are the few things we ask, written plainly. By reading or
              whispering here, you&rsquo;re agreeing to them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">Reading</h2>
            <p className="text-base leading-relaxed text-slate-300/80">
              The stories are free to read. They&rsquo;re here to be felt, not
              scraped, resold, or republished as your own. Be gentle with what
              people leave behind.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">
              Whispering a story
            </h2>
            <ul className="space-y-3 text-base leading-relaxed text-slate-300/80">
              <li>
                <span className="text-slate-100">It stays yours.</span> You keep
                ownership of what you submit. You grant us permission to publish
                it here and make light edits for clarity, length, or anonymity.
              </li>
              <li>
                <span className="text-slate-100">Only what&rsquo;s yours to tell.</span>{" "}
                Don&rsquo;t submit someone else&rsquo;s private details, contact
                info, or anything that would expose a real person without their
                say.
              </li>
              <li>
                <span className="text-slate-100">Keep it lawful and kind.</span>{" "}
                No content that&rsquo;s illegal, threatening, hateful, or meant
                to harm.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">
              Our part
            </h2>
            <p className="text-base leading-relaxed text-slate-300/80">
              We curate. We may edit, decline, or remove a submission, and we
              don&rsquo;t guarantee that anything sent in will be published. If
              you want your published story taken down, just ask.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">
              No promises about the stories
            </h2>
            <p className="text-base leading-relaxed text-slate-300/80">
              Stories may be personal, fictionalized, or somewhere in between.
              They&rsquo;re shared as they are, for reflection &mdash; not as
              advice or statements of fact. The site is provided &ldquo;as
              is.&rdquo;
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">Changes</h2>
            <p className="text-base leading-relaxed text-slate-300/80">
              These terms may change over time. When they do, we&rsquo;ll update
              the date above.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl italic text-slate-100">Contact</h2>
            <p className="text-base leading-relaxed text-slate-300/80">
              Reach us at{" "}
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
