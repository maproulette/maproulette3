import { describe, expect, it } from "vitest";
import bundleByTaskBundleId from "./bundleByTaskBundleId";

describe("bundleByTaskBundleId", () => {
  const tasks = [
    {
      properties: [["placeholder"]],
    },
  ];
  it("returns string if there are tasks", () => {
    expect(bundleByTaskBundleId(tasks, 0)).toBe(
      '{"type":"FeatureCollection","features":[{"properties":[["placeholder"]]}]}',
    );
  });
  it("returns empty string if there are no tasks", () => {
    expect(bundleByTaskBundleId([])).toBe("");
  });
});
