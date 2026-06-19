import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../client", async () => {
  const actual = await vi.importActual<typeof import("../client")>("../client");
  return {
    ...actual,
    postTweet: vi.fn(),
    refreshAccessToken: vi.fn(),
  };
});
vi.mock("../connection", () => ({
  getConnection: vi.fn(),
  clearConnection: vi.fn(),
  updateTokens: vi.fn(),
}));
// Keep the real comment-variation text but skip the post→reply delay so tests
// don't actually wait 3–5s.
vi.mock("@/lib/services/social/link-comment", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/services/social/link-comment")
  >("@/lib/services/social/link-comment");
  return { ...actual, waitBeforeComment: vi.fn().mockResolvedValue(undefined) };
});

import { shareStory } from "../share-story";
import { XApiError, postTweet, refreshAccessToken } from "../client";
import { clearConnection, getConnection, updateTokens } from "../connection";

const story = { id: 1, slug: "s", title: "T", hook: "H", excerpt: "E" };

function fakePayload(overrides = {}) {
  return {
    findByID: vi.fn().mockResolvedValue(story),
    update: vi.fn().mockResolvedValue({}),
    logger: { error: vi.fn() },
    ...overrides,
  } as unknown as import("payload").Payload;
}

const future = () => new Date(Date.now() + 3_600_000).toISOString();
const past = () => new Date(Date.now() - 1_000).toISOString();

const connected = {
  connected: true,
  username: "after2am",
  xUserId: "42",
  accessToken: "AT",
  refreshToken: "RT",
  tokenExpiresAt: future(),
  connectedAt: future(),
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SITE_URL = "https://after2amstories.com";
  process.env.NEXT_PUBLIC_FEATURE_X_POSTING = "true";
});

describe("shareStory (X)", () => {
  it("posts the tweet and stores the tweet id", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (postTweet as ReturnType<typeof vi.fn>).mockResolvedValue("TWEET1");
    const payload = fakePayload();

    const result = await shareStory(payload, 1);

    expect(postTweet).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "AT",
        text: expect.stringContaining("H"),
      })
    );
    expect(result).toEqual({ postId: "TWEET1" });
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { xPostId: "TWEET1" },
        context: { skipXAutoPost: true },
      })
    );
  });

  it("posts a varied engagement self-reply to the published tweet", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (postTweet as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("TWEET1")
      .mockResolvedValueOnce("REPLY1");
    const payload = fakePayload();

    await shareStory(payload, 1);

    expect(postTweet).toHaveBeenCalledTimes(2);
    // The follow-up is a reply to the main tweet and carries no link (the link
    // is already in the tweet body).
    expect(postTweet).toHaveBeenLastCalledWith(
      expect.objectContaining({ replyToTweetId: "TWEET1" })
    );
    const replyText = (postTweet as ReturnType<typeof vi.fn>).mock.calls[1][0]
      .text as string;
    expect(replyText).not.toContain("after2amstories.com");
  });

  it("does not fail the share when the self-reply fails", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (postTweet as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("TWEET1")
      .mockRejectedValueOnce(new Error("reply blew up"));
    const payload = fakePayload();

    const result = await shareStory(payload, 1);

    expect(result).toEqual({ postId: "TWEET1" });
    expect(payload.logger.error).toHaveBeenCalled();
  });

  it("refreshes an expired access token before posting", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...connected,
      tokenExpiresAt: past(),
    });
    (refreshAccessToken as ReturnType<typeof vi.fn>).mockResolvedValue({
      accessToken: "AT2",
      refreshToken: "RT2",
      expiresIn: 7200,
    });
    (postTweet as ReturnType<typeof vi.fn>).mockResolvedValue("TWEET2");

    await shareStory(fakePayload(), 1);

    expect(refreshAccessToken).toHaveBeenCalledWith("RT");
    expect(updateTokens).toHaveBeenCalled();
    expect(postTweet).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "AT2" })
    );
  });

  it("throws when X posting is disabled", async () => {
    delete process.env.NEXT_PUBLIC_FEATURE_X_POSTING;
    await expect(shareStory(fakePayload(), 1)).rejects.toThrow(/disabled/);
    expect(postTweet).not.toHaveBeenCalled();
  });

  it("short-circuits when already shared", async () => {
    const payload = fakePayload({
      findByID: vi.fn().mockResolvedValue({ ...story, xPostId: "OLD" }),
    });
    const result = await shareStory(payload, 1);
    expect(result).toEqual({ postId: "OLD", alreadyShared: true });
    expect(postTweet).not.toHaveBeenCalled();
  });

  it("errors when no X account is connected", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...connected,
      connected: false,
      accessToken: null,
    });
    await expect(shareStory(fakePayload(), 1)).rejects.toThrow(/X account/);
  });

  it("clears the connection on a 401", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (postTweet as ReturnType<typeof vi.fn>).mockRejectedValue(
      new XApiError("unauthorized", 401)
    );
    await expect(shareStory(fakePayload(), 1)).rejects.toThrow();
    expect(clearConnection).toHaveBeenCalled();
  });
});
