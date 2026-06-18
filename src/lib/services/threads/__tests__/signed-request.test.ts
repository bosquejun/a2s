import { createHmac } from "crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { parseSignedRequest } from "../signed-request";

const SECRET = "test-app-secret";

function sign(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(encoded).digest("base64url");
  return `${sig}.${encoded}`;
}

beforeEach(() => {
  process.env.THREADS_APP_ID = "app-id";
  process.env.THREADS_APP_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.THREADS_APP_ID;
  delete process.env.THREADS_APP_SECRET;
});

describe("parseSignedRequest", () => {
  it("decodes a correctly signed request", () => {
    const out = parseSignedRequest(sign({ user_id: "TH1" }));
    expect(out).toEqual({ user_id: "TH1" });
  });

  it("rejects a tampered payload (signature mismatch)", () => {
    const valid = sign({ user_id: "TH1" });
    const forgedPayload = Buffer.from(
      JSON.stringify({ user_id: "EVIL" })
    ).toString("base64url");
    const forged = `${valid.split(".")[0]}.${forgedPayload}`;
    expect(parseSignedRequest(forged)).toBeNull();
  });

  it("rejects a request signed with the wrong secret", () => {
    const encoded = Buffer.from(JSON.stringify({ user_id: "TH1" })).toString(
      "base64url"
    );
    const sig = createHmac("sha256", "wrong-secret")
      .update(encoded)
      .digest("base64url");
    expect(parseSignedRequest(`${sig}.${encoded}`)).toBeNull();
  });

  it("returns null for malformed input", () => {
    expect(parseSignedRequest(null)).toBeNull();
    expect(parseSignedRequest("nodot")).toBeNull();
    expect(parseSignedRequest("")).toBeNull();
  });
});
