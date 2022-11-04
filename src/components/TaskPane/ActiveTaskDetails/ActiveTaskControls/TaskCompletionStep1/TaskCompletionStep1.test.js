import "@testing-library/jest-dom";
import * as React from "react";
import TaskCompletionStep1, { ListMoreOptionsItems } from "./TaskCompletionStep1";

describe("TaskCompletionStep1", () => {
  it("renders task completion step 1 with required props", () => {
    const { getByText } = global.withProvider(
      <TaskCompletionStep1
        task={{}}
        pickEditor={() => null}
        complete={() => null}
        allowedProgressions={new Map()}
        intl={{ formatMessage: () => null }}
      />
    );
    const text = getByText("Current Editor:");
    expect(text).toBeInTheDocument();
  });

  it("shows Edit button if allowedProgressions includes 1", () => {
    const allowedProgressions = new Map();
    allowedProgressions.set(1);

    const { getByText } = global.withProvider(
      <TaskCompletionStep1
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
    const text = getByText("Edit");
    expect(text).toBeInTheDocument();
  });

  it("shows an option to say I fixed it!", () => {
    const allowedProgressions = new Map();
    allowedProgressions.set(1, 2, 3, 4, 5);

    const { getByText } = global.withProvider(
      <ListMoreOptionsItems
        task={{}}
        pickEditor={() => null}
        complete={() => null}
        allowedProgressions={allowedProgressions}
        intl={{ formatMessage: () => null }}
        keyboardShortcutGroups={{ taskCompletion: { fixed: { key: 123 } } }}
        activateKeyboardShortcutGroup={() => null}
        deactivateKeyboardShortcutGroup={() => null}
        quickKeyHandler={() => null}
        activateKeyboardShortcut={() => null}
        deactivateKeyboardShortcut={() => null}
        needsRevised
      />
    );
    const text = getByText("I fixed it!");
    expect(text).toBeInTheDocument();
  });
});
