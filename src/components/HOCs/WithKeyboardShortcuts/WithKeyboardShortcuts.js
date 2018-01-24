import { connect } from 'react-redux'
import { get as _get } from 'lodash'
import { setKeyboardShortcuts,
         clearKeyboardShortcuts } from '../../../services/KeyboardShortcuts/KeyboardShortcuts'
import KeyMappings from '../../../KeyMappings'

const mapStateToProps = state => {
  return {
    keyboardShortcutGroups: KeyMappings,
    activeKeyboardShortcuts: _get(state, 'currentKeyboardShortcuts.group'),
  }
}

const mapDispatchToProps = dispatch => {
  return {
    activateKeyboardShortcuts: (shortcutGroup, handler) => {
      document.addEventListener("keydown", handler, false)
      dispatch(setKeyboardShortcuts(shortcutGroup))
    },
    deactivateKeyboardShortcuts: (shortcutGroup, handler) => {
      document.removeEventListener("keydown", handler)
      dispatch(clearKeyboardShortcuts())
    },
  }
}

const WithKeyboardShortcuts =
  WrappedComponent => connect(mapStateToProps, mapDispatchToProps)(WrappedComponent)

export default WithKeyboardShortcuts
