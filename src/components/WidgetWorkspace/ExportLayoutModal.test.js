import React from "react";
import { render } from "@testing-library/react";
import ExportLayoutModal from "./ExportLayoutModal";

describe("ExportLayoutModal", () => {
  //create div element
  // beforeAll();

  //remove div element
  // afterAll();

  it("doesn't break if only required props are provided", () => {
    const { getByText, debug } = global.withProvider(
      <ExportLayoutModal onCancel={() => null} onDownload={() => null} />
    );
    const component = getByText("Export your layout");
    expect(component).toBeInTheDocument();
  });
});
