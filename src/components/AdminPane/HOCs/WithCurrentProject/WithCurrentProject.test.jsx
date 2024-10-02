import "@testing-library/jest-dom";
import { waitFor } from "@testing-library/react";
import { WithCurrentProject } from "./WithCurrentProject";

const fetchProject = () => Promise.resolve({
  entities: {
    projects: []
  }
});

describe("WithCurrentProject", () => {
  it("renders a test component successfully", () => {
    const TestComponent = () => <div>test component</div>
    const TestPage = WithCurrentProject(TestComponent)
    const { getByText } = global.withProvider(
      <TestPage />
    );
    const text = getByText("test component");
    expect(text).toBeInTheDocument();
  });

  it("calls redirectUser if user is not a project manager", async () => {
    const redirectUser = jest.fn()
    const TestComponent = (props) => {
      return <div>projectId: {props.routedProjectId}</div>
    }
    const TestPage = WithCurrentProject(TestComponent)
    const { getByText } = global.withProvider(
      <TestPage match={{ params: { projectId: 1 } }} fetchProject={fetchProject} history={{ push: redirectUser }} notManagerError={() => null} />
    );

    await waitFor(() => {
      expect(getByText("projectId: 1")).toBeInTheDocument();
      expect(redirectUser).toHaveBeenCalledTimes(1);
    });
  });

  it("does not redirect user if allowNonManagers is true", async () => {
    const redirectUser = jest.fn()
    const TestComponent = (props) => {
      return <div>projectId: {props.routedProjectId}</div>
    }
    const TestPage = WithCurrentProject(TestComponent, { allowNonManagers: true })
    const { getByText } = global.withProvider(
      <TestPage match={{ params: { projectId: 1 } }} fetchProject={fetchProject} history={{ push: redirectUser }} notManagerError={() => null} />
    );

    await waitFor(() => {
      expect(getByText("projectId: 1")).toBeInTheDocument();
      expect(redirectUser).toHaveBeenCalledTimes(0);
    });
  });
});
