import React, { Component } from 'react'
import { connect } from 'react-redux'
import _merge from 'lodash/merge'
import _isString from 'lodash/isString'
import _get from 'lodash/get'
import { completeReview,
         completeBundleReview,
         cancelReviewClaim,
         loadNextReviewTask,
         fetchTaskForReview,
         fetchNearbyReviewTasks }
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
    updateTaskReviewStatus: (task, reviewedTaskIds, status, comment, tags, loadBy, url,
      taskBundle, requestedNextTask, newTaskStatus, errorTags) => {
        // Either this is a meta-review (url is /meta-review) or
        // it's the reviewer revising their review and requesting
        // a meta-review on their revision (ie. changing meta-review status
        // back to needed)

        const submitAsMetaReview =
          asMetaReview(ownProps) ||
          (status === TaskReviewStatus.needed && task.reviewedBy === ownProps.user.id)

        const doReview = taskBundle ?
          () => completeBundleReview(taskBundle.bundleId, status, comment, tags, newTaskStatus, submitAsMetaReview, errorTags) :
          () => completeReview(task.id, status, comment, tags, newTaskStatus, submitAsMetaReview, errorTags)

        // If we are loading the next task to review we need to ask the server for the next one
        // first, since otherwise after we change the task review status the current position
        // of our current task will not be found since it won't be in the review requested
        // list anymore. After we fetch the task we can do the review and move to the newly
        // fetched next task.
        if (loadBy === TaskReviewLoadMethod.next) {
          loadNextTaskForReview(dispatch, url, task.parent?.id, task.id, reviewedTaskIds, asMetaReview(ownProps)).then(
            nextTask => {
              dispatch(doReview()).then(() =>
                visitLoadBy(loadBy, url, nextTask, asMetaReview(ownProps)))
            }
          ).catch(error => {
            console.log(error)
            dispatch(doReview()).then(() =>
              url.push('/review/tasksToBeReviewed')
            ).catch(error => {
              console.log(error)
              url.push('/review/tasksToBeReviewed')
            })
          })
        }
        else {
          dispatch(doReview()).then(() => {
            if (loadBy === TaskReviewLoadMethod.nearby) {
              if (requestedNextTask) {
                visitLoadBy(loadBy, url, requestedNextTask, asMetaReview(ownProps))
              }
              else {
                // Nearby task was not chosen by user so we need to find one
                dispatch(fetchNearbyReviewTasks(
                  task.id,
                  parseSearchCriteria(url).searchCriteria,
                  1,
                  asMetaReview(ownProps))
                ).then(nearbyTasks => {
                  const nextTask = (nearbyTasks.tasks &&
                                    nearbyTasks.tasks.length > 0) ? nearbyTasks.tasks[0] : null
                  visitLoadBy(loadBy, url,nextTask,asMetaReview(ownProps))
                })
              }
            }
            else {
              // Don't need to load next task since we are going to inbox or back
              // to review all
              visitLoadBy(loadBy, url, task, asMetaReview(ownProps))
            }
          }).catch(error => {
            console.log(error)
            url.push('/review/tasksToBeReviewed')
          })
        }
    },

    skipTaskReview: (task, reviewedTaskIds, loadBy, url) => {
      dispatch(cancelReviewClaim(task.id))
      loadNextTaskForReview(dispatch, url, task.parent?.id, task.id, reviewedTaskIds, asMetaReview(ownProps)).then(
        nextTask => visitLoadBy(loadBy, url, nextTask, asMetaReview(ownProps)))
    },

    stopReviewing: (task, url) => {
      dispatch(cancelReviewClaim(task.id)).catch(() => {
        dispatch(addError(AppErrors.user.unauthorized))
      })

      url.push({
        pathname: '/review',
        state: parseSearchCriteria(url).searchCriteria
      })
    },

    startReviewing: (task) => {
      dispatch(fetchTaskForReview(task.id)).catch(() => {
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

export const loadNextTaskForReview = (dispatch, url, lastChallengeId, lastTaskId, reviewedTaskIds, asMetaReview) => {
  return dispatch(loadNextReviewTask(parseSearchCriteria(url).searchCriteria, lastChallengeId, lastTaskId, reviewedTaskIds, asMetaReview))
}

export default WrappedComponent =>
  connect(null, mapDispatchToProps)(WithTaskReview(WrappedComponent))
