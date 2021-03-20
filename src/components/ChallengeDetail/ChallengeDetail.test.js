import "@testing-library/jest-dom";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { ChallengeDetail } from "./ChallengeDetail.js";

describe("ChallengeDetail", () => {
  it("doesn't break if only required props are provided", () => {
    const { getByText } = render(
      <IntlProvider locale="en">
        <ChallengeDetail />
        <div>Test Passes</div>
      </IntlProvider>
    );
    const text = getByText("Test Passes");
    expect(text).toBeInTheDocument();
  });
});
