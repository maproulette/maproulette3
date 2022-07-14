import "@testing-library/jest-dom";
import * as React from "react";
import { App } from "./App";

describe("App", () => {
  it("renders", () => {
    const { getByText } = global.withProvider(
      <App />
    );
    const text = getByText("Be an instant contributor to the world’s maps");
    expect(text).toBeInTheDocument();
  });
});
