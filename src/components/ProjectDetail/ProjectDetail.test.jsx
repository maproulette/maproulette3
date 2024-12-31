import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import { format } from "date-fns";
import { ProjectDetail } from "./ProjectDetail";

describe("ProjectDetail", () => {
  it("renders page with with 'Cannot find matching name'", () => {
    const { getByText } = global.withProvider(
      <ProjectDetail
        project={{
          id: 1,
          created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          modified: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        }}
        owner={{ id: 2, osmProfile: { displayName: "Somebody" } }}
        unfilteredChallenges={[]}
      />,
    );
    const text = getByText("Cannot find matching name");
    expect(text).toBeInTheDocument();
  });
});
