import prisma from "@/lib/database/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const storyRequest = await prisma.storyRequest.findUnique({
      where: {
        trackCode: code,
      },
      include: {
        story: {
          select: {
            id: true,
            slug: true,
            title: true,
            publishedAt: true,
          },
        },
      },
    });

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
