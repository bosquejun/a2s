import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../client", () => ({
  postToPage: vi.fn(),
  commentOnPost: vi.fn(),
  FacebookGraphError: class FacebookGraphError extends Error {
    code?: number;
    constructor(message: string, code?: number) {
      super(message);
      this.code = code;
    }
  },
}));
vi.mock("../connection", () => ({
  getConnection: vi.fn(),
  clearConnection: vi.fn(),
}));
vi.mock("@/lib/services/social/settings", () => ({
  getLinkInCommentSettings: vi.fn(),
}));

import { shareStory } from "../share-story";
import { commentOnPost, postToPage } from "../client";
import { getConnection } from "../connection";
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
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SITE_URL = "https://after2amstories.com";
  (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
  (postToPage as ReturnType<typeof vi.fn>).mockResolvedValue("POST1");
});

describe("shareStory (Facebook) link-in-comment", () => {
  it("puts the link in the post body when the toggle is off", async () => {
    (getLinkInCommentSettings as ReturnType<typeof vi.fn>).mockResolvedValue({
      facebook: false,
      instagram: false,
    });
    await shareStory(fakePayload(), 1);

    expect(postToPage).toHaveBeenCalledWith(
      expect.objectContaining({
        link: "https://after2amstories.com/story/s",
      })
    );
    expect(commentOnPost).not.toHaveBeenCalled();
  });

  it("omits the body link and comments it when the toggle is on", async () => {
    (getLinkInCommentSettings as ReturnType<typeof vi.fn>).mockResolvedValue({
      facebook: true,
      instagram: false,
    });
    (commentOnPost as ReturnType<typeof vi.fn>).mockResolvedValue("CMT1");
    const payload = fakePayload();

    await shareStory(payload, 1);

    expect(postToPage).toHaveBeenCalledWith(
      expect.objectContaining({ link: undefined })
    );
    expect(commentOnPost).toHaveBeenCalledWith(
      expect.objectContaining({
        postId: "POST1",
        message: expect.stringContaining("https://after2amstories.com/story/s"),
      })
    );
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { facebookCommentId: "CMT1" } })
    );
  });

  it("does not fail the share when the comment fails", async () => {
    (getLinkInCommentSettings as ReturnType<typeof vi.fn>).mockResolvedValue({
      facebook: true,
      instagram: false,
    });
    (commentOnPost as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("comment blew up")
    );
    const payload = fakePayload();

    const result = await shareStory(payload, 1);

    expect(result).toEqual({ postId: "POST1" });
    expect(payload.logger.error).toHaveBeenCalled();
  });
});
