import { describe, expect, it } from "vitest";
import createBlob from "./createBlob";

describe("createBlob", () => {
  it("returns undefined if given random jasonData", () => {
    const value = createBlob("1", {
      data: [{ id: 1, name: "jsonData" }],
    });

    expect(value[0]).toBe(undefined);
  });
});
