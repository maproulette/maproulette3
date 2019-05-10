import { connect } from 'react-redux'
import _merge from 'lodash/merge'
import _isString from 'lodash/isString'
import _get from 'lodash/get'
import { completeReview,
         cancelReviewClaim,
         loadNextReviewTask,
         fetchTaskForReview } from '../../../services/Task/TaskReview/TaskReview'
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

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateTaskReviewStatus: (task, status, comment, loadBy, url) => {
      dispatch(completeReview(task.id, status, comment)).then(() => {
        let newState = url.location.state
        const searchCriteria = parseSearchCriteria(url, newState)

        dispatch(loadNextReviewTask(searchCriteria)).then((task) => {
          if (task && loadBy === TaskReviewLoadMethod.next) {
            url.push({
              pathname:`/challenge/${task.parentId || task.parent}/task/${task.id}/review`,
              state: newState
            })
          }
          else if (task && loadBy === TaskReviewLoadMethod.inbox) {
            url.push({
              pathname:'/inbox',
              state: newState
            })
          }
          else {
            url.push({
              pathname: '/review',
              state: newState,
            })
          }
        }).catch(error => {
          console.log(error)
          url.push({
            pathname: '/review',
            state: newState,
          })
        })
      }).catch(error => {
        console.log(error)
        url.push('/review')
      })
    },

    stopReviewing: (task, url) => {
      dispatch(cancelReviewClaim(task.id)).catch(error => {
        dispatch(addError(AppErrors.user.unauthorized))
      })

      url.push({
        pathname: '/review',
        state: parseSearchCriteria(url)
      })
    },

    startReviewing: (task) => {
      dispatch(fetchTaskForReview(task.id)).catch(error => {
        dispatch(addError(AppErrors.user.unauthorized))
      })
    },
  }
}

export const parseSearchCriteria = (url, newState) => {
  const searchParams = _merge(new URLSearchParams(url.location.search), url.location.state)
  let sortBy = searchParams.sortBy
  let direction = searchParams.direction
  let filters = searchParams.filters || {}
  const boundingBox = searchParams.boundingBox
  const savedChallengesOnly = searchParams.savedChallengesOnly

  if (_isString(filters)) {
    filters = JSON.parse(searchParams.filters)
  }

  if (searchParams.sortCriteria) {
    sortBy = _get(searchParams, 'sortCriteria.sortBy')
    direction = _get(searchParams, 'sortCriteria.direction')
  }

  newState = {sortBy, direction, filters, boundingBox, savedChallengesOnly}
  return {sortCriteria: {sortBy, direction}, filters, boundingBox, savedChallengesOnly}
}


export default WithTaskReview
