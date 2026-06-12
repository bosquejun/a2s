import { redirect } from "next/navigation";

/**
 * Legacy route. The mock form that used to live here never persisted
 * anything; the canonical submission flow is /write.
 */
export default function CreateStoryPage() {
  redirect("/write");
}
