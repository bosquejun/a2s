import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  XApiError,
  buildOAuthUrl,
  exchangeCodeForToken,
  generatePkce,
  getMe,
  postTweet,
  refreshAccessToken,
} from "../client";

function mockFetchOnce(body: unknown, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
}

beforeEach(() => {
  process.env.X_CLIENT_ID = "CID";
  process.env.X_CLIENT_SECRET = "CSECRET";
  process.env.NEXT_PUBLIC_SITE_URL = "https://after2amstories.com";
});

afterEach(() => vi.restoreAllMocks());

describe("generatePkce", () => {
  it("returns a verifier and an S256 challenge (url-safe, unpadded)", () => {
    const { verifier, challenge } = generatePkce();
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(verifier).not.toBe(challenge);
  });
});

describe("buildOAuthUrl", () => {
  it("includes the PKCE challenge, scopes, state and redirect uri", () => {
    const url = new URL(buildOAuthUrl("STATE123", "CHALLENGE"));
    expect(url.origin + url.pathname).toBe(
      "https://twitter.com/i/oauth2/authorize"
    );
    const p = url.searchParams;
    expect(p.get("client_id")).toBe("CID");
    expect(p.get("response_type")).toBe("code");
    expect(p.get("state")).toBe("STATE123");
    expect(p.get("code_challenge")).toBe("CHALLENGE");
    expect(p.get("code_challenge_method")).toBe("S256");
    expect(p.get("scope")).toContain("tweet.write");
    expect(p.get("scope")).toContain("offline.access");
    expect(p.get("redirect_uri")).toBe(
      "https://after2amstories.com/api/x/callback"
    );
  });
});

describe("exchangeCodeForToken", () => {
  it("sends the verifier with Basic auth and maps the token response", async () => {
    const spy = mockFetchOnce({
      access_token: "AT",
      refresh_token: "RT",
      expires_in: 7200,
    });
    const tokens = await exchangeCodeForToken("CODE", "VERIFIER");
    expect(tokens).toEqual({
      accessToken: "AT",
      refreshToken: "RT",
      expiresIn: 7200,
    });
    const [, init] = spy.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers.authorization).toBe(
      `Basic ${Buffer.from("CID:CSECRET").toString("base64")}`
    );
    const body = init?.body as URLSearchParams;
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("CODE");
    expect(body.get("code_verifier")).toBe("VERIFIER");
  });

  it("throws XApiError on a token error", async () => {
    mockFetchOnce({ error: "invalid_grant", error_description: "bad" }, 400);
    await expect(
      exchangeCodeForToken("CODE", "VERIFIER")
    ).rejects.toBeInstanceOf(XApiError);
  });
});

describe("refreshAccessToken", () => {
  it("requests grant_type=refresh_token and returns rotated tokens", async () => {
    const spy = mockFetchOnce({
      access_token: "AT2",
      refresh_token: "RT2",
      expires_in: 7200,
    });
    const tokens = await refreshAccessToken("RT1");
    expect(tokens.accessToken).toBe("AT2");
    expect(tokens.refreshToken).toBe("RT2");
    const [, init] = spy.mock.calls[0];
    const body = init?.body as URLSearchParams;
    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("refresh_token")).toBe("RT1");
  });
});

describe("getMe", () => {
  it("returns the authorizing profile", async () => {
    mockFetchOnce({
      data: { id: "42", username: "after2am", name: "After 2AM" },
    });
    const me = await getMe("AT");
    expect(me).toEqual({ id: "42", username: "after2am", name: "After 2AM" });
  });

  it("throws XApiError when the profile request fails", async () => {
    mockFetchOnce({ title: "Unauthorized" }, 401);
    await expect(getMe("AT")).rejects.toBeInstanceOf(XApiError);
  });
});

describe("postTweet", () => {
  it("posts the text with a bearer token and returns the tweet id", async () => {
    const spy = mockFetchOnce({ data: { id: "TWEET1" } });
    const id = await postTweet({ accessToken: "AT", text: "hello" });
    expect(id).toBe("TWEET1");
    const [url, init] = spy.mock.calls[0];
    expect(String(url)).toBe("https://api.twitter.com/2/tweets");
    const headers = init?.headers as Record<string, string>;
    expect(headers.authorization).toBe("Bearer AT");
    expect(JSON.parse(init?.body as string)).toEqual({ text: "hello" });
  });

  it("surfaces the status on failure", async () => {
    mockFetchOnce({ detail: "rate limited" }, 429);
    await expect(
      postTweet({ accessToken: "AT", text: "hello" })
    ).rejects.toMatchObject({ status: 429 });
  });
});
