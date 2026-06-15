import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * Stateless CSRF state for the Facebook OAuth dance. The `state` round-tripped
 * through Facebook is a signed `nonce.timestamp` token; verifying the signature
 * (and a short validity window) on the callback proves the redirect originated
 * from our own connect route rather than a forged link.
 */
const MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function sign(value: string): string {
  const secret = process.env.PAYLOAD_SECRET ?? "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createState(): string {
  const payload = `${randomBytes(16).toString("hex")}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyState(state: string | null): boolean {
  if (!state) return false;
  const parts = state.split(".");
  if (parts.length !== 3) return false;
  const [nonce, ts, sig] = parts;
  const expected = sign(`${nonce}.${ts}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const age = Date.now() - Number(ts);
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_MS;
}
