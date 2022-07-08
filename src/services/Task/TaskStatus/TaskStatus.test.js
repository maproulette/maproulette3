import { messagesByStatus, isReviewableStatus } from "./TaskStatus";

describe("isMetaReviewStatus", () => {
  it("returns specific object when ran", () => {
    const value = messagesByStatus;

    expect(value).toStrictEqual({
      0: { defaultMessage: "Created", id: "Task.status.created" },
      1: { defaultMessage: "Fixed", id: "Task.status.fixed" },
      2: { defaultMessage: "Not an Issue", id: "Task.status.falsePositive" },
      3: { defaultMessage: "Skipped", id: "Task.status.skipped" },
      4: { defaultMessage: "Deleted", id: "Task.status.deleted" },
      5: { defaultMessage: "Already Fixed", id: "Task.status.alreadyFixed" },
      6: { defaultMessage: "Too Hard", id: "Task.status.tooHard" },
      9: { defaultMessage: "Disabled", id: "Task.status.disabled" },
    });
  });
  it("returns true if the function isReviewableStatus doesnt have a parameter", () => {
    const value = isReviewableStatus();

    expect(value).toBe(true);
  });
});
