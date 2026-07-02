import { describe, expect, it } from "vitest";
import { buildHashtags, extractNames } from "../hashtags";

describe("buildHashtags", () => {
  it("always leads with the brand hashtag", () => {
    expect(buildHashtags({})).toBe("#After2AM");
  });

  it("maps category values to their display labels", () => {
    expect(buildHashtags({ categories: ["HORROR", "CONFESSION"] })).toBe(
      "#After2AM #Horror #Confession"
    );
  });

  it("appends editorial tags after categories, CamelCasing multi-word names", () => {
    expect(
      buildHashtags({ categories: ["HORROR"], tags: ["true crime", "sleep paralysis"] })
    ).toBe("#After2AM #Horror #TrueCrime #SleepParalysis");
  });

  it("dedupes case-insensitively across sources", () => {
    expect(buildHashtags({ categories: ["HORROR"], tags: ["horror", "Horror"] })).toBe(
      "#After2AM #Horror"
    );
  });

  it("strips punctuation and diacritics from tags", () => {
    expect(buildHashtags({ tags: ["déjà vu", "what?!"] })).toBe(
      "#After2AM #DejaVu #What"
    );
  });

  it("caps the total number of hashtags at max", () => {
    expect(
      buildHashtags({ tags: ["one", "two", "three", "four"] }, 3)
    ).toBe("#After2AM #One #Two");
  });

  it("returns an empty string when max is non-positive", () => {
    expect(buildHashtags({ categories: ["HORROR"] }, 0)).toBe("");
  });

  it("ignores unknown category values gracefully by falling back to the raw value", () => {
    expect(buildHashtags({ categories: ["MYSTERY"] })).toBe("#After2AM #MYSTERY");
  });
});

describe("extractNames", () => {
  it("reads names from populated relationship objects", () => {
    expect(
      extractNames([{ id: 1, name: "true crime" }, { id: 2, name: "ghosts" }])
    ).toEqual(["true crime", "ghosts"]);
  });

  it("passes through plain string values (e.g. select categories)", () => {
    expect(extractNames(["HORROR", "ROMANCE"])).toEqual(["HORROR", "ROMANCE"]);
  });

  it("drops bare ids and empty entries", () => {
    expect(extractNames([1, 2, { id: 3 }, null])).toEqual([]);
  });

  it("returns [] for non-array input", () => {
    expect(extractNames(undefined)).toEqual([]);
    expect(extractNames(null)).toEqual([]);
  });
});
