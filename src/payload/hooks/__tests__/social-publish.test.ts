import { describe, expect, it } from "vitest";
import { becamePublished } from "../social-publish";

describe("becamePublished", () => {
  it("posts when a story is created already published (ingest workflow)", () => {
    expect(
      becamePublished({ status: "published", operation: "create" })
    ).toBe(true);
  });

  it("does not post when a story is created as a draft", () => {
    expect(becamePublished({ status: "draft", operation: "create" })).toBe(
      false
    );
  });

  it("posts when an update flips a draft to published", () => {
    expect(
      becamePublished({
        status: "published",
        previousStatus: "draft",
        operation: "update",
      })
    ).toBe(true);
  });

  it("does not re-post when an already-published story is edited", () => {
    expect(
      becamePublished({
        status: "published",
        previousStatus: "published",
        operation: "update",
      })
    ).toBe(false);
  });

  it("does not post when the new status is not published", () => {
    expect(
      becamePublished({
        status: "draft",
        previousStatus: "published",
        operation: "update",
      })
    ).toBe(false);
  });
});
