import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import CongratulateModal from "./CongratulateModal";

describe("CongratulateModal", () => {
  it("renders MapRoulette landing page and slogan", () => {
    const { getByText } = global.withProvider(
      <CongratulateModal />
    );
    const text = getByText("Challenge is complete");
    expect(text).toBeInTheDocument();
  });
});
