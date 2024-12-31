import { describe, expect, it } from "vitest";
import { messagesByFilter } from "./ChallengeFilter";

describe("messagesByFilter", () => {
  it("returns specific object when ran", () => {
    const value = messagesByFilter;

    expect(value).toStrictEqual({
      archived: {
        defaultMessage: "Archived",
        id: "Dashboard.ChallengeFilter.archived.label",
      },
      pinned: {
        defaultMessage: "Pinned",
        id: "Dashboard.ChallengeFilter.pinned.label",
      },
      visible: {
        defaultMessage: "Discoverable",
        id: "Dashboard.ChallengeFilter.visible.label",
      },
    });
  });
});
