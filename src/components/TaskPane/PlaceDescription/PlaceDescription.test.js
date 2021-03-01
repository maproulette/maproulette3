import "@testing-library/jest-dom";
import * as React from "react";
import { render } from "@testing-library/react";
import PlaceDescription from "./PlaceDescription.js";

describe("PlaceDescription", () => {
  it("doesn't break if no props are provided", () => {
    const { getByTestId } = render(<PlaceDescription />);
    const component = getByTestId("place-description");
    expect(component).toBeTruthy();
  });

  it("prioritizes city in address info", () => {
    const address = {
      city: "Test City",
      town: "Test Town",
      hamlet: "Test Hamlet",
      village: "Test Village",
      county: "Test County",
      state: "TS",
      country: "Test Country",
      continent: "Test Continent",
    };

    const { getByText } = render(<PlaceDescription address={address} />);
    const textNode = getByText("Test City, Test County, TS, Test Country");
    expect(textNode).toBeTruthy();
  });

  it("shows town if no city", () => {
    const address = {
      town: "Test Town",
      hamlet: "Test Hamlet",
      village: "Test Village",
      county: "Test County",
      state: "TS",
      country: "Test Country",
      continent: "Test Continent",
    };

    const { getByText } = render(<PlaceDescription address={address} />);
    const textNode = getByText("Test Town, Test County, TS, Test Country");
    expect(textNode).toBeTruthy();
  });

  it("shows hamlet if no city/town", () => {
    const address = {
      hamlet: "Test Hamlet",
      village: "Test Village",
      county: "Test County",
      state: "TS",
      country: "Test Country",
      continent: "Test Continent",
    };

    const { getByText } = render(<PlaceDescription address={address} />);
    const textNode = getByText("Test Hamlet, Test County, TS, Test Country");
    expect(textNode).toBeTruthy();
  });

  it("shows village if no city/town/hamlet", () => {
    const address = {
      village: "Test Village",
      county: "Test County",
      state: "TS",
      country: "Test Country",
      continent: "Test Continent",
    };

    const { getByText } = render(<PlaceDescription address={address} />);
    const textNode = getByText("Test Village, Test County, TS, Test Country");
    expect(textNode).toBeTruthy();
  });

  it("shows continent if no country", () => {
    const address = {
      village: "Test Village",
      county: "Test County",
      state: "TS",
      continent: "Test Continent",
    };

    const { getByText } = render(<PlaceDescription address={address} />);
    const textNode = getByText("Test Village, Test County, TS, Test Continent");
    expect(textNode).toBeTruthy();
  });

  it("doesn't break if incorrect propType is provided", () => {
    const address = "asdf";

    const { getByTestId } = render(<PlaceDescription address={address} />);
    const component = getByTestId("place-description");
    expect(component).toBeTruthy();
  });

  it("doesn't break if incorrect propTypes are provided in address params", () => {
    const address = {
      village: [],
      county: {},
      state: null,
      continent: 1,
    };

    const { getByTestId } = render(<PlaceDescription address={address} />);
    const component = getByTestId("place-description");
    expect(component).toBeTruthy();
  });
});
