import "@testing-library/jest-dom";
import * as React from "react";
import { ProgressTooltip } from "./ChallengeProgress";

describe("ProgressTooltip", () => {
  it("renders value with % sign", () => {
    const { getByText } = global.withProvider(
      <ProgressTooltip input={{ value: 86 }} />
    );
    const text = getByText("86%");
    expect(text).toBeInTheDocument();
  });
});