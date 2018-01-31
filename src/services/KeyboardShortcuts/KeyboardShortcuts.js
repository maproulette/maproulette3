import _cloneDeep from 'lodash/cloneDeep'
import _merge from 'lodash/merge'
import _isEmpty from 'lodash/isEmpty'

// redux actions
export const ADD_KEYBOARD_SHORTCUT_GROUP = 'ADD_KEYBOARD_SHORTCUT_GROUP'
export const REMOVE_KEYBOARD_SHORTCUT_GROUP = 'REMOVE_KEYBOARD_SHORTCUT_GROUP'
export const ADD_KEYBOARD_SHORTCUT = 'ADD_KEYBOARD_SHORTCUT'
export const REMOVE_KEYBOARD_SHORTCUT = 'REMOVE_KEYBOARD_SHORTCUT'
export const CLEAR_KEYBOARD_SHORTCUTS = 'CLEAR_KEYBOARD_SHORTCUTS'

// redux action creators
export const addKeyboardShortcutGroup = function(shortcutGroup) {
  return {
    type: ADD_KEYBOARD_SHORTCUT_GROUP,
    shortcutGroup,
  }
}

export const removeKeyboardShortcutGroup = function(groupName) {
  return {
    type: REMOVE_KEYBOARD_SHORTCUT_GROUP,
    groupName,
  }
}

export const addKeyboardShortcut = function(groupName, shortcut) {
  return {
    type: ADD_KEYBOARD_SHORTCUT,
    groupName,
    shortcut,
  }
}

export const removeKeyboardShortcut = function(groupName, shortcutName) {
  return {
    type: REMOVE_KEYBOARD_SHORTCUT,
    groupName,
    shortcutName,
  }
}

export const clearKeyboardShortcuts = function() {
  return {
    type: CLEAR_KEYBOARD_SHORTCUTS,
  }
}

// redux reducers.
export const currentKeyboardShortcuts = function(state={}, action) {
  if (action.type === ADD_KEYBOARD_SHORTCUT_GROUP) {
    const mergedState = Object.assign({groups: {}}, state)
    _merge(mergedState.groups, action.shortcutGroup)

    return mergedState
  }
  else if (action.type === REMOVE_KEYBOARD_SHORTCUT_GROUP) {
    const mergedState = Object.assign({groups: {}}, state)
    delete mergedState.groups[action.groupName]

    return mergedState
  }
  else if (action.type === ADD_KEYBOARD_SHORTCUT) {
    const mergedState = Object.assign({groups: {}}, state)
    if (!mergedState.groups[action.groupName]) {
      mergedState.groups[action.groupName] = {}
    }

    _merge(mergedState.groups[action.groupName], action.shortcut)

    return mergedState
  }
  else if (action.type === REMOVE_KEYBOARD_SHORTCUT) {
    if (_isEmpty(state.groups)) { // No shortcuts exist
      return state
    }

    let mergedState = _cloneDeep(state)
    if (mergedState.groups[action.groupName]) {
      delete mergedState.groups[action.groupName][action.shortcutName]
    }

    // Clean up group if left empty
    if (_isEmpty(mergedState.groups[action.groupName])) {
      delete mergedState.groups[action.groupName]
    }

    return mergedState
  }
  else if (action.type === CLEAR_KEYBOARD_SHORTCUTS) {
    return {groups: {}}
  }
  else {
    return state
  }
}
