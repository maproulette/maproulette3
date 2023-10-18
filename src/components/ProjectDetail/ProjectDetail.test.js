import "@testing-library/jest-dom";
import * as React from "react";
import { ProjectDetail } from "./ProjectDetail";

describe("ProjectDetail", () => {
  it("renders page with with 'Cannot find matching name'", () => {
    const { getByText } = global.withProvider(
      <ProjectDetail
        project={{ id: 1, created: "", modified: "" }}
        unfilteredChallenges={[]}
      />
    );
    const text = getByText("Cannot find matching name");
    expect(text).toBeInTheDocument();
  });
});