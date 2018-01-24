// redux actions
export const SET_KEYBOARD_SHORTCUTS = 'SET_KEYBOARD_SHORTCUTS'

// redux action creators
export const setKeyboardShortcuts = function(shortcutGroup) {
  return {
    type: SET_KEYBOARD_SHORTCUTS,
    shortcutGroup,
  }
}

export const clearKeyboardShortcuts = function() {
  return {
    type: SET_KEYBOARD_SHORTCUTS,
    shortcutGroup: null,
  }
}

// redux reducers.
export const currentKeyboardShortcuts = function(state={}, action) {
  if (action.type === SET_KEYBOARD_SHORTCUTS) {
    return Object.assign({}, state, {group: action.shortcutGroup})
  }

  return state
}
