import { describe, expect, it } from "vitest";
import { messagesByReviewLoadMethod } from "./TaskReviewLoadMethod";

describe("messagesByReviewLoadMethod", () => {
  it("returns specific object when ran", () => {
    const value = messagesByReviewLoadMethod;

    expect(value).toStrictEqual({
      all: {
        defaultMessage: "Back to Review All",
        id: "Task.review.loadByMethod.all",
      },
      inbox: {
        defaultMessage: "Back to Inbox",
        id: "Task.review.loadByMethod.inbox",
      },
      nearby: {
        defaultMessage: "Nearby Task",
        id: "Task.review.loadByMethod.nearby",
      },
      next: {
        defaultMessage: "Next Filtered Task",
        id: "Task.review.loadByMethod.next",
      },
      undefined: {
        defaultMessage: "Unreviewed",
        id: "Task.reviewStatus.meta-unset",
      },
    });
  });
});
