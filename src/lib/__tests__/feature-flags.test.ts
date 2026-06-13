import { describe, expect, it } from "vitest";
import { readFlag } from "@/lib/feature-flags";

describe("readFlag", () => {
  it("is on only for the exact string 'true'", () => {
    expect(readFlag("true")).toBe(true);
  });

  it("is off when unset", () => {
    expect(readFlag(undefined)).toBe(false);
  });

  it("is off for other truthy-looking values", () => {
    expect(readFlag("false")).toBe(false);
    expect(readFlag("1")).toBe(false);
    expect(readFlag("TRUE")).toBe(false);
    expect(readFlag("")).toBe(false);
  });
});
