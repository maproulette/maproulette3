import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom";
import { App } from "./App";

describe("App", () => {
  it("renders MapRoulette landing page and slogan", () => {
    const { getByText } = global.withProvider(<App />);
    const text = getByText("Be an instant contributor to the world’s maps");
    expect(text).toBeInTheDocument();
  });
});
