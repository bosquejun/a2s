import { Category, Mood } from "@/lib/content/taxonomy";
import { triggerWorkflow } from "@/lib/workflow-client/client";
import { generateStoryWorkflowInputSchema } from "@/validations/story.validation";
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

/**
 * Kicking off generation campaigns is an operator action (each request can
 * fan out into dozens of paid LLM workflows), so it requires a bearer
 * secret. Set STORY_GENERATION_SECRET (or CRON_SECRET when triggered by
 * Vercel Cron) in the environment.
 */
function isAuthorized(request: Request): boolean {
  const secret =
    process.env.STORY_GENERATION_SECRET || process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const headerBuffer = Buffer.from(header);
  const expectedBuffer = Buffer.from(expected);
  return (
    headerBuffer.length === expectedBuffer.length &&
    timingSafeEqual(headerBuffer, expectedBuffer)
  );
}

export const POST = async (request: Request) => {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { data, success, error } = generateStoryWorkflowInputSchema
    .partial()
    .safeParse(body);

  if (!success) {
    return NextResponse.json(
      { error: error.issues.map((issue) => issue.message).join("\n") },
      { status: 400 }
    );
  }

  const moods = data.mood ? [data.mood] : Object.values(Mood);
  const categories = data.category
    ? [data.category]
    : Object.values(Category);
  const isSingle = Boolean(data.mood && data.category);

  let workflowCount = 0;

  for (const mood of moods) {
    for (const category of categories) {
      const contextData = {
        intensity: Math.floor(Math.random() * 5) + 1,
        category,
        mood,
      };

      triggerWorkflow("generateStory", contextData, {
        key: "generate-story-workflow",
        rate: isSingle ? 1 : 3,
        period: isSingle ? "5m" : "1m",
        parallelism: 1,
      }).catch((triggerError) => {
        console.error(
          `[POST /api/stories/start] Failed to trigger workflow - category: ${category}, mood: ${mood}`,
          triggerError
        );
      });
      workflowCount++;
    }
  }

  console.log(
    `[POST /api/stories/start] Triggered ${workflowCount} workflow(s)` +
      (data.mood ? ` mood=${data.mood}` : "") +
      (data.category ? ` category=${data.category}` : "")
  );

  return NextResponse.json({ message: "Stories generation started" });
};
