import React, { Component } from 'react'
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
import { TaskReviewStatus } from '../../../services/Task/TaskReview/TaskReviewStatus'
import { TaskReviewLoadMethod }
       from '../../../services/Task/TaskReview/TaskReviewLoadMethod'
import { addError } from '../../../services/Error/Error'
import { buildSearchURL } from '../../../services/SearchCriteria/SearchCriteria'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * WithTaskReview makes functions available for reviewing a task, such as
 * updating the task review status.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
 export const WithTaskReview = WrappedComponent => {
   return class extends Component {
     render() {
       return <WrappedComponent
        metaReviewEnabled={process.env.REACT_APP_FEATURE_META_QC === 'enabled'}
        asMetaReview={asMetaReview(this.props)} {...this.props} />
     }
   }
 }

function asMetaReview(props) {
 return props.history.location.pathname.endsWith("meta-review")
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateTaskReviewStatus: (task, status, comment, tags, loadBy, url,
      taskBundle, requestedNextTask, newTaskStatus) => {
        // Either this is a meta-review (url is /meta-review) or
        // it's the reviewer revising their review and requesting
        // a meta-review on their revision (ie. changing meta-review status
        // back to needed)
        const submitAsMetaReview =
          asMetaReview(ownProps) ||
          (status === TaskReviewStatus.needed && task.reviewedBy === ownProps.user.id)

        const doReview = taskBundle ?
          completeBundleReview(taskBundle.bundleId, status, comment, tags, newTaskStatus, submitAsMetaReview) :
          completeReview(task.id, status, comment, tags, newTaskStatus, submitAsMetaReview)

        dispatch(doReview).then(() => {
          if (loadBy === TaskReviewLoadMethod.nearby && requestedNextTask) {
            visitLoadBy(loadBy, url, requestedNextTask, asMetaReview(ownProps))
          }
          else if (loadBy === TaskReviewLoadMethod.inbox ||
                   loadBy === TaskReviewLoadMethod.ALL_LOAD_METHOD) {
            // Don't need to load next task since we are going to inbox or back
            // to review all
            visitLoadBy(loadBy, url, task, asMetaReview(ownProps))
          }
          else {
            loadNextTaskForReview(dispatch, url, task.id, asMetaReview(ownProps)).then(
              nextTask => visitLoadBy(loadBy, url, nextTask, asMetaReview(ownProps)))
          }
        }).catch(error => {
          console.log(error)
          url.push('/review/tasksToBeReviewed')
        })
    },

    skipTaskReview: (task, loadBy, url) => {
      dispatch(cancelReviewClaim(task.id))
      loadNextTaskForReview(dispatch, url, task.id, asMetaReview(ownProps)).then(
        nextTask => visitLoadBy(loadBy, url, nextTask, asMetaReview(ownProps)))
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
  const invertFields = searchParams.invertFields
  const pageSize = searchParams.pageSize

  if (_isString(filters)) {
    filters = JSON.parse(searchParams.filters)
  }

  if (searchParams.sortCriteria) {
    sortBy = _get(searchParams, 'sortCriteria.sortBy')
    direction = _get(searchParams, 'sortCriteria.direction')
  }

  return {
    searchCriteria: {sortCriteria: {sortBy, direction}, filters, boundingBox,
                                    savedChallengesOnly, excludeOtherReviewers,
                                    invertFields},
    newState: {sortBy, direction, filters, boundingBox, savedChallengesOnly,
               excludeOtherReviewers, invertFields, pageSize}
  }
}

export const visitLoadBy = (loadBy, url, task, asMetaReview) => {
  const parsedCriteria = parseSearchCriteria(url)
  const newState = parsedCriteria.newState

  if (task && (loadBy === TaskReviewLoadMethod.next ||
               loadBy === TaskReviewLoadMethod.nearby)) {
    url.push({
      pathname:`/challenge/${_get(task, 'parent.id', task.parent)}/task/${task.id}/` +
               (asMetaReview ? "meta-review" : "review"),
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
      pathname: '/review' + (asMetaReview ? "/metaReviewTasks" : ""),
      search: buildSearchURL(parsedCriteria.searchCriteria)
    })
  }
}

export const loadNextTaskForReview = (dispatch, url, lastTaskId, asMetaReview) => {
  return dispatch(loadNextReviewTask(parseSearchCriteria(url).searchCriteria, lastTaskId, asMetaReview))
}

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithTaskReview(WrappedComponent))
