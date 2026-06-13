import { notFound, redirect } from "next/navigation";
import { featureFlags } from "@/lib/feature-flags";

/**
 * Legacy route. The mock form that used to live here never persisted
 * anything; the canonical submission flow is /write.
 */
export default function CreateStoryPage() {
  if (!featureFlags.whisper) {
    notFound();
  }

  redirect("/write");
}
