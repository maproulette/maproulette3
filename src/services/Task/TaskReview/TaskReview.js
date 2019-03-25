import { RECEIVE_REVIEW_NEEDED_TASKS,
         currentReviewNeededTasks } from './TaskReviewNeeded'
import { RECEIVE_REVIEWED_TASKS,
         RECEIVE_REVIEWED_BY_USER_TASKS,
         currentReviewedTasks,
         currentReviewedByUserTasks } from './TaskReviewed'

// redux reducers
export const currentReviewTasks = function(state={}, action) {
  switch(action.type) {
    case RECEIVE_REVIEWED_TASKS:
      return currentReviewedTasks(state, action)
    case RECEIVE_REVIEWED_BY_USER_TASKS:
      return currentReviewedByUserTasks(state, action)
    case RECEIVE_REVIEW_NEEDED_TASKS:
      return currentReviewNeededTasks(state, action)
    default:
      return state
  }
}
