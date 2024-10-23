import { describe, it, expect } from "vitest";
import { TaskAction, zeroTaskActions } from "./TaskAction";
import { TaskStatus } from "../TaskStatus/TaskStatus";

describe("TaskAction", () => {
  it("returns specific object when ran", () => {
    expect(TaskAction).toEqual({
      alreadyFixed: "alreadyFixed",
      answered: "answered",
      available: "available",
      deleted: "deleted",
      falsePositive: "falsePositive",
      fixed: "fixed",
      skipped: "skipped",
      tooHard: "tooHard",
    });
  });

  it("returns specific object when ran with parameter TaskStatus", () => {
    expect(zeroTaskActions(TaskStatus)).toEqual({
      alreadyFixed: 0,
      available: 0,
      created: 0,
      deleted: 0,
      disabled: 0,
      falsePositive: 0,
      fixed: 0,
      skipped: 0,
      tooHard: 0,
      total: 0,
    });
  });
});
