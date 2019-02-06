import { connect } from 'react-redux'
import { completeReview,
         cancelReviewClaim,
         fetchTaskForReview } from '../../../services/Task/Task'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * WithTaskReview makes functions available for reviewing a task, such as
 * updating the task review status.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
const WithTaskReview = WrappedComponent =>
  connect(null, mapDispatchToProps)(WrappedComponent)

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateTaskReviewStatus: (task, status, comment) => {
      dispatch(completeReview(task.id, status, comment))
    },

    stopReviewing: (task) => {
      dispatch(cancelReviewClaim(task.id)).catch(error => {
        dispatch(addError(AppErrors.user.unauthorized))
      })
    },

    startReviewing: (task) => {
      dispatch(fetchTaskForReview(task.id)).catch(error => {
        dispatch(addError(AppErrors.user.unauthorized))
      })
    },
  }
}


export default WithTaskReview
