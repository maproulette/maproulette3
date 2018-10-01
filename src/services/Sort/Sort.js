import _cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import messages from './Messages'

// Sort options
export const SORT_NAME = 'name'
export const SORT_CREATED = 'created'
export const SORT_DEFAULT = 'default'
export const ALL_SORT_OPTIONS = [SORT_NAME, SORT_CREATED, SORT_DEFAULT]

/** Returns object containing localized labels  */
export const sortLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)


// redux actions
export const SET_SORT = 'SET_SORT'
export const REMOVE_SORT = 'REMOVE_SORT'
export const CLEAR_SORT = 'CLEAR_SORT'

// redux action creators
export const setSort = function(sortSetName, sortCriteria) {
  return {
    type: SET_SORT,
    sortSetName,
    sortCriteria,
  }
}

export const removeSort = function(sortSetName, criteriaNames) {
  return {
    type: REMOVE_SORT,
    sortSetName,
    criteriaNames,
  }
}

export const clearSort = function(sortSetName) {
  return {
    type: CLEAR_SORT,
    sortSetName,
  }
}

// redux reducers
export const currentSort = function(state={}, action) {
  let merged = null

  switch(action.type) {
    case SET_SORT:
      merged = _cloneDeep(state)
      _set(merged, action.sortSetName,
            Object.assign({}, _get(state, action.sortSetName), action.sortCriteria))
      return merged

    case REMOVE_SORT:
      merged = _cloneDeep(state)
      _set(merged, action.sortSetName,
            Object.assign({}, _omit(_get(state, action.sortSetName), action.criteriaNames)))
      return merged

    case CLEAR_SORT:
      return Object.assign({}, _omit(state, action.sortSetName))

    default:
      return state
  }
}
