import { describe, expect, it } from "vitest";
import { ProjectFilter, defaultProjectFilters } from "./ProjectFilter";

describe("ProjectFilter", () => {
  it("returns object", () => {
    expect(ProjectFilter).toStrictEqual({
      archived: "archived",
      owner: "owner",
      pinned: "pinned",
      visible: "visible",
    });
  });

  it("returns object variables as false", () => {
    expect(defaultProjectFilters()).toStrictEqual({
      archived: false,
      owner: false,
      pinned: false,
      visible: false,
    });
  });
});
