import { describe, it, expect, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {WithWidgetWorkspacesInternal as WithWidgetWorkspaces} from "./WithWidgetWorkspaces";
import * as services from '../../../services/Widget/Widget'

const testWorkspaces = {
  "userDashboard": {
    "123": {
      "id": "123",
      "targets": ["user"],
      "cols": 12,
      "rowHeight": 30,
      "widgets": [{
        "widgetKey": "FeaturedChallengesWidget",
        "label": {
          "id": "FeaturedChallenges.header",
          "defaultMessage": "Challenge Highlights"
        },
        "targets": ["user"],
        "minWidth": 4,
        "defaultWidth": 6,
        "minHeight": 12,
        "defaultHeight": 12
      }],
      "name": "userDashboard",
      "label": "layout 1"
    },
    "456": {
      "id": "456",
      "targets": ["user"],
      "cols": 12,
      "rowHeight": 30,
      "widgets": [{
        "widgetKey": "FeaturedChallengesWidget",
        "label": {
          "id": "FeaturedChallenges.header",
          "defaultMessage": "Challenge Highlights"
        },
        "targets": ["user"],
        "minWidth": 4,
        "defaultWidth": 6,
        "minHeight": 12,
        "defaultHeight": 12,
      }],
      "name": "userDashboard",
      "label": "layout 2"
    }
  } 
}

const importedConfig = {
  "targets": ["user"],
  "cols": 12,
  "rowHeight": 30,
  "widgets": [{
    "widgetKey": "FeaturedChallengesWidget",
    "label": {
      "id": "FeaturedChallenges.header",
      "defaultMessage": "Challenge Highlights"
    },
    "targets": ["user"],
    "minWidth": 4,
    "defaultWidth": 6,
    "minHeight": 12,
    "defaultHeight": 12,
  }],
  "name": "userDashboard",
  "label": "imported layout"
}

const defaultDashboardSetup = () => {
  return {
    dataModelVersion: 2,
    name: 'userDashboard',
    label: "View Challenge",
    widgets: [],
    conditionalWidgets: [
      // conditionally displayed
      "MetaReviewStatusMetricsWidget",
    ],
    layout: [

    ],
  };
};

describe("WithWidgetWorkspaces", () => {
  it("doesn't break if only required props are provided", () => {
    const TestComponent = () => <div>Test</div>
    const TestWrapped = WithWidgetWorkspaces(TestComponent)
    const { getByText } = global.withProvider(
      <TestWrapped
        match={{path: ''}}
        history={{ location: { pathname: "", search: "" } }}
        getUserAppSetting={() => null}
      />
    );
    const component = getByText("Welcome Back!");
    expect(component).toBeInTheDocument();
  });

  it("doesn't render signin for public task page", () => {
    const TestComponent = () => <div>Test</div>
    const TestWrapped = WithWidgetWorkspaces(TestComponent)
    const { queryByText } = global.withProvider(
    <TestWrapped
      match={{ path: '/challenge/:challengeId/task/:taskId' }}
      task={{id: 1, parent: {id: 2, parent: {id: 3}}}}
      taskId={1}
      challengeId={2}
      history={{ location: { pathname: '', search: '' } }}
      getUserAppSetting={() => null}
    />
    )
    const component = queryByText('Welcome Back!')
    expect(component).not.toBeInTheDocument()
  })

  it("renders wrapped component if user is logged in", () => {
    const TestComponent = () => <div>Test</div>
    const TestWrapped = WithWidgetWorkspaces(TestComponent, null, null, () => ({ widgets: [] }))
    const { getByText } = global.withProvider(
      <TestWrapped
        history={{ location: { pathname: "", search: "" } }}
        getUserAppSetting={(state, obj) => state[obj]}
        user={{ isLoggedIn: true }}
        updateUserAppSetting={() => null}
      />
    );
    const component = getByText("Test");
    expect(component).toBeInTheDocument();
  });

  it("can switch layouts, revert back to working layout if marked broken, and add new layout", async () => {
    const TestComponent = (props) => {
      return (
        <div>
          <div>Current config: {props.currentConfiguration.label}</div>
          <button onClick={() => props.switchWorkspaceConfiguration(456, props.currentConfiguration)}>Switch Config</button>
          <button onClick={() => props.markWorkspaceConfigurationBroken()}>Mark Broken</button>
          <button onClick={() => props.addNewWorkspaceConfiguration(props.currentConfiguration)}>Add New Config</button>
          <button onClick={() => props.importWorkspaceConfiguration({}, props.currentConfiguration)}>Import Config</button>
        </div>
      )
    }
    const TestWrapped = WithWidgetWorkspaces(TestComponent, null, 'userDashboard', defaultDashboardSetup)
    global.withProvider(
      <TestWrapped
        history={{ location: { pathname: "", search: "" } }}
        getUserAppSetting={(state, obj) => state[obj]}
        user={{ isLoggedIn: true, workspaces: testWorkspaces }}
        updateUserAppSetting={() => null}
      />
    );

    fireEvent.click(screen.getByText("Switch Config"));
    expect(screen.getByText("Current config: layout 2")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Mark Broken"));
    expect(screen.getByText("Current config: layout 1")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Add New Config"));

    await waitFor(() => {
      expect(screen.getByText("Current config: View Challenge")).toBeInTheDocument();
    });

    vi.spyOn(services, "importWorkspaceConfiguration").mockReturnValue(Promise.resolve(importedConfig));
    fireEvent.click(screen.getByText("Import Config"));

    await waitFor(() => {
      expect(screen.getByText("Current config: imported layout")).toBeInTheDocument();
    });
  });
});
