import { getPayloadClient } from "@/lib/payload";
import { NextResponse } from "next/server";

type PopulatedStory = {
  id: string | number;
  slug?: string;
  title?: string;
  publishedAt?: string | null;
  _status?: string;
};

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

    // The Local API bypasses access control, so shape the response by hand:
    // the submitter sees their own text and status, but never the full
    // (possibly still-draft) story document — only a link once published.
    const relatedStory =
      storyRequest.story && typeof storyRequest.story === "object"
        ? (storyRequest.story as PopulatedStory)
        : null;
    const isPublished = Boolean(
      relatedStory?.publishedAt && relatedStory?._status === "published"
    );

    return NextResponse.json({
      id: storyRequest.id,
      content: storyRequest.content,
      status: storyRequest.status,
      notes: storyRequest.notes ?? null,
      trackCode: storyRequest.trackCode,
      approvedAt: storyRequest.approvedAt ?? null,
      createdAt: storyRequest.createdAt,
      updatedAt: storyRequest.updatedAt,
      story: isPublished
        ? {
            id: relatedStory!.id,
            slug: relatedStory!.slug,
            title: relatedStory!.title,
            publishedAt: relatedStory!.publishedAt,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch story request" },
      { status: 500 }
    );
  }
}
