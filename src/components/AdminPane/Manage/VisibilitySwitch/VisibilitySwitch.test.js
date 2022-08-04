import "@testing-library/jest-dom";
import * as React from "react";
import { VisibilitySwitch } from "./VisibilitySwitch";

describe("Visibility Switch", () => {
  it("renders Visibility Switch if a challenge object is provided", () => {
    const { container } = global.withProvider(
      <VisibilitySwitch updateEnabled={() => null} challenge={{ enabled: false }} />
    );

    expect(container.firstChild.classList["0"]).toBe("mr-flex")
  });
});