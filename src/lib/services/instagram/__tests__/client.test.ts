import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createCarouselContainer,
  createCarouselItemContainer,
  createMediaContainer,
  getContainerStatus,
  getInstagramUserId,
  publishMedia,
  waitForMediaContainer,
} from "../client";
import { FacebookGraphError } from "@/lib/services/facebook/client";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
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

describe("createCarouselItemContainer", () => {
  it("stages a carousel child with is_carousel_item", async () => {
    const spy = mockFetchOnce({ id: "CHILD1" });
    const id = await createCarouselItemContainer({
      igUserId: "IG1",
      pageAccessToken: "TOKEN",
      imageUrl: "https://x/slide/0.jpg",
    });
    expect(id).toBe("CHILD1");
    const [, init] = spy.mock.calls[0];
    const body = init?.body as URLSearchParams;
    expect(body.get("image_url")).toBe("https://x/slide/0.jpg");
    expect(body.get("is_carousel_item")).toBe("true");
  });
});

describe("createCarouselContainer", () => {
  it("stages the parent with media_type CAROUSEL and joined children", async () => {
    const spy = mockFetchOnce({ id: "PARENT1" });
    const id = await createCarouselContainer({
      igUserId: "IG1",
      pageAccessToken: "TOKEN",
      children: ["CHILD1", "CHILD2"],
      caption: "hi",
    });
    expect(id).toBe("PARENT1");
    const [, init] = spy.mock.calls[0];
    const body = init?.body as URLSearchParams;
    expect(body.get("media_type")).toBe("CAROUSEL");
    expect(body.get("children")).toBe("CHILD1,CHILD2");
    expect(body.get("caption")).toBe("hi");
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

describe("getContainerStatus", () => {
  it("returns the status_code", async () => {
    mockFetchOnce({ status_code: "FINISHED" });
    const status = await getContainerStatus({
      creationId: "C1",
      pageAccessToken: "TOKEN",
    });
    expect(status).toBe("FINISHED");
  });
});

describe("waitForMediaContainer", () => {
  it("resolves once the container is FINISHED", async () => {
    mockFetchOnce({ status_code: "FINISHED" });
    await expect(
      waitForMediaContainer({ creationId: "C1", pageAccessToken: "TOKEN" })
    ).resolves.toBeUndefined();
  });

  it("throws when the container reports ERROR", async () => {
    mockFetchOnce({ status_code: "ERROR" });
    await expect(
      waitForMediaContainer({ creationId: "C1", pageAccessToken: "TOKEN" })
    ).rejects.toMatchObject({ name: "FacebookGraphError" });
  });
});

it("reuses FacebookGraphError class", () => {
  expect(new FacebookGraphError("x", 1)).toBeInstanceOf(Error);
});
