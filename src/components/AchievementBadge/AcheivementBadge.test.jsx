import { act } from "@testing-library/react";
import AchievementBadge from "./AchievementBadge";

describe("AchievementBadge", () => {
  it("renders with achievement 16", async () => {
    await act(async () => {
      global.withProvider(<AchievementBadge achievement={16} stackDepth={3} />);
    });
  });
});
