import { afterEach, describe, expect, it, vi } from "vitest";

import { getMeOAuth1, postTweetOAuth1 } from "../client";
import { buildOAuth1Header, type OAuth1Credentials } from "../oauth1";

const CREDS: OAuth1Credentials = {
  consumerKey: "ck",
  consumerSecret: "cs",
  accessToken: "at",
  accessTokenSecret: "ats",
};

function mockFetchOnce(body: unknown, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
}

afterEach(() => vi.restoreAllMocks());

describe("buildOAuth1Header", () => {
  it("produces an OAuth header with all required signed fields", () => {
    const header = buildOAuth1Header({
      method: "POST",
      url: "https://api.twitter.com/2/tweets",
      creds: CREDS,
    });
    expect(header.startsWith("OAuth ")).toBe(true);
    expect(header).toContain('oauth_consumer_key="ck"');
    expect(header).toContain('oauth_token="at"');
    expect(header).toContain('oauth_signature_method="HMAC-SHA1"');
    expect(header).toContain('oauth_version="1.0"');
    expect(header).toMatch(/oauth_signature="[^"]+"/);
    expect(header).toMatch(/oauth_nonce="[0-9a-f]+"/);
    expect(header).toMatch(/oauth_timestamp="\d+"/);
  });

  it("generates a fresh nonce and signature each call", () => {
    const a = buildOAuth1Header({
      method: "GET",
      url: "https://api.twitter.com/2/users/me",
      creds: CREDS,
    });
    const b = buildOAuth1Header({
      method: "GET",
      url: "https://api.twitter.com/2/users/me",
      creds: CREDS,
    });
    expect(a).not.toBe(b);
  });
});

describe("getMeOAuth1", () => {
  it("signs the request with an OAuth 1.0a header", async () => {
    const spy = mockFetchOnce({
      data: { id: "7", username: "after2am", name: "After 2AM" },
    });
    const me = await getMeOAuth1(CREDS);
    expect(me).toEqual({ id: "7", username: "after2am", name: "After 2AM" });
    const [url, init] = spy.mock.calls[0];
    expect(String(url)).toBe("https://api.twitter.com/2/users/me");
    const headers = init?.headers as Record<string, string>;
    expect(headers.authorization.startsWith("OAuth ")).toBe(true);
  });
});

describe("postTweetOAuth1", () => {
  it("posts the text with an OAuth 1.0a header and returns the tweet id", async () => {
    const spy = mockFetchOnce({ data: { id: "TWEET9" } });
    const id = await postTweetOAuth1({ creds: CREDS, text: "hi" });
    expect(id).toBe("TWEET9");
    const [url, init] = spy.mock.calls[0];
    expect(String(url)).toBe("https://api.twitter.com/2/tweets");
    const headers = init?.headers as Record<string, string>;
    expect(headers.authorization.startsWith("OAuth ")).toBe(true);
    expect(JSON.parse(init?.body as string)).toEqual({ text: "hi" });
  });
});
