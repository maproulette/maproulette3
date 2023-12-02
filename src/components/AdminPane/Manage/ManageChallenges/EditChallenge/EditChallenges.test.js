import "@testing-library/jest-dom";
import * as React from "react";
import { EditChallenges } from "./EditChallenges";

describe("EditChallenges", () => {
  it("renders loader", () => {
    const { container } = global.withProvider(
      <EditChallenges user={{ isLoggedIn: true, id: 1 }} history={{ location: "", push: () => null }} />
    );
    expect(container.firstChild.classList["0"]).toBe("pane-loading");
  });

  it("renders project with a challenge button", () => {
    const { getByText } = global.withProvider(
      <EditChallenges
        user={{
          isLoggedIn: true, 
          id: 1, 
          properties: { mr3Frontend: { settings: { tallied: { 1: [1, 2] } } } }
        }}
        history={{ location: "", push: () => null }} 
        project={{ id: 1, name: "project 1" }}
        intl={{ formatMessage: () => null }}
        challenges={[{ id: 1, name: "challenge 1" }, { id: 2, name: "challenge 2" }]}
      />
    );
    const challengeOne = getByText("challenge 1");
    expect(challengeOne).toBeInTheDocument();
    const challengeTwo = getByText("challenge 2");
    expect(challengeTwo).toBeInTheDocument();
  });
});
