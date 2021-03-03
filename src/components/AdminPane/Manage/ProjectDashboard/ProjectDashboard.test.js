import React from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { render, fireEvent, screen } from "@testing-library/react";
import {
  ProjectDashboardInternal as ProjectDashboard,
  defaultDashboardSetup,
} from "./ProjectDashboard.js";
import { currentErrors } from "../../../../services/Error/Error";

describe("defaultDashboardSetup", () => {
  it("returns an object of dashboard settings with a name", () => {
    const setup = defaultDashboardSetup();
    expect(setup.name).toBe("project");
  });
});

describe("ProjectDashboard", () => {
  it("doesn't break if only required props are provided", () => {
    const { getByText, debug } = global.withProvider(
      <ProjectDashboard
        name="project"
        targets="foo"
        defaultConfiguration={() => null}
      />
    );
    const component = getByText("Project Not Found");
    expect(component).toBeInTheDocument();
  });

  it("renders a loader if loadingProject is true", () => {
    const { getByTestId, debug } = global.withProvider(
      <ProjectDashboard
        name="project"
        targets="foo"
        defaultConfiguration={() => null}
        loadingProject
      />
    );
    const component = getByTestId("loading-indicator");
    expect(component).toBeInTheDocument();
  });

  it("shows project dashboard if project is provided and loadingProject is false", () => {
    const { getByTestId, debug } = global.withProvider(
      <ProjectDashboard
        project={{ foo: "bar" }}
        name="project"
        targets="foo"
        defaultConfiguration={() => null}
      />
    );
    const component = getByTestId("project-dashboard");
    expect(component).toBeInTheDocument();
  });
});
