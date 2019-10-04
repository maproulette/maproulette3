import { connect } from 'react-redux'
import _get from 'lodash/get'
import { addKeyboardShortcutGroup,
         removeKeyboardShortcutGroup,
         addKeyboardShortcut,
         removeKeyboardShortcut }
       from '../../../services/KeyboardShortcuts/KeyboardShortcuts'
import KeyMappings from '../../../services/KeyboardShortcuts/KeyMappings'

const mapStateToProps = state => {
  return {
    keyboardShortcutGroups: KeyMappings,
    activeKeyboardShortcuts: _get(state, 'currentKeyboardShortcuts.groups', {}),
  }
}
const textInputActive = function(event) {
  if (event.target.type === 'text')
    return true

  return (event.target.nodeName != null &&
          event.target.getAttribute('type') != null &&
          event.target.nodeName.toLowerCase() === 'input' &&
          event.target.getAttribute('type').toLowerCase() === 'text') ||
          event.target.nodeName.toLowerCase() === 'textarea'
}

const mapDispatchToProps = dispatch => {
  return {
    activateKeyboardShortcutGroup: (shortcutGroup, handler) => {
      document.addEventListener("keydown", handler, false)
      dispatch(addKeyboardShortcutGroup(shortcutGroup))
    },
    deactivateKeyboardShortcutGroup: (groupName, handler) => {
      document.removeEventListener("keydown", handler)
      dispatch(removeKeyboardShortcutGroup(groupName))
    },
    activateKeyboardShortcut: (groupName, shortcut, handler) => {
      document.addEventListener("keydown", handler, false)
      dispatch(addKeyboardShortcut(groupName, shortcut))
    },
    deactivateKeyboardShortcut: (groupName, shortcutName, handler) => {
      document.removeEventListener("keydown", handler)
      dispatch(removeKeyboardShortcut(groupName, shortcutName))
    },
    addExternalKeyboardShortcut: (groupName, shortcut) => {
      dispatch(addKeyboardShortcut(groupName, shortcut))
    },
    removeExternalKeyboardShortcut: (groupName, shortcutName) => {
      dispatch(removeKeyboardShortcut(groupName, shortcutName))
    },
    textInputActive: textInputActive,
    quickKeyHandler: (key, handler, allowModifierKeys=false) => (event => {
      if (textInputActive(event)) {
        return // ignore typing in inputs
      }

      if (!allowModifierKeys && (event.metaKey || event.altKey || event.ctrlKey)) {
        return
      }

      if (event.key === key) {
        handler()
        event.preventDefault()
      }
    }),
  }
}

const WithKeyboardShortcuts =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithKeyboardShortcuts
