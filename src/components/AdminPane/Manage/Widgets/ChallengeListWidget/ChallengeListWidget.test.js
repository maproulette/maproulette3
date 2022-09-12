import "@testing-library/jest-dom";
import * as React from "react";
import ChallengeListWidget from "./ChallengeListWidget";

describe("ChallengeListWidget", () => {
  it("renders challenge list widget with 'No Challenges' message", () => {
    const { getByText } = global.withProvider(
      <ChallengeListWidget project={{ id: 1 }} talliedChallenges={() => null} projects={[]} intl={{ formatMessage: () => null }} />
    );
    const text = getByText("No Challenges");
    expect(text).toBeInTheDocument();
  });
});