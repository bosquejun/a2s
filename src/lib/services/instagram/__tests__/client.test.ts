import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMediaContainer,
  getInstagramUserId,
  publishMedia,
} from "../client";
import { FacebookGraphError } from "@/lib/services/facebook/client";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status: ok ? status : status === 200 ? 400 : status,
      })
    );
}

afterEach(() => vi.restoreAllMocks());

describe("getInstagramUserId", () => {
  it("returns the linked instagram_business_account id", async () => {
    mockFetchOnce({ instagram_business_account: { id: "178414" } });
    const id = await getInstagramUserId("PAGE1", "TOKEN");
    expect(id).toBe("178414");
  });

  it("returns null when no instagram account is linked", async () => {
    mockFetchOnce({ id: "PAGE1" });
    const id = await getInstagramUserId("PAGE1", "TOKEN");
    expect(id).toBeNull();
  });
});

describe("createMediaContainer", () => {
  it("posts image_url + caption and returns the creation id", async () => {
    const spy = mockFetchOnce({ id: "CONTAINER1" });
    const id = await createMediaContainer({
      igUserId: "IG1",
      pageAccessToken: "TOKEN",
      imageUrl: "https://x/og.jpg",
      caption: "hi",
    });
    expect(id).toBe("CONTAINER1");
    const [, init] = spy.mock.calls[0];
    const body = init?.body as URLSearchParams;
    expect(body.get("image_url")).toBe("https://x/og.jpg");
    expect(body.get("caption")).toBe("hi");
  });

  it("throws FacebookGraphError with the Graph error code", async () => {
    mockFetchOnce({ error: { message: "bad", code: 190 } }, false);
    await expect(
      createMediaContainer({
        igUserId: "IG1",
        pageAccessToken: "TOKEN",
        imageUrl: "https://x/og.jpg",
        caption: "hi",
      })
    ).rejects.toMatchObject({ code: 190 });
  });
});

describe("publishMedia", () => {
  it("publishes the creation id and returns the media id", async () => {
    const spy = mockFetchOnce({ id: "MEDIA1" });
    const id = await publishMedia({
      igUserId: "IG1",
      pageAccessToken: "TOKEN",
      creationId: "CONTAINER1",
    });
    expect(id).toBe("MEDIA1");
    const [, init] = spy.mock.calls[0];
    const body = init?.body as URLSearchParams;
    expect(body.get("creation_id")).toBe("CONTAINER1");
  });
});

it("reuses FacebookGraphError class", () => {
  expect(new FacebookGraphError("x", 1)).toBeInstanceOf(Error);
});
