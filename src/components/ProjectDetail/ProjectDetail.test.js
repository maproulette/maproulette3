import "@testing-library/jest-dom";
import * as React from "react";
import { ProjectDetail } from "./ProjectDetail";
import { format } from "date-fns";

describe("ProjectDetail", () => {
  it("renders page with with 'Cannot find matching name'", () => {
    const { getByText } = global.withProvider(
      <ProjectDetail
        project={{ id: 1, created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"), modified: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") }}
        unfilteredChallenges={[]}
      />
    );
    const text = getByText("Cannot find matching name");
    expect(text).toBeInTheDocument();
  });
});