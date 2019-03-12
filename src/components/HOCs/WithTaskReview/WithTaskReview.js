import { connect } from 'react-redux'
import { completeReview,
         cancelReviewClaim,
         fetchTaskForReview,
         loadNextReviewTask } from '../../../services/Task/Task'
import { TaskReviewLoadMethod } from '../../../services/Task/TaskReview/TaskReviewLoadMethod'
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
    updateTaskReviewStatus: (task, status, comment, loadBy, url) => {
      dispatch(completeReview(task.id, status, comment)).then(() => {
        const searchParams = new URLSearchParams(url.location.search)
        const sortBy = searchParams.get('sortBy')
        const direction = searchParams.get('direction')
        const filters = searchParams.get('filters') ? JSON.parse(searchParams.get('filters')) : {}

        dispatch(loadNextReviewTask({sortCriteria: {sortBy, direction}, filters})).then((task) => {
          if (loadBy === TaskReviewLoadMethod.next) {
            url.push(`/challenge/${task.parentId}/task/${task.id}/review`)
          }
          else {
            url.push('/review')
          }
        }).catch(error => {
          console.log(error)
          url.push('/review')
        })
      }).catch(error => {
        console.log(error)
        url.push('/review')
      })
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
