import "@testing-library/jest-dom";
import * as React from "react";
import ChallengeEndModal from "./ChallengeEndModal";

describe("ChallengeEndModal", () => {
  it("renders MapRoulette landing page and slogan", () => {
    const { getByText } = global.withProvider(
      <ChallengeEndModal />
    );
    const text = getByText("Challenge End");
    expect(text).toBeInTheDocument();
  });
});
