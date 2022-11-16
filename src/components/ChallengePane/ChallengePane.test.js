import "@testing-library/jest-dom";
import * as React from "react";
import { ChallengePane } from "./ChallengePane";

describe("ChallengePane", () => {
  it("renders page with Sortby component", () => {
    const { getByText } = global.withProvider(
      <ChallengePane
        setSearchFilters={() => null}
        clearSearchFilters={() => null}
        clearSearch={() => null}
        history={{ location: { pathname: "", search: "" } }}
      />
    );
    const text = getByText("Sort by");
    expect(text).toBeInTheDocument();
  });
});