import { describe, expect, it } from "vitest";
import { TaskPriorityColors } from "./TaskPriority";

describe("TaskPriorityColors", () => {
  it("returns specific object when ran", () => {
    const value = TaskPriorityColors;

    expect(value).toStrictEqual({ 0: "#FF5E63", 1: "#F7BB59", 2: "#6FB3B8" });
  });
});
