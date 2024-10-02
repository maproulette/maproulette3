import "@testing-library/jest-dom";
import { KeyboardShortcutList } from "./KeyboardShortcutList";

describe("shortcut", () => {
  it("renders false positive shortcut name", () => {
    const props = { taskCompletion: { falsePositive: { key: 'q', label: { defaultMessage: 'No / Not an issue', id: 'KeyMapping.taskCompletion.falsePositive' } } } }
    const { getByText } = global.withProvider(
      <KeyboardShortcutList activeKeyboardShortcuts={props} />
    );
    const text = getByText('No / Not an issue');
    expect(text).toBeInTheDocument();

  });

  it("renders fixed shortcut name", () => {
    const props = { taskCompletion: { fixed: { key: 'f', label: { defaultMessage: 'Yes / I fixed it!', id: 'KeyMapping.taskCompletion.fixed' } } } }
    const { getByText } = global.withProvider(
      <KeyboardShortcutList activeKeyboardShortcuts={props} />
    );
    const text = getByText('Yes / I fixed it!');
    expect(text).toBeInTheDocument();

  });
});
