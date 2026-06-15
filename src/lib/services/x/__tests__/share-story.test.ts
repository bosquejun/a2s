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

import { shareStory } from "../share-story";
import { XApiError, postTweet, refreshAccessToken } from "../client";
import { clearConnection, getConnection, updateTokens } from "../connection";

const story = { id: 1, slug: "s", title: "T", hook: "H", excerpt: "E" };

function fakePayload(overrides = {}) {
  return {
    findByID: vi.fn().mockResolvedValue(story),
    update: vi.fn().mockResolvedValue({}),
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
