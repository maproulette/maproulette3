import "@testing-library/jest-dom";
import TaskCompletionStep from "./TaskCompletionStep";

describe("TaskCompletionStep", () => {
  it("renders task completion step 1 with required props", () => {
    const { getByText } = global.withProvider(
      <TaskCompletionStep
        task={{}}
        pickEditor={() => null}
        complete={() => null}
        allowedProgressions={new Map()}
        intl={{ formatMessage: () => null }}
        keyboardShortcutGroups={{}}
        activateKeyboardShortcutGroup={() => null}
        deactivateKeyboardShortcutGroup={() => null}
      />
    );
    const text = getByText("Open Editor");
    expect(text).toBeInTheDocument();
  });


  it("shows Edit button if allowedProgressions includes 1", () => {
    const allowedProgressions = new Map();
    allowedProgressions.set(1);

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
      />
    );
    const text = getByText("Open Editor");
    expect(text).toBeInTheDocument();
  });
});
