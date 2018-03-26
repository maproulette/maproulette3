import _isArray from 'lodash/isArray'
import _isFunction from 'lodash/isFunction'
import _isObject from 'lodash/isObject'
import _cloneDeep from 'lodash/cloneDeep'
import _forOwn from 'lodash/forOwn'
import _merge from 'lodash/merge'
import _values from 'lodash/values'
import RequestStatus from './RequestStatus'

/**
 *
 * genericEntityReducer returns a function suitable for reducing normalized
 * entity data retrieved from the server. It limits itself to processing of the
 * given actionTypes and entityName, even if the normalized response contains
 * multiple types of entities. If additional reduction is required for the
 * entity, pass in a reduceFurther function: it will be invoked with the
 * mergedState, originalState, and array of entity objects to be further
 * reduced.
 *
 * > Note that only matching actions with status RequestStatus.success will be
 * > reduced; others will be ignored.
 *
 * Internally, this reducer is performing a simple lodash merge of the old and
 * new entity data. While this will work fine in many cases, it may not always
 * produce the desired result. For example, old arrays will be merged with new
 * ones rather than replaced by them, producing a union of old and new values.
 * In some cases these specific flaws can be addressed with a reduceFurther
 * function (which, in our example, could overwrite the old child array with
 * the new one if replacement was desired).
 *
 * @see See [lodash merge](https://lodash.com/docs#merge)
 *
 * @param {(string|string[])} actionTypes - one or more action types to reduce
 * @param {string} entityName - the name of the target entity to reduce
 * @param {function} [reduceFurther] - optional function that will be invoked
 *        with mergedState, originalState, entities for further reduction
 *        of the entities.
 *
 * @returns {function} a function that can be used as a redux reducer.
 */
const genericEntityReducer = (actionTypes, entityName, reduceFurther) => {
  const allowedActionTypes =
    _isArray(actionTypes) ? actionTypes : [ actionTypes ]

  return (state = {}, action) => {
    if (allowedActionTypes.indexOf(action.type) === -1 ||
        action.status !== RequestStatus.success ||
        !_isObject(action.entities)) {
      return state
    }

    return entities(state, action, entityName, reduceFurther)
  }
}

/**
 * entities is a generic reducer function for entity data retrieved from the
 * server. It limits its scope to the given action and entity name. Additional
 * reduction work specific to the entity can be performed, if needed, by
 * providing a reduceFurther function that will be invoked with the
 * mergedState, originalState, and array of entity objects to be further
 * reduced.
 *
 * @private
 */
const entities = function(state = {}, action, entityName, reduceFurther) {
  const newState = _cloneDeep(state)
  const timestamp = Date.now()

  _forOwn(action.entities[entityName], (entity, entityId) => {
    if (typeof entityId === 'undefined') {
      return
    }

    // Add a _meta object to each entity where we can store some application
    // meta data about the entity. Right now we just store a timestamp of
    // when the data was fetched so that we can measure the freshness of the
    // data.
    entity._meta = {fetchedAt: timestamp}

    newState[entityId] = _merge(newState[entityId], entity)
  })

  if (_isFunction(reduceFurther)) {
    reduceFurther(newState, state, _values(action.entities[entityName]))
  }

  return newState
}

export default genericEntityReducer
