import "@testing-library/jest-dom";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { TaskAnalysisTableInternal as TaskAnalysisTable } from "./TaskAnalysisTable";

jest.mock(
  "../../components/KeywordAutosuggestInput/InTableTagFilter",
  () => ({})
);
jest.mock("./TaskAnalysisTableHeader", () => () => <div>Header</div>);
jest.mock("../ViewTask/ViewTask", () => () => <div>ViewTask</div>);

describe("TaskAnalysisTable", () => {
  it("doesn't break if given some basic props", () => {
    const { getByText, debug } = render(
      <IntlProvider locale="en">
        <TaskAnalysisTable
          selectedTasks={{}}
          toggleTaskSelection={() => null}
          showColumns={[
            "selected",
            "featureId",
            "id",
            "status",
            "priority",
            "comments",
          ]}
          intl={{ formatMessage: () => null }}
          getUserAppSetting={() => null}
          selectedTaskCount={() => null}
        />
      </IntlProvider>
    );
    const text = getByText("Header");
    expect(text).toBeInTheDocument();
  });
});
