import { describe, expect, it, vi } from "vitest";

import { getLinkInCommentSettings } from "../settings";

function fakePayload(findGlobal: unknown) {
  return { findGlobal } as unknown as import("payload").Payload;
}

describe("getLinkInCommentSettings", () => {
  it("reads the per-platform toggles from SiteSettings", async () => {
    const payload = fakePayload(
      vi.fn().mockResolvedValue({
        linkInComment: { facebook: true, instagram: false },
      })
    );
    await expect(getLinkInCommentSettings(payload)).resolves.toEqual({
      facebook: true,
      instagram: false,
    });
  });

  it("defaults missing values to false", async () => {
    const payload = fakePayload(vi.fn().mockResolvedValue({}));
    await expect(getLinkInCommentSettings(payload)).resolves.toEqual({
      facebook: false,
      instagram: false,
    });
  });

  it("falls back to off when reading settings throws", async () => {
    const payload = fakePayload(
      vi.fn().mockRejectedValue(new Error("no global"))
    );
    await expect(getLinkInCommentSettings(payload)).resolves.toEqual({
      facebook: false,
      instagram: false,
    });
  });
});
