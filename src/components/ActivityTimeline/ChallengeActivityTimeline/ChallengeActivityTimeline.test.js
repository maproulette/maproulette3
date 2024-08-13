import "@testing-library/jest-dom";
import { fireEvent } from "@testing-library/react";
import { ChallengeActivityTimeline } from "./ChallengeActivityTimeline";

describe("ChallengeActivityTimeline", () => {
  it("renders ChallengeActivityTimeline successfully", () => {
    const { container } = global.withProvider(
      <ChallengeActivityTimeline intl={{ formatMessage: () => null }}/>
    );

    expect(container.firstChild.classList["0"]).toBe("mr-timeline");
  });

  it("renders ChallengeActivityTimeline successfully", () => {
    const { getByText } = global.withProvider(
      <ChallengeActivityTimeline intl={{ formatMessage: () => null, formatDate: () => null }} activity={[{
        count: 10,
        date: "2022-08-03T00:00:00",
        status: 3,
        statusName: "Skipped",
      }]}/>
    );

    const text = getByText("10");
    expect(text).toBeInTheDocument();
  });
});