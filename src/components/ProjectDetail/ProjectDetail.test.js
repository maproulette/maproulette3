import "@testing-library/jest-dom";
import * as React from "react";
import { ProjectDetail } from "./ProjectDetail";

describe("ProjectDetail", () => {
  it("renders page with No Results", () => {
    const { getByText } = global.withProvider(
      <ProjectDetail
        project={{ id: 1 }}
        unfilteredChallenges={[]}
      />
    );
    const text = getByText("No Results");
    expect(text).toBeInTheDocument();
  });
});