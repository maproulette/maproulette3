import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { IntlProvider } from "react-intl";
import { render } from "@testing-library/react";
import { TaskAnalysisTableInternal as TaskAnalysisTable } from "./TaskAnalysisTable";

vi.mock(
  "../../components/KeywordAutosuggestInput/InTableTagFilter",
  () => ({ default: {} })
);
vi.mock("./TaskAnalysisTableHeader", () => ({ default: () => <div>Header</div> }));
vi.mock("../ViewTask/ViewTask", () => ({ default: () => <div>ViewTask</div> }));

describe("TaskAnalysisTable", () => {
  it("doesn't break if given some basic props", () => {
    const { getByText } = render(
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
