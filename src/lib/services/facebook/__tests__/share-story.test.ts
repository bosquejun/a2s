import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../client", async () => {
  const actual = await vi.importActual<typeof import("../client")>("../client");
  return {
    ...actual,
    postToPage: vi.fn(),
    postPhotoToPage: vi.fn(),
  };
});
vi.mock("../connection", () => ({
  getConnection: vi.fn(),
  clearConnection: vi.fn(),
}));

import { shareStory } from "../share-story";
import { FacebookGraphError, postPhotoToPage, postToPage } from "../client";
import { clearConnection, getConnection } from "../connection";

const story = {
  id: 1,
  slug: "s",
  title: "T",
  hook: "H",
  excerpt: "E",
  categories: [],
  tags: [],
};

function fakePayload(overrides = {}) {
  return {
    findByID: vi.fn().mockResolvedValue(story),
    update: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as import("payload").Payload;
}

const connected = {
  connected: true,
  pageId: "P",
  pageAccessToken: "TOK",
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SITE_URL = "https://after2amstories.com";
});

describe("shareStory (facebook)", () => {
  it("posts the hook photo by default and stores the post id", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (postPhotoToPage as ReturnType<typeof vi.fn>).mockResolvedValue("FB1");
    const payload = fakePayload();

    const result = await shareStory(payload, 1);

    expect(postPhotoToPage).toHaveBeenCalledWith(
      expect.objectContaining({
        pageId: "P",
        imageUrl: "https://after2amstories.com/story/s/fb",
        caption: expect.stringContaining("H"),
      })
    );
    // The caption folds in the read-on link since a photo post has no preview.
    expect(
      (postPhotoToPage as ReturnType<typeof vi.fn>).mock.calls[0][0].caption
    ).toContain("https://after2amstories.com/story/s");
    expect(postToPage).not.toHaveBeenCalled();
    expect(result).toEqual({ postId: "FB1" });
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { facebookPostId: "FB1" },
        context: { skipFacebookAutoPost: true },
      })
    );
  });

  it("posts a text+link feed post when format is text", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (postToPage as ReturnType<typeof vi.fn>).mockResolvedValue("FB2");

    const result = await shareStory(fakePayload(), 1, { format: "text" });

    expect(postToPage).toHaveBeenCalledWith(
      expect.objectContaining({
        link: "https://after2amstories.com/story/s",
        message: expect.stringContaining("H"),
      })
    );
    expect(postPhotoToPage).not.toHaveBeenCalled();
    expect(result).toEqual({ postId: "FB2" });
  });

  it("falls back to a text post when the story has no slug", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (postToPage as ReturnType<typeof vi.fn>).mockResolvedValue("FB3");
    const payload = fakePayload({
      findByID: vi.fn().mockResolvedValue({ ...story, slug: null }),
    });

    const result = await shareStory(payload, 1);

    expect(postToPage).toHaveBeenCalled();
    expect(postPhotoToPage).not.toHaveBeenCalled();
    expect(result).toEqual({ postId: "FB3" });
  });

  it("short-circuits when already shared", async () => {
    const payload = fakePayload({
      findByID: vi.fn().mockResolvedValue({ ...story, facebookPostId: "OLD" }),
    });
    const result = await shareStory(payload, 1);
    expect(result).toEqual({ postId: "OLD", alreadyShared: true });
    expect(postPhotoToPage).not.toHaveBeenCalled();
    expect(postToPage).not.toHaveBeenCalled();
  });

  it("clears the connection on Graph error 190", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (postPhotoToPage as ReturnType<typeof vi.fn>).mockRejectedValue(
      new FacebookGraphError("expired", 190)
    );
    await expect(shareStory(fakePayload(), 1)).rejects.toThrow();
    expect(clearConnection).toHaveBeenCalled();
  });
});
