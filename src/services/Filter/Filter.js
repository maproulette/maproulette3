import _cloneDeep from 'lodash/cloneDeep'
import _set from 'lodash/set'
import _get from 'lodash/get'
import _omit from 'lodash/omit'

// redux actions
export const SET_FILTERS = 'SET_FILTERS'
export const REMOVE_FILTERS = 'REMOVE_FILTERS'
export const CLEAR_FILTERS = 'CLEAR_FILTERS'

// redux action creators
export const setFilters = function(filterSetName, filterCriteria) {
  return {
    type: SET_FILTERS,
    filterSetName,
    filterCriteria,
  }
}

export const removeFilters = function(filterSetName, criteriaNames) {
  return {
    type: REMOVE_FILTERS,
    filterSetName,
    criteriaNames,
  }
}

export const clearFilters = function(filterSetName) {
  return {
    type: CLEAR_FILTERS,
    filterSetName,
  }
}

// redux reducers
export const currentFilters = function(state={}, action) {
  let merged = null

  switch(action.type) {
    case SET_FILTERS:
      merged = _cloneDeep(state)
      _set(merged, action.filterSetName,
            Object.assign({}, _get(state, action.filterSetName), action.filterCriteria))
      return merged

    case REMOVE_FILTERS:
      merged = _cloneDeep(state)
      _set(merged, action.filterSetName,
            Object.assign({}, _omit(_get(state, action.filterSetName), action.criteriaNames)))
      return merged

    case CLEAR_FILTERS:
      return Object.assign({}, _omit(state, action.filterSetName))

    default:
      return state
  }
}
