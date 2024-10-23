import { describe, it, expect } from "vitest";
import { constructChangesetUrl } from "./constructChangesetUrl";

describe("constructChangesetUrl", () => {
  it("returns empty string if no task is provided", () => {
    expect(constructChangesetUrl()).toBe("");
  });

  it("returns empty string if challenge is not enabled", () => {
    const task = { parent: { enabled: false, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns empty string if project is not enabled", () => {
    const task = { parent: { parent: { enabled: false }, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns url if challenge and project are enabled", () => {
    const task = { parent: { enabled: true, parent: { enabled: true }, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe(
      " https://mpr.lt/c/1/t/2"
    );
  });
});
