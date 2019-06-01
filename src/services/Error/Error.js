import PropTypes from 'prop-types'
import _isString from 'lodash/isString'
import _clone from 'lodash/clone'
import _remove from 'lodash/remove'
import _find from 'lodash/find'
import _cloneDeep from 'lodash/cloneDeep'

export const errorShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string,
})

// redux actions
export const ADD_ERROR = 'ADD_ERROR'
export const REMOVE_ERROR = 'REMOVE_ERROR'
export const CLEAR_ERRORS = 'CLEAR_ERRORS'

/**
 * Convenience method that attempts to extract an error message from the given
 * serverError and use it as the detailed message.
 *
 * @returns error
 */
export const addServerError = function(error, serverError) {
  return function(dispatch) {
    return new Promise(resolve => {
      if (!serverError || !serverError.response) {
        dispatch(addError(error))
        resolve(error)
      }

      const detailedError = _cloneDeep(error)

      if (serverError && serverError.response) {
        serverError.response.json().then(json => {
          if (_isString(json.message)) {
            detailedError.values = {details: `: ${json.message}`}
          }
        }).catch(
          error => {} // if message isn't valid json, just ignore
        ).then(() => {
          dispatch(addError(detailedError))
          resolve(detailedError)
        })
      }
    })
  }
}

/**
 * Add an error with an additional detailed message string. Note that the
 * default error message must support the inclusion of details
 */
export const addErrorWithDetails = function(error, detailString) {
  return function(dispatch) {
    const detailedError = _cloneDeep(error)
    detailedError.values = {details: `: ${detailString}`}
    return dispatch(addError(detailedError))
  }
}

// redux action creators
export const addError = function(error) {
  return {
    type: ADD_ERROR,
    error,
  }
}

export const removeError = function(error) {
  return {
    type: REMOVE_ERROR,
    error,
  }
}

export const clearErrors = function() {
  return {
    type: CLEAR_ERRORS,
  }
}

// redux reducer
export const currentErrors = function(state=[], action) {
  let copy = null

  switch(action.type) {
    case ADD_ERROR:
      copy = _clone(state)

      // Don't add dup errors
      if (!_find(copy, {id: action.error.id})) {
        copy.push(action.error)
      }

      return copy
    case REMOVE_ERROR:
      copy = _clone(state)
      _remove(copy, {id: action.error.id})
      return copy
    case CLEAR_ERRORS:
      return []
    default:
      return state
  }
}
