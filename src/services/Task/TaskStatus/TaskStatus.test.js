import { describe, expect, it } from "vitest";
import { isReviewableStatus, messagesByStatus } from "./TaskStatus";

describe("isMetaReviewStatus", () => {
  it("returns specific object when ran", () => {
    const value = messagesByStatus;

    expect(value).toStrictEqual({
      0: { defaultMessage: "Created", id: "Activity.action.created" },
      1: { defaultMessage: "Fixed", id: "Admin.Task.fields.actions.fixed" },
      2: { defaultMessage: "Not an Issue", id: "Admin.Task.fields.actions.notAnIssue" },
      3: { defaultMessage: "Skipped", id: "Admin.Task.fields.actions.skipped" },
      4: { defaultMessage: "Deleted", id: "Activity.action.deleted" },
      5: { defaultMessage: "Already Fixed", id: "Admin.Task.fields.actions.alreadyFixed" },
      6: { defaultMessage: "Can't Complete", id: "Admin.Task.fields.actions.tooHard" },
      9: { defaultMessage: "Disabled", id: "Admin.Project.fields.disabled.tooltip" },
    });
  });
  it("returns true if the function isReviewableStatus doesnt have a parameter", () => {
    const value = isReviewableStatus();

    expect(value).toBe(true);
  });
});
