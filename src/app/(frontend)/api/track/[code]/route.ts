import { getPayloadClient } from "@/lib/payload";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "story-requests",
      where: { trackCode: { equals: code } },
      depth: 1,
      limit: 1,
    });

    const storyRequest = docs[0];
    if (!storyRequest) {
      return NextResponse.json(
        { error: "Story request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(storyRequest);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch story request" },
      { status: 500 }
    );
  }
}
