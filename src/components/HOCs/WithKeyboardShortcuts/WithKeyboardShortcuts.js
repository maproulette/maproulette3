import { connect } from 'react-redux'
import { get as _get } from 'lodash'
import { addKeyboardShortcutGroup,
         removeKeyboardShortcutGroup,
         addKeyboardShortcut,
         removeKeyboardShortcut }
       from '../../../services/KeyboardShortcuts/KeyboardShortcuts'
import KeyMappings from '../../../KeyMappings'

const mapStateToProps = state => {
  return {
    keyboardShortcutGroups: KeyMappings,
    activeKeyboardShortcuts: _get(state, 'currentKeyboardShortcuts.groups', {}),
  }
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
  }
}

const WithKeyboardShortcuts =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithKeyboardShortcuts
