import _cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import _get from 'lodash/get'
import _omit from 'lodash/omit'

// redux actions
export const SET_PREFERENCES = 'SET_PREFERENCES'
export const REMOVE_PREFERENCES = 'REMOVE_PREFERENCES'
export const CLEAR_PREFERENCES = 'CLEAR_PREFERENCES'

// redux action creators
export const setPreferences = function(preferenceGroupName, preferenceSetting) {
  return {
    type: SET_PREFERENCES,
    preferenceGroupName,
    preferenceSetting,
  }
}

export const removePreferences = function(preferenceGroupName, settingNames) {
  return {
    type: REMOVE_PREFERENCES,
    preferenceGroupName,
    settingNames,
  }
}

export const clearPreferenceGroup = function(preferenceGroupName) {
  return {
    type: CLEAR_PREFERENCES,
    preferenceGroupName,
  }
}

// redux reducers
export const currentPreferences = function(state={}, action) {
  let merged = null

  switch(action.type) {
    case SET_PREFERENCES:
      merged = _cloneDeep(state)
      _set(merged, action.preferenceGroupName,
           Object.assign({}, _get(state, action.preferenceGroupName), action.preferenceSetting))
      return merged

    case REMOVE_PREFERENCES:
      merged = _cloneDeep(state)
      _set(merged, action.preferenceGroupName,
           Object.assign({}, _omit(_get(state, action.preferenceGroupName), action.settingNames)))
      return merged

    case CLEAR_PREFERENCES:
      return Object.assign({}, _omit(state, action.preferenceGroupName))

    default:
      return state
  }
}

