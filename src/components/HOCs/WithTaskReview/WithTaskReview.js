import { connect } from 'react-redux'
import _merge from 'lodash/merge'
import _isString from 'lodash/isString'
import _get from 'lodash/get'
import { completeReview,
         completeBundleReview,
         cancelReviewClaim,
         loadNextReviewTask,
         fetchTaskForReview }
        from '../../../services/Task/TaskReview/TaskReview'
import { TaskReviewLoadMethod }
       from '../../../services/Task/TaskReview/TaskReviewLoadMethod'
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
    updateTaskReviewStatus: (task, status, comment, tags, loadBy, url, taskBundle) => {
      const doReview = taskBundle ?
        completeBundleReview(taskBundle.bundleId, status, comment, tags) :
        completeReview(task.id, status, comment, tags)

      loadNextTaskForReview(dispatch, url, task.id).then(nextTask =>
        dispatch(doReview).then(() => visitTaskForReview(loadBy, url, nextTask))
      ).catch(error => {
        console.log(error)
        url.push('/review')
      })
    },

    skipTaskReview: (task, loadBy, url) => {
      dispatch(cancelReviewClaim(task.id))
      loadNextTaskForReview(dispatch, url, task.id).then(nextTask => visitTaskForReview(loadBy, url, nextTask))
    },

    stopReviewing: (task, url) => {
      dispatch(cancelReviewClaim(task.id)).catch(error => {
        dispatch(addError(AppErrors.user.unauthorized))
      })

      url.push({
        pathname: '/review',
        state: parseSearchCriteria(url).searchCriteria
      })
    },

    startReviewing: (task) => {
      dispatch(fetchTaskForReview(task.id)).catch(error => {
        dispatch(addError(AppErrors.user.unauthorized))
      })
    },
  }
}

export const parseSearchCriteria = url => {
  const searchParams = _merge(new URLSearchParams(url.location.search), url.location.state)
  let sortBy = searchParams.sortBy
  let direction = searchParams.direction
  let filters = searchParams.filters || {}
  const boundingBox = searchParams.boundingBox
  const savedChallengesOnly = searchParams.savedChallengesOnly
  const excludeOtherReviewers = searchParams.excludeOtherReviewers

  if (_isString(filters)) {
    filters = JSON.parse(searchParams.filters)
  }

  if (searchParams.sortCriteria) {
    sortBy = _get(searchParams, 'sortCriteria.sortBy')
    direction = _get(searchParams, 'sortCriteria.direction')
  }

  return {
    searchCriteria: {sortCriteria: {sortBy, direction}, filters, boundingBox,
                                    savedChallengesOnly, excludeOtherReviewers},
    newState: {sortBy, direction, filters, boundingBox, savedChallengesOnly,
               excludeOtherReviewers}
  }
}

export const visitTaskForReview = (loadBy, url, task) => {
  const newState = parseSearchCriteria(url).newState
  if (task && loadBy === TaskReviewLoadMethod.next) {
    url.push({
      pathname:`/challenge/${_get(task, 'parent.id', task.parent)}/task/${task.id}/review`,
      state: newState
    })
  }
  else if (task && loadBy === TaskReviewLoadMethod.inbox) {
    url.push({
      pathname: '/inbox',
      state: newState
    })
  }
  else {
    url.push({
      pathname: '/review',
      state: newState,
    })
  }
}

export const loadNextTaskForReview = (dispatch, url, lastTaskId) => {
  return dispatch(loadNextReviewTask(parseSearchCriteria(url).searchCriteria, lastTaskId))
}

export default WithTaskReview
