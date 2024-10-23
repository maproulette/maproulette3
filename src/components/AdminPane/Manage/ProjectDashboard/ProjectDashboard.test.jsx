import { describe, it, expect } from "vitest";
import {
  ProjectDashboardInternal as ProjectDashboard,
  defaultDashboardSetup,
} from "./ProjectDashboard";

describe("defaultDashboardSetup", () => {
  it("returns an object of dashboard settings with a name", () => {
    const setup = defaultDashboardSetup();
    expect(setup.name).toBe("project");
  });
});

describe("ProjectDashboard", () => {
  it("doesn't break if only required props are provided", () => {
    const { getByText } = global.withProvider(
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
    const { getByTestId } = global.withProvider(
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
    const { getByTestId } = global.withProvider(
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
