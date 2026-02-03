import { describe, expect, it } from "vitest";
import TaskCompletionStep from "./TaskCompletionStep";

describe("TaskCompletionStep", () => {
  it("renders task completion step with required props", () => {
    const { container } = global.withProvider(
      <TaskCompletionStep
        task={{}}
        pickEditor={() => null}
        complete={() => null}
        allowedProgressions={new Map()}
        intl={{ formatMessage: () => null }}
        keyboardShortcutGroups={{}}
        activateKeyboardShortcutGroup={() => null}
        deactivateKeyboardShortcutGroup={() => null}
      />,
    );
    expect(container.querySelector(".breadcrumb")).toBeInTheDocument();
  });

  it("shows fixed button if allowedProgressions includes fixed status", () => {
    const allowedProgressions = new Map();
    allowedProgressions.set(1, true);

    const { getByText } = global.withProvider(
      <TaskCompletionStep
        task={{}}
        pickEditor={() => null}
        complete={() => null}
        allowedProgressions={allowedProgressions}
        intl={{ formatMessage: () => null }}
        keyboardShortcutGroups={{}}
        activateKeyboardShortcutGroup={() => null}
        deactivateKeyboardShortcutGroup={() => null}
      />,
    );
    const text = getByText("I fixed it!");
    expect(text).toBeInTheDocument();
  });
});
