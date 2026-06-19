import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../client", () => ({
  createMediaContainer: vi.fn(),
  createCarouselItemContainer: vi.fn(),
  createCarouselContainer: vi.fn(),
  publishMedia: vi.fn(),
  waitForMediaContainer: vi.fn().mockResolvedValue(undefined),
  commentOnMedia: vi.fn(),
}));
vi.mock("@/lib/services/facebook/connection", () => ({
  getConnection: vi.fn(),
  clearConnection: vi.fn(),
}));
vi.mock("@/lib/services/stories/get-story", () => ({
  getStoryBySlug: vi.fn(),
}));
vi.mock("@/lib/services/social/settings", () => ({
  getLinkInCommentSettings: vi.fn().mockResolvedValue({
    facebook: false,
    instagram: false,
  }),
}));
// Keep the real comment-variation text but skip the post→comment delay so tests
// don't actually wait 3–5s.
vi.mock("@/lib/services/social/link-comment", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/services/social/link-comment")
  >("@/lib/services/social/link-comment");
  return { ...actual, waitBeforeComment: vi.fn().mockResolvedValue(undefined) };
});

import { shareStoryToInstagram } from "../share-story";
import {
  commentOnMedia,
  createCarouselContainer,
  createCarouselItemContainer,
  createMediaContainer,
  publishMedia,
} from "../client";
import {
  clearConnection,
  getConnection,
} from "@/lib/services/facebook/connection";
import { getStoryBySlug } from "@/lib/services/stories/get-story";
import { FacebookGraphError } from "@/lib/services/facebook/client";
import { getLinkInCommentSettings } from "@/lib/services/social/settings";

const story = { id: 1, slug: "s", title: "T", hook: "H", excerpt: "E" };

function fakePayload(overrides = {}) {
  return {
    findByID: vi.fn().mockResolvedValue(story),
    update: vi.fn().mockResolvedValue({}),
    logger: { error: vi.fn() },
    ...overrides,
  } as unknown as import("payload").Payload;
}

const connected = {
  connected: true,
  pageId: "P",
  pageAccessToken: "TOK",
  instagramUserId: "IG1",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SITE_URL = "https://after2amstories.com";
});

describe("shareStoryToInstagram", () => {
  it("creates a container, publishes, and stores the media id", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createMediaContainer as ReturnType<typeof vi.fn>).mockResolvedValue("C1");
    (publishMedia as ReturnType<typeof vi.fn>).mockResolvedValue("M1");
    const payload = fakePayload();

    const result = await shareStoryToInstagram(payload, 1);

    expect(createMediaContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        igUserId: "IG1",
        imageUrl: "https://after2amstories.com/story/s/ig",
        caption: expect.stringContaining("H"),
      })
    );
    expect(result).toEqual({ postId: "M1" });
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { instagramPostId: "M1" },
        context: { skipInstagramAutoPost: true },
      })
    );
  });

  it("posts a carousel: stages each slide, assembles the parent, publishes", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (getStoryBySlug as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...story,
      content: "",
      categories: [],
      tags: [],
    });
    (createCarouselItemContainer as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("CH0")
      .mockResolvedValueOnce("CH1");
    (createCarouselContainer as ReturnType<typeof vi.fn>).mockResolvedValue(
      "P1"
    );
    (publishMedia as ReturnType<typeof vi.fn>).mockResolvedValue("M2");
    const payload = fakePayload();

    const result = await shareStoryToInstagram(payload, 1, {
      format: "carousel",
    });

    // cover + cta = 2 slides for an empty-ish body
    expect(createCarouselItemContainer).toHaveBeenCalledTimes(2);
    expect(createCarouselItemContainer).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        imageUrl: "https://after2amstories.com/story/s/ig/carousel/0",
      })
    );
    expect(createCarouselContainer).toHaveBeenCalledWith(
      expect.objectContaining({ children: ["CH0", "CH1"] })
    );
    expect(createMediaContainer).not.toHaveBeenCalled();
    expect(result).toEqual({ postId: "M2" });
  });

  it("short-circuits when already shared", async () => {
    const payload = fakePayload({
      findByID: vi.fn().mockResolvedValue({ ...story, instagramPostId: "OLD" }),
    });
    const result = await shareStoryToInstagram(payload, 1);
    expect(result).toEqual({ postId: "OLD", alreadyShared: true });
    expect(createMediaContainer).not.toHaveBeenCalled();
  });

  it("errors when no Instagram account is linked", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...connected,
      instagramUserId: null,
    });
    await expect(shareStoryToInstagram(fakePayload(), 1)).rejects.toThrow(
      /Instagram/
    );
  });

  it("comments the story link when the toggle is on", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createMediaContainer as ReturnType<typeof vi.fn>).mockResolvedValue("C1");
    (publishMedia as ReturnType<typeof vi.fn>).mockResolvedValue("M1");
    (getLinkInCommentSettings as ReturnType<typeof vi.fn>).mockResolvedValue({
      facebook: false,
      instagram: true,
    });
    (commentOnMedia as ReturnType<typeof vi.fn>).mockResolvedValue("CMT1");
    const payload = fakePayload();

    await shareStoryToInstagram(payload, 1);

    expect(commentOnMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaId: "M1",
        message: expect.stringContaining("https://after2amstories.com/story/s"),
      })
    );
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { instagramCommentId: "CMT1" } })
    );
  });

  it("does not fail the share when the comment fails", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createMediaContainer as ReturnType<typeof vi.fn>).mockResolvedValue("C1");
    (publishMedia as ReturnType<typeof vi.fn>).mockResolvedValue("M1");
    (getLinkInCommentSettings as ReturnType<typeof vi.fn>).mockResolvedValue({
      facebook: false,
      instagram: true,
    });
    (commentOnMedia as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("comment blew up")
    );
    const payload = fakePayload();

    const result = await shareStoryToInstagram(payload, 1);
    expect(result).toEqual({ postId: "M1" });
    expect(payload.logger.error).toHaveBeenCalled();
  });

  it("clears the connection on Graph error 190", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createMediaContainer as ReturnType<typeof vi.fn>).mockRejectedValue(
      new FacebookGraphError("expired", 190)
    );
    await expect(shareStoryToInstagram(fakePayload(), 1)).rejects.toThrow();
    expect(clearConnection).toHaveBeenCalled();
  });
});
