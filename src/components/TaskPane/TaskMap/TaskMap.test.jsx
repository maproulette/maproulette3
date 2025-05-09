import { render, screen } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import TaskMap from "./TaskMap";

const mockStore = configureStore([]);
const store = mockStore({});

const mockTask = {
  id: 1,
  name: "Test Task",
  parent: {
    id: 1,
    name: "Test Project",
  },
  geometries: { features: [] },
};

describe("TaskMap Component", () => {
  it("should render without crashing", () => {
    render(
      <Provider store={store}>
        <IntlProvider locale="en">
          <TaskMap task={mockTask} centerPoint={{ lat: 0, lng: 0 }} />
        </IntlProvider>
      </Provider>,
    );
    expect(screen.getByTitle("Fit to Features")).toBeInTheDocument();
  });
});
