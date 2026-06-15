import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../client", () => ({
  createMediaContainer: vi.fn(),
  publishMedia: vi.fn(),
}));
vi.mock("@/lib/services/facebook/connection", () => ({
  getConnection: vi.fn(),
  clearConnection: vi.fn(),
}));

import { shareStoryToInstagram } from "../share-story";
import { createMediaContainer, publishMedia } from "../client";
import { clearConnection, getConnection } from "@/lib/services/facebook/connection";
import { FacebookGraphError } from "@/lib/services/facebook/client";

const story = { id: 1, slug: "s", title: "T", hook: "H", excerpt: "E" };

function fakePayload(overrides = {}) {
  return {
    findByID: vi.fn().mockResolvedValue(story),
    update: vi.fn().mockResolvedValue({}),
    ...overrides,
  } as never;
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

  it("clears the connection on Graph error 190", async () => {
    (getConnection as ReturnType<typeof vi.fn>).mockResolvedValue(connected);
    (createMediaContainer as ReturnType<typeof vi.fn>).mockRejectedValue(
      new FacebookGraphError("expired", 190)
    );
    await expect(shareStoryToInstagram(fakePayload(), 1)).rejects.toThrow();
    expect(clearConnection).toHaveBeenCalled();
  });
});
