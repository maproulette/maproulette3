import React from "react";
import AchievementBadge from "./AchievementBadge";

describe("AchievementBadge", () => {
  it("renders with achievement 15", async () => {
    await global.withProvider(
      <AchievementBadge achievement={16} stackDepth={3} />
    );
  });
});
