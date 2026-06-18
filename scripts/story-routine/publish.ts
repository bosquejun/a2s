// `publish` — validate finished stories and publish them through the ingest
// endpoint. This is step 5 of docs/routines/story-generation.md.
//
// Validation uses the SAME zod schema the endpoint enforces
// (nightWriterStoryWorkflowOutputSchema), so schema mistakes are caught locally
// before anything hits the network. Each argument is a path to a JSON file
// holding one story (the Output schema in the routine doc), or "-" to read one
// story from stdin. Multiple files publish a whole batch in one invocation.

import { readFileSync } from "node:fs";
import { nightWriterStoryWorkflowOutputSchema } from "@/validations/story.validation";
import { fail, fetchWithRetry, loadEnv, type RoutineEnv } from "./lib";

type Outcome =
  | { source: string; status: "published"; slug: string; id: string }
  | { source: string; status: "skipped"; slug: string; reason: string }
  | { source: string; status: "failed"; reason: string };

export async function publish(args: string[]): Promise<void> {
  const sources = args.filter((a) => !a.startsWith("-") || a === "-");
  if (sources.length === 0) {
    fail("usage: publish <story.json> [more.json ...]  (use - for stdin)");
  }

  const env = loadEnv({ requireSecret: true });

  const outcomes: Outcome[] = [];
  for (const source of sources) {
    outcomes.push(await publishOne(env, source));
  }

  report(outcomes);

  // Non-zero exit only on hard failures; duplicates (skipped) are expected on
  // reruns and don't fail the batch.
  if (outcomes.some((o) => o.status === "failed")) process.exit(1);
}

async function publishOne(env: RoutineEnv, source: string): Promise<Outcome> {
  let raw: string;
  try {
    raw =
      source === "-" ? readFileSync(0, "utf8") : readFileSync(source, "utf8");
  } catch (err) {
    return { source, status: "failed", reason: `cannot read: ${String(err)}` };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    return { source, status: "failed", reason: `invalid JSON: ${String(err)}` };
  }

  const parsed = nightWriterStoryWorkflowOutputSchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    return { source, status: "failed", reason: `schema: ${issues}` };
  }

  const res = await fetchWithRetry(`${env.site}/api/stories/ingest`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(parsed.data),
  });

  const payload = (await res.json().catch(() => ({}))) as {
    slug?: string;
    id?: string;
    error?: string;
  };

  if (res.status === 201) {
    return {
      source,
      status: "published",
      slug: payload.slug ?? "(unknown)",
      id: payload.id ?? "(unknown)",
    };
  }
  if (res.status === 409) {
    return {
      source,
      status: "skipped",
      slug: payload.slug ?? "(unknown)",
      reason: "duplicate slug",
    };
  }
  return {
    source,
    status: "failed",
    reason: `${res.status}: ${payload.error ?? res.statusText}`,
  };
}

function report(outcomes: Outcome[]): void {
  for (const o of outcomes) {
    if (o.status === "published") {
      console.log(`published  ${o.slug}  (${o.source})`);
    } else if (o.status === "skipped") {
      console.log(`skipped    ${o.slug}  (${o.source}) — ${o.reason}`);
    } else {
      console.log(`failed     ${o.source} — ${o.reason}`);
    }
  }
  const n = (s: Outcome["status"]) =>
    outcomes.filter((o) => o.status === s).length;
  console.log(
    `\n${n("published")} published, ${n("skipped")} skipped, ${n("failed")} failed`
  );
}
