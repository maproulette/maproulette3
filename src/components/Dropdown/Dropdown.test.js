import * as React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import Dropdown from "./Dropdown.js";

describe("Dropdown", () => {
  beforeAll(() => {
    ReactDOM.createPortal = jest.fn((element) => {
      return element;
    });
  });

  afterEach(() => {
    ReactDOM.createPortal.mockClear();
  });

  it("doesn't break if only required props are provided", () => {
    const { getByTestId } = render(
      <Dropdown dropdownButton={() => null} dropdownContent={() => null} />
    );
    const component = getByTestId("mr-dropdown");
    expect(component).toBeInTheDocument();
  });

  it("clicking dropdown button or dropdown itself doesn't trigger setVisible from the event listener", async () => {
    render(
      <Dropdown
        dropdownButton={(funcs) => (
          <div>
            <div onClick={funcs.toggleDropdownVisible}>Icon</div>
            {!funcs.isDropdownVisible && <div>Dropdown hidden</div>}
          </div>
        )}
        dropdownContent={() => <div>Content</div>}
      />
    );

    fireEvent.click(screen.getByText("Icon"));

    await waitFor(() => {
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Content"));

    await waitFor(() => {
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Icon"));

    await waitFor(() => {
      expect(screen.getByText("Dropdown hidden")).toBeInTheDocument();
    });
  });
});
