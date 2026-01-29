import prisma from "@/lib/database/prisma";
import { redis } from '@/lib/redis';
import { triggerWorkflow } from "@/lib/workflow-client/client";
import { getAnonId } from '@/utils/get-anon-id';
import { generateTrackCode } from '@/utils/track-code';
import { createStoryRequestSchema } from '@/validations/story.validation';
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { NextResponse } from 'next/server';

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "1 d"),
    prefix: "a2s:stories:write",
    enableProtection: true,
    ephemeralCache: process.env.NODE_ENV === 'production' ? new Map() : false,
  });

export async function POST(request: Request) {
  const body= await request.json();

  const validated = createStoryRequestSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json({ error: validated.error.issues.map(issue => issue.message).join("\n") }, { status: 400 });
  }


  const anonId = await getAnonId();

  try {
    


  const { success } = await ratelimit.limit(anonId);



  if (!success) {
    return NextResponse.json({ error: "Writing request limit exceeded. Please try again later." }, { status: 429 });
  }


  const storyRequest = await prisma.storyRequest.create({
    data: {
      content: validated.data.content,
      trackCode: generateTrackCode(),
    },
  });

  await triggerWorkflow('writeStory', { trackCode: storyRequest.trackCode });

  return NextResponse.json(storyRequest);
  } catch (error) {
    await ratelimit.resetUsedTokens(anonId);
    console.error(error);
    return NextResponse.json({ error: "Failed to submit story. Please try again later." }, { status: 500 });
  }

}