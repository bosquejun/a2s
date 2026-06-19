import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../client", async () => {
  const actual = await vi.importActual<typeof import("../client")>("../client");
  return {
    ...actual,
    createTextContainer: vi.fn(),
    publishContainer: vi.fn(),
    refreshLongLivedToken: vi.fn(),
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

import { shareStoryToThreads } from "../share-story";
import {
  ThreadsApiError,
  createTextContainer,
  publishContainer,
  refreshLongLivedToken,
} from "../client";
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

/** A connection whose token is comfortably in the future (no refresh needed). */
const connected = {
  connected: true,
  username: "after2am",
  threadsUserId: "TH1",
  accessToken: "TOK",
  tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SITE_URL = "https://after2amstories.com";
});

describe("shareStoryToThreads", () => {
  it("creates a container, publishes, and stores the post id", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createTextContainer as ReturnType<typeof vi.fn>).mockResolvedValue("C1");
    (publishContainer as ReturnType<typeof vi.fn>).mockResolvedValue("P1");
    const payload = fakePayload();

    const result = await shareStoryToThreads(payload, 1);

    expect(createTextContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        threadsUserId: "TH1",
        accessToken: "TOK",
        text: expect.stringContaining("https://after2amstories.com/story/s"),
      })
    );
    expect(refreshLongLivedToken).not.toHaveBeenCalled();
    expect(result).toEqual({ postId: "P1" });
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { threadsPostId: "P1" },
        context: { skipThreadsAutoPost: true },
      })
    );
  });

  it("posts a varied engagement self-reply to the published post", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createTextContainer as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("C1")
      .mockResolvedValueOnce("CR");
    (publishContainer as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("P1")
      .mockResolvedValueOnce("PR");
    const payload = fakePayload();

    await shareStoryToThreads(payload, 1);

    expect(createTextContainer).toHaveBeenCalledTimes(2);
    // The follow-up replies to the main post and carries no link (the link is
    // already in the post body).
    expect(createTextContainer).toHaveBeenLastCalledWith(
      expect.objectContaining({ replyToId: "P1" })
    );
    const replyText = (createTextContainer as ReturnType<typeof vi.fn>).mock
      .calls[1][0].text as string;
    expect(replyText).not.toContain("after2amstories.com");
  });

  it("does not fail the share when the self-reply fails", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createTextContainer as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce("C1")
      .mockRejectedValueOnce(new Error("reply blew up"));
    (publishContainer as ReturnType<typeof vi.fn>).mockResolvedValue("P1");
    const payload = fakePayload();

    const result = await shareStoryToThreads(payload, 1);

    expect(result).toEqual({ postId: "P1" });
    expect(payload.logger.error).toHaveBeenCalled();
  });

  it("refreshes a near-expiry token before posting", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...connected,
      tokenExpiresAt: new Date(Date.now() + 60 * 1000).toISOString(),
    });
    (refreshLongLivedToken as ReturnType<typeof vi.fn>).mockResolvedValue({
      accessToken: "NEW",
      expiresIn: 5_184_000,
    });
    (createTextContainer as ReturnType<typeof vi.fn>).mockResolvedValue("C1");
    (publishContainer as ReturnType<typeof vi.fn>).mockResolvedValue("P1");

    await shareStoryToThreads(fakePayload(), 1);

    expect(refreshLongLivedToken).toHaveBeenCalledWith("TOK");
    expect(updateTokens).toHaveBeenCalled();
    expect(createTextContainer).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "NEW" })
    );
  });

  it("short-circuits when already shared", async () => {
    const payload = fakePayload({
      findByID: vi.fn().mockResolvedValue({ ...story, threadsPostId: "OLD" }),
    });
    const result = await shareStoryToThreads(payload, 1);
    expect(result).toEqual({ postId: "OLD", alreadyShared: true });
    expect(createTextContainer).not.toHaveBeenCalled();
  });

  it("errors when no Threads account is connected", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...connected,
      connected: false,
      accessToken: null,
    });
    await expect(shareStoryToThreads(fakePayload(), 1)).rejects.toThrow(
      /Threads/
    );
  });

  it("clears the connection on API error 190", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createTextContainer as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ThreadsApiError("expired", 190)
    );
    await expect(shareStoryToThreads(fakePayload(), 1)).rejects.toThrow();
    expect(clearConnection).toHaveBeenCalled();
  });
});
