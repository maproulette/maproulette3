import { schema } from 'normalizr'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'

/** normalizr schema for comments */
export const commentSchema = function() {
  return new schema.Entity('comments')
}

// redux actions
export const RECEIVE_COMMENTS = 'RECEIVE_COMMENTS'

// redux action creators

/**
 * Add or update comment data in the redux store
 */
export const receiveComments = function(normalizedEntities,
                                        status = RequestStatus.success) {
  return {
    type: RECEIVE_COMMENTS,
    status,
    entities: normalizedEntities,
    receivedAt: Date.now()
  }
}

// async action creators

/**
 * Comments are separate entities that need to be retrieved on their own, but
 * they're also always children of an entity. We limit this service to processing
 * the comment entities themselves, and let other services handle the fetching
 * and any post-processing needed to update the parent with references to its
 * child comments.
 *
 * A fetchFunction should be provided for retrieving the comments, which will
 * then be added to the redux store.
 *
 * @param {function} fetchFunction - the function used to retrieve the comments
 */
export const loadComments = function(fetchFunction) {
  return function(dispatch) {
    return fetchFunction(dispatch).then(normalizedComments => {
      dispatch(receiveComments(normalizedComments.entities))
      return normalizedComments
    })
  }
}

// redux reducers
export const commentEntities =
  genericEntityReducer(RECEIVE_COMMENTS, 'comments')
