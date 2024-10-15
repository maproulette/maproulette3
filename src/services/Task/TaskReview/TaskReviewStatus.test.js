import { describe, it, expect } from "vitest";
import {
  isMetaReviewStatus,
  isNeeded,
  hasBeenReviewed,
  isNeedsReviewStatus,
} from "./TaskReviewStatus";

describe("isMetaReviewStatus", () => {
  it("returns true if the function isMetaReviewStatus doesnt have a parameter", () => {
    const value = isMetaReviewStatus();

    expect(value).toBe(true);
  });
  it("returns false if the function isNeedsReviewStatus doesnt have a parameter", () => {
    const value = isNeedsReviewStatus();

    expect(value).toBe(false);
  });
  it("returns false if the function isNeeded doesnt have a parameter", () => {
    const value = isNeeded();

    expect(value).toBe(false);
  });
  it("returns true if the function hasBeenReviewed doesnt have a parameter", () => {
    const value = hasBeenReviewed();

    expect(value).toBe(true);
  });
});
