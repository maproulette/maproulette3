import "@testing-library/jest-dom";
import { EditChallenges } from "./EditChallenges";

describe("EditChallenges", () => {
  it("renders loader", () => {
    const { container } = global.withProvider(
      <EditChallenges user={{ isLoggedIn: true, id: 1 }} history={{ location: "", push: () => null }} />
    );
    expect(container.firstChild.classList["0"]).toBe("pane-loading");
  });
});
