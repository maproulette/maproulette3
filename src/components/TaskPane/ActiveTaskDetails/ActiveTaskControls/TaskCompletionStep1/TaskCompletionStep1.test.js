import "@testing-library/jest-dom";
import * as React from "react";
import { fireEvent, waitFor } from "@testing-library/react";
import { TaskStatus } from '../../../../../services/Task/TaskStatus/TaskStatus'
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
    allowedProgressions.set(1);

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
        activateKeyboardShortcut={() => null}
        deactivateKeyboardShortcut={() => null}
        needsRevised
      />
    );
    const text = getByText("I fixed it!");
    expect(text).toBeInTheDocument();
  });

  it("calls props.toggleDropdownVisible if list element is clicked - fixed it", async () => {
    const toggleDropdownVisible = jest.fn()
    const allowedProgressions = new Map();
    allowedProgressions.set(1);

    const { getByText, container } = global.withProvider(
      <ListMoreOptionsItems
        task={{}}
        pickEditor={() => null}
        complete={() => null}
        allowedProgressions={allowedProgressions}
        intl={{ formatMessage: () => null }}
        keyboardShortcutGroups={{ taskCompletion: { fixed: { key: 123 } } }}
        activateKeyboardShortcutGroup={() => null}
        deactivateKeyboardShortcutGroup={() => null}
        activateKeyboardShortcut={() => null}
        deactivateKeyboardShortcut={() => null}
        needsRevised
        toggleDropdownVisible={toggleDropdownVisible}
      />
    );

    const element = container.querySelector('li');

    fireEvent.click(element);

    await waitFor(() => {
      expect(toggleDropdownVisible).toHaveBeenCalledTimes(1);
    });
  });

  it("calls props.toggleDropdownVisible if list element is clicked - already fixed", async () => {
    const toggleDropdownVisible = jest.fn()
    const allowedProgressions = new Map();
    allowedProgressions.set(2);

    console.log("huh", allowedProgressions)

    const { getByText, container } = global.withProvider(
      <ListMoreOptionsItems
        task={{}}
        pickEditor={() => null}
        complete={() => null}
        allowedProgressions={allowedProgressions}
        intl={{ formatMessage: () => null }}
        keyboardShortcutGroups={{ taskCompletion: { falsePositive: { key: 123 } } }}
        activateKeyboardShortcutGroup={() => null}
        deactivateKeyboardShortcutGroup={() => null}
        activateKeyboardShortcut={() => null}
        deactivateKeyboardShortcut={() => null}
        needsRevised
        toggleDropdownVisible={toggleDropdownVisible}
      />
    );

    const element = container.querySelector('li');

    fireEvent.click(element);

    await waitFor(() => {
      expect(toggleDropdownVisible).toHaveBeenCalledTimes(1);
    });
  });

  it("calls props.toggleDropdownVisible if list element is clicked - can't complete", async () => {
    const toggleDropdownVisible = jest.fn()
    const allowedProgressions = new Map();
    allowedProgressions.set(6);

    console.log("huh", allowedProgressions)

    const { getByText, container } = global.withProvider(
      <ListMoreOptionsItems
        task={{}}
        pickEditor={() => null}
        complete={() => null}
        allowedProgressions={allowedProgressions}
        intl={{ formatMessage: () => null }}
        keyboardShortcutGroups={{ taskCompletion: { tooHard: { key: 123 } } }}
        activateKeyboardShortcutGroup={() => null}
        deactivateKeyboardShortcutGroup={() => null}
        activateKeyboardShortcut={() => null}
        deactivateKeyboardShortcut={() => null}
        needsRevised
        toggleDropdownVisible={toggleDropdownVisible}
      />
    );

    const element = container.querySelector('li');

    fireEvent.click(element);

    await waitFor(() => {
      expect(toggleDropdownVisible).toHaveBeenCalledTimes(1);
    });
  });

  it("calls props.toggleDropdownVisible if list element is clicked - already fixed", async () => {
    const toggleDropdownVisible = jest.fn()
    const allowedProgressions = new Map();
    allowedProgressions.set(5);

    console.log("huh", allowedProgressions)

    const { getByText, container } = global.withProvider(
      <ListMoreOptionsItems
        task={{}}
        pickEditor={() => null}
        complete={() => null}
        allowedProgressions={allowedProgressions}
        intl={{ formatMessage: () => null }}
        keyboardShortcutGroups={{ taskCompletion: { alreadyFixed: { key: 123 } } }}
        activateKeyboardShortcutGroup={() => null}
        deactivateKeyboardShortcutGroup={() => null}
        activateKeyboardShortcut={() => null}
        deactivateKeyboardShortcut={() => null}
        needsRevised
        toggleDropdownVisible={toggleDropdownVisible}
      />
    );

    const element = container.querySelector('li');

    fireEvent.click(element);

    await waitFor(() => {
      expect(toggleDropdownVisible).toHaveBeenCalledTimes(1);
    });
  });
});
