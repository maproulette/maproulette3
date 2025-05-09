import { connect } from "react-redux";
import KeyMappings from "../../../services/KeyboardShortcuts/KeyMappings";
import {
  addKeyboardShortcut,
  addKeyboardShortcutGroup,
  pauseKeyboardShortcuts,
  removeKeyboardShortcut,
  removeKeyboardShortcutGroup,
  resumeKeyboardShortcuts,
} from "../../../services/KeyboardShortcuts/KeyboardShortcuts";

const mapStateToProps = (state) => {
  return {
    keyboardShortcutGroups: KeyMappings,
    activeKeyboardShortcuts: state.currentKeyboardShortcuts?.groups ?? {},
  };
};
const textInputActive = function (event) {
  if (event.target.type === "text" || event.target.type === "search") {
    return true;
  }

  return (
    (event.target.nodeName != null &&
      event.target.getAttribute("type") != null &&
      event.target.nodeName.toLowerCase() === "input" &&
      (event.target.getAttribute("type").toLowerCase() === "text" ||
        event.target.getAttribute("type").toLowerCase() === "search")) ||
    event.target.nodeName.toLowerCase() === "textarea"
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    activateKeyboardShortcutGroup: (shortcutGroup, handler) => {
      document.addEventListener("keydown", handler, false);
      dispatch(addKeyboardShortcutGroup(shortcutGroup));
    },
    deactivateKeyboardShortcutGroup: (groupName, handler) => {
      document.removeEventListener("keydown", handler);
      dispatch(removeKeyboardShortcutGroup(groupName));
    },
    activateKeyboardShortcut: (groupName, shortcut, handler) => {
      document.addEventListener("keydown", handler, false);
      dispatch(addKeyboardShortcut(groupName, shortcut));
    },
    deactivateKeyboardShortcut: (groupName, shortcutName, handler) => {
      document.removeEventListener("keydown", handler);
      dispatch(removeKeyboardShortcut(groupName, shortcutName));
    },
    addExternalKeyboardShortcut: (groupName, shortcut) => {
      dispatch(addKeyboardShortcut(groupName, shortcut));
    },
    removeExternalKeyboardShortcut: (groupName, shortcutName) => {
      dispatch(removeKeyboardShortcut(groupName, shortcutName));
    },
    pauseKeyboardShortcuts: () => {
      dispatch(pauseKeyboardShortcuts());
    },
    resumeKeyboardShortcuts: () => {
      dispatch(resumeKeyboardShortcuts());
    },
    textInputActive: textInputActive,
  };
};

const WithKeyboardShortcuts = (WrappedComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(WrappedComponent);

export default WithKeyboardShortcuts;
