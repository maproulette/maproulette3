import { describe, it, expect } from "vitest";
import { formatErrorTags } from "./errorTagUtils";

describe("formatErrorTags", () => {
  it("returns undefined if given an empty string", () => {
    const value = formatErrorTags("");

    expect(value).toBe(undefined);
  });

  it("returns error tag name if given a stringified id", () => {
    const value = formatErrorTags("1", {
      data: [{ id: 1, name: "test error tag" }],
    });

    expect(value[0]).toBe("test error tag");
  });
});
