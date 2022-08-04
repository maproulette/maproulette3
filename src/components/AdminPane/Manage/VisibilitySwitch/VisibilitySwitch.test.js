import "@testing-library/jest-dom";
import * as React from "react";
import { fireEvent } from "@testing-library/react";
import { VisibilitySwitch } from "./VisibilitySwitch";

describe("Visibility Switch", () => {
  it("renders Visibility Switch if a challenge object is provided", () => {
    const { container } = global.withProvider(
      <VisibilitySwitch updateEnabled={() => updateEnabled()} challenge={{ enabled: false }} />
    );

    expect(container.firstChild.classList["0"]).toBe("mr-flex");
  });

  it("input onClick event does not call updateEnabled", () => {
    const updateEnabled = jest.fn();
    const { container } = global.withProvider(
      <VisibilitySwitch updateEnabled={() => updateEnabled()} challenge={{ enabled: false }} />
    );

    const element = container.querySelector('input[type=checkbox]');

    fireEvent.click(element);

    expect(updateEnabled).toHaveBeenCalledTimes(0);
  });
});