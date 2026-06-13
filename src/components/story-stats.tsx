"use client";

import { Eye } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StoryStatsProps {
  slug: string;
  /** SSR count from the (possibly hours-stale) cached page; shown until the live read resolves. */
  initialViews: number;
}

/**
 * Records a view on mount (fire-and-forget) and shows the live count.
 *
 * The story page is statically cached, so the server render can't count views
 * and its `viewCount` may be hours stale — this client component owns both the
 * `POST .../view` beacon and the live `GET .../stats` read. The view route is
 * itself guarded to the production deploy, so dev/preview mounts are no-ops.
 */
export function StoryStats({ slug, initialViews }: StoryStatsProps) {
  const [views, setViews] = useState(initialViews);
  // React 18 mounts effects twice in dev StrictMode; guard so we beacon once.
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;

    const controller = new AbortController();

    (async () => {
      try {
        await fetch(`/api/stories/${slug}/view`, {
          method: "POST",
          signal: controller.signal,
        });
        const res = await fetch(`/api/stories/${slug}/stats`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data: { views?: number } = await res.json();
        if (typeof data.views === "number") setViews(data.views);
      } catch {
        // Silent: a failed view/stats read must never disrupt reading.
      }
    })();

    return () => controller.abort();
  }, [slug]);

  if (views <= 0) return null;

  return (
    <>
      <div className="h-3 w-px bg-border/70" />
      <div className="flex items-center space-x-1.5 text-[10px] uppercase tracking-[0.3em]">
        <Eye size={11} className="opacity-60" />
        <span>
          {views.toLocaleString()} {views === 1 ? "view" : "views"}
        </span>
      </div>
    </>
  );
}
