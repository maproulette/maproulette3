import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { ChallengePane } from "./ChallengePane";

describe("ChallengePane", () => {
  it("renders page with Sortby component", () => {
    const { getByText } = global.withProvider(
      <ChallengePane
        setSearchFilters={() => null}
        removeSearchFilters={() => {}}
        locateMapToUser={() => {}}
        unfilteredChallenges={[]}
        history={{ location: { pathname: "", search: "" } }}
      />
    );
    const text = getByText("Sort by");
    expect(text).toBeInTheDocument();
  });
});