import * as React from "react";
import WithPublicWidgetWorkspaces from "./WithPublicWidgetWorkspaces";

describe("Public Widget Grid", () => {
  it("Able to render wrapped component without breaking", () => {
    const TestComponent = () => <div>Test</div>
    const TestWrapped = WithPublicWidgetWorkspaces(TestComponent, null, null, () => ({ widgets: [] }))
    const { getByText } = global.withProvider(
      <TestWrapped/>
    );
    const component = getByText("Test");
    expect(component).toBeInTheDocument();
  });
});
