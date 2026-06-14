import { describe, expect, it } from "vitest";
import { appendRead } from "@/hooks/use-read-history";

describe("appendRead", () => {
  it("adds a new slug as the most-recent entry", () => {
    expect(appendRead(["a", "b"], "c")).toEqual(["a", "b", "c"]);
  });

  it("de-duplicates by moving an existing slug to the end", () => {
    expect(appendRead(["a", "b", "c"], "a")).toEqual(["b", "c", "a"]);
  });

  it("ignores empty slugs", () => {
    const history = ["a", "b"];
    expect(appendRead(history, "")).toBe(history);
  });

  it("caps the list, dropping the oldest entries", () => {
    expect(appendRead(["a", "b", "c"], "d", 3)).toEqual(["b", "c", "d"]);
  });

  it("re-reading the oldest within a full list keeps it without growing", () => {
    expect(appendRead(["a", "b", "c"], "a", 3)).toEqual(["b", "c", "a"]);
  });
});
