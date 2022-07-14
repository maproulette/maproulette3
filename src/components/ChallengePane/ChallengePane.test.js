import "@testing-library/jest-dom";
import * as React from "react";
import { ChallengePane } from "./ChallengePane";

describe("ChallengePane", () => {
  it("renders MapRoulette landing page and slogan", () => {
    const { getByText } = global.withProvider(
      <ChallengePane
        setSearchFilters={() => null}
        history={{ location: { pathname: "", search: "" } }}
      />
    );
    const text = getByText("Sort by");
    expect(text).toBeInTheDocument();
  });
});