import React from "react";
import AchievementBadge from "./AchievementBadge";

describe("AchievementBadge", () => {
  it("renders with achievement 16", async () => {
    await global.withProvider(
      <AchievementBadge achievement={16} stackDepth={3} />
    );
  });
});
