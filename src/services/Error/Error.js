import PropTypes from 'prop-types'
import { isString as _isString,
         clone as _clone,
         isEmpty as _isEmpty,
         remove as _remove } from 'lodash'

export const errorShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  defaultMessage: PropTypes.string,
})

// redux actions
export const ADD_ERROR = 'ADD_ERROR'
export const REMOVE_ERROR = 'REMOVE_ERROR'
export const CLEAR_ERRORS = 'CLEAR_ERRORS'

/**
 * Build an error suitable for passing to addError. Errors should have id and
 * optional defaultMessage strings, which correspond to the id and
 * defaultMessage fields utilized by react-intl for displaying
 * internationalized messages. An optional detailMessage can be provided which,
 * if defined, will be appended on to the defaultMessage.
 */
export const buildError = function(id, defaultMessage, detailMessage) {
  if (!_isString(id) || id.length === 0) {
    throw new Error('Error id must be a valid string.')
  }

  const message = !_isEmpty(detailMessage) ?
    `${defaultMessage}: ${detailMessage}` :
    defaultMessage

  return {id, defaultMessage: message}
}

/**
 * Convenience method that delegates to buildError and attempts to extract an
 * error message from the given serverError and use it as the detailed message.
 * Note that this method returns a Promise that resolves with the built error
 * object.
 *
 * @returns a Promise that resolves with the built error.
 */
export const buildServerError = function(id, defaultMessage, serverError) {
  return new Promise(resolve => {
    if (serverError && serverError.response) {
      serverError.response.json().then(json => {
        resolve(buildError(id, defaultMessage,
                           _isString(json.message) ? json.message : undefined))
      }).catch(error => {
        resolve(buildError(id, defaultMessage))
      })
    }
    else {
      resolve(buildError(id, defaultMessage))
    }
  })
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
      copy.push(action.error)
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
