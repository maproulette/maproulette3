import { describe, it, expect } from "vitest";
import { ActivityActionType } from "./ActivityActionTypes";

describe("ActivityActionType", () => {
  it("returns specific object when ran", () => {
    const value = ActivityActionType;

    expect(value).toStrictEqual({
      created: 1,
      deleted: 2,
      questionAnswered: 7,
      tagAdded: 5,
      tagRemoved: 6,
      taskStatusSet: 4,
      taskViewed: 3,
      updated: 0,
    });
  });

  it("returns undefined if index of 0 is ran", () => {
    const value = ActivityActionType;

    expect(value[0]).toBe(undefined);
  });
});
