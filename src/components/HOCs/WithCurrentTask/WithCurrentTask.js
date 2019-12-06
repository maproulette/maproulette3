import React, { Component } from 'react'
import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _isFinite from 'lodash/isFinite'
import _isString from 'lodash/isString'
import _isPlainObject from 'lodash/isPlainObject'
import { taskDenormalizationSchema,
         fetchTask,
         fetchTaskComments,
         fetchTaskPlace,
         loadRandomTaskFromChallenge,
         loadRandomTaskFromVirtualChallenge,
         startTask,
         refreshTaskLock,
         addTaskComment,
         addTaskBundleComment,
         completeTask,
         completeTaskBundle,
         updateTaskTags } from '../../../services/Task/Task'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { fetchTaskForReview } from '../../../services/Task/TaskReview/TaskReview'
import { fetchChallenge, fetchParentProject }
       from '../../../services/Challenge/Challenge'
import { fetchUser } from '../../../services/User/User'
import { TaskLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import { fetchOSMUser, fetchOSMData } from '../../../services/OSM/OSM'
import { fetchChallengeActions } from '../../../services/Challenge/Challenge'
import { renewVirtualChallenge }
       from '../../../services/VirtualChallenge/VirtualChallenge'
import { CHALLENGE_STATUS_FINISHED }
       from '../../../services/Challenge/ChallengeStatus/ChallengeStatus'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'
import AsSuggestedFix from '../../../interactions/Task/AsSuggestedFix'

const TASK_STALE = 30000 // 30 seconds
const CHALLENGE_STALE = 300000 // 5 minutes
const PROJECT_STALE = 300000 // 5 minutes

/**
 * WithCurrentTask passes down the denormalized task specified in either the
 * current route or, if that's not available, the `taskId` prop. The
 * immediately available value in the redux store will be given first, but
 * a current copy of the task will also be fetched and passed down when
 * available.  A `completeTask` function is also made available to the wrapped
 * component, which can be used to mark the current task as complete with a
 * given status.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithCurrentTask = (WrappedComponent, forReview=false) =>
  connect(mapStateToProps, mapDispatchToProps)(WithLoadedTask(WrappedComponent, forReview))

/**
 * WithLoadedTask is a private HOC used to fetch an up-to-date copy of the task
 * and parent challenge from the server.
 *
 * @private
 */
const WithLoadedTask = function(WrappedComponent, forReview) {
  return class extends Component {
    loadNeededTask = props => {
      if (_isFinite(props.taskId)) {
        props.loadTask(props.taskId, props.task, forReview)
      }
    }

    componentDidMount() {
      this.loadNeededTask(this.props)
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.taskId !== this.props.taskId) {
        // Only fetch if task data is missing or stale
        if (!nextProps.task || isStale(nextProps.task, TASK_STALE)) {
          this.loadNeededTask(nextProps)
        }
      }
    }

    render() {
      // We don't need to pass anything down. WithCurrentTask grabs the latest
      // from the redux store, which is where our updated copy will end up.
      return <WrappedComponent {..._omit(this.props, 'loadTask')} />
    }
  }
}

export const mapStateToProps = (state, ownProps) => {
  const mappedProps = {task: null}

  const taskId = taskIdFromRoute(ownProps, ownProps.taskId)
  if (_isFinite(taskId)) {
    mappedProps.taskId = taskId
    const taskEntity = _get(state, `entities.tasks.${taskId}`)

    if (taskEntity) {
      // denormalize task so that parent challenge is embedded.
      mappedProps.task =
        denormalize(taskEntity, taskDenormalizationSchema(), state.entities)

      mappedProps.challengeId = _get(mappedProps.task, 'parent.id')
    }
  }

  return mappedProps
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    /**
     * For the LoadCurrentTask private HOC.
     *
     * @private
     */
    loadTask: (taskId, existingTask=null, forReview=false) => {
      dispatch(
        forReview ? fetchTaskForReview(taskId) : fetchTask(taskId)
      ).then(normalizedResults => {
        if (!_isFinite(normalizedResults.result) ||
            _get(normalizedResults,
                 `entities.tasks.${normalizedResults.result}.deleted`)) {
          dispatch(addError(AppErrors.task.doesNotExist))
          ownProps.history.push('/browse/challenges')
          return
        }

        const loadedTask = normalizedResults.entities.tasks[normalizedResults.result]
        // Load the parent challenge if missing or stale
        if (!_isPlainObject(_get(existingTask, 'parent')) ||
            isStale(existingTask.parent, CHALLENGE_STALE)) {
          dispatch(
            fetchChallenge(loadedTask.parent)
          ).then(normalizedChallengeResults => {
            // Load the parent project if missing or stale
            if (!_isPlainObject(_get(existingTask, 'parent.parent')) ||
                isStale(existingTask.parent.parent, PROJECT_STALE)) {
              fetchParentProject(dispatch, normalizedChallengeResults)
            }
          })
        }

        // Fetch the task comments and location data, but don't wait for them
        dispatch(fetchTaskComments(taskId))
        dispatch(fetchTaskPlace(loadedTask))
        dispatch(fetchChallenge(loadedTask.parent))
        dispatch(fetchChallengeActions(loadedTask.parent))

        return normalizedResults
      }).catch(error => {
        if (forReview) {
          dispatch(addError(AppErrors.reviewTask.alreadyClaimed))
        }
        else {
          dispatch(addError(AppErrors.task.fetchFailure))
        }
      })
    },

    /**
     * Invoke to mark a task as complete with the given status
     */
    completeTask: (task, challengeId, taskStatus, comment, tags, taskLoadBy, userId, needsReview,
                   requestedNextTask, osmComment, tagEdits, completionResponses, taskBundle) => {
      const taskId = task.id

      // Work to be done after the status is set
      const doAfter = () => {
        if (taskLoadBy) {
          // Start loading the next task from the challenge.
          const loadNextTask =
            _isFinite(requestedNextTask) ?
            nextRequestedTask(dispatch, ownProps, requestedNextTask) :
            nextRandomTask(dispatch, ownProps, taskId, taskLoadBy)

          loadNextTask.then(newTask =>
            visitNewTask(dispatch, ownProps, taskId, newTask)
          ).catch(error => {
            ownProps.history.push(`/browse/challenges/${challengeId}`)
          })
        }

        if (_isString(comment) && comment.length > 0) {
          if (taskBundle) {
            dispatch(addTaskBundleComment(taskBundle.bundleId, taskId, comment, taskStatus))
          }
          else {
            dispatch(addTaskComment(taskId, comment, taskStatus))
          }
        }

        // Update the user in the background to get their latest score
        setTimeout(() => dispatch(fetchUser(userId)), 100)

        // Updating the challenge actions will allow us to show more accurate
        // completion progress, but this can be done in the background
        setTimeout(() => dispatch(fetchChallengeActions(challengeId)), 500)

        // If working on a virtual challenge, renew it (extend its expiration)
        // since we've seen some activity, but this can be done in the
        // background
        if (_isFinite(ownProps.virtualChallengeId)) {
          setTimeout(() => dispatch(renewVirtualChallenge(ownProps.virtualChallengeId)), 1000)
        }
      }

      if (taskStatus === TaskStatus.skipped && task.status !== TaskStatus.created) {
        // Skipping task that already has a status
        return doAfter()
      }
      else {
        let suggestedFixSummary = null
        if (task.suggestedFix) {
          suggestedFixSummary = AsSuggestedFix(task).tagChangeSummary(tagEdits)
        }

        return dispatch(
          taskBundle ?
          completeTaskBundle(taskBundle.bundleId, taskId, taskStatus, needsReview, tags, suggestedFixSummary, osmComment, completionResponses) :
          completeTask(taskId, taskStatus, needsReview, tags, suggestedFixSummary, osmComment, completionResponses)
        ).then(() => doAfter())
      }
    },

    /**
     * Move to the next task without setting any completion status, useful for
     * when a user visits a task that is already complete.
     */
    nextTask: (challengeId, taskId, taskLoadBy, comment) => {
      if (_isString(comment) && comment.length > 0) {
        dispatch(addTaskComment(taskId, comment))
      }

      nextRandomTask(dispatch, ownProps, taskId, taskLoadBy).then(newTask =>
        visitNewTask(dispatch, ownProps, taskId, newTask)
      )
    },

    /**
     * Post a comment on the task without performing any other action
     */
    postTaskComment: (task, comment) => {
      return dispatch(addTaskComment(task.id, comment))
    },

    /**
     * Update tags on task.
     */
    saveTaskTags: (task, tags) => {
      return dispatch(updateTaskTags(task.id, tags))
    },

    fetchOSMUser,
    fetchOSMData: bbox => {
      return fetchOSMData(bbox).catch(error => {
        dispatch(addError(error))
      })
    },

    /**
     * Refresh the lock on the task, extending its allowed duration
     */
    refreshTaskLock: task => {
      if (!task) {
        return Promise.reject("Invalid task")
      }

      return dispatch(refreshTaskLock(task.id)).catch(err => {
        dispatch(addError(AppErrors.task.lockRefreshFailure))
      })
    },
  }
}

/**
 * Retrieve the task id from the route, falling back to the given defaultId if
 * none is available.
 */
export const taskIdFromRoute = (props, defaultId) => {
  const taskId = parseInt(_get(props, 'match.params.taskId'), 10)
  return _isFinite(taskId) ? taskId : defaultId
}

/**
 * Retrieve the challenge id from the route, falling back to the given
 * defaultId if none is available.
 */
export const challengeIdFromRoute = (props, defaultId) => {
  const challengeId =
    parseInt(_get(props, 'match.params.challengeId'), 10)

  return _isFinite(challengeId) ? challengeId : defaultId
}

/**
 * Returns true if the at least staleTime milliseconds has elapsed since
 * the given entity was last fetched from the server, false otherwise
 */
export const isStale = (entity, staleTime) => {
  return Date.now() - _get(entity, '_meta.fetchedAt', 0) > staleTime
}

/**
 * Load a new random task, handling the differences between standard challenges
 * and virtual challenges.
 */
export const nextRandomTask = (dispatch, props, currentTaskId, taskLoadBy) => {
  // We need to make different requests depending on whether we're working on a
  // virtual challenge or a standard challenge.
  if (_isFinite(props.virtualChallengeId)) {
    return dispatch(
      loadRandomTaskFromVirtualChallenge(
        props.virtualChallengeId,
        taskLoadBy === TaskLoadMethod.proximity ? currentTaskId : undefined
      )
    )
  }
  else {
    return dispatch(
      loadRandomTaskFromChallenge(
        challengeIdFromRoute(props, props.challengeId),
        taskLoadBy === TaskLoadMethod.proximity ? currentTaskId : undefined
      )
    )
  }
}

/**
 * Load and lock a requested next task
 */
export const nextRequestedTask = function(dispatch, props, requestedTaskId) {
  return dispatch(fetchTask(requestedTaskId))
    .then(() => dispatch(startTask(requestedTaskId)))
    .then(normalizedResults =>
      _get(normalizedResults, `entities.tasks.${normalizedResults.result}`)
    )
}

/**
 * Route to the given new task. If there's no new task, we assume the challenge
 * is complete and congratulate the user.
 */
export const visitNewTask = function(dispatch, props, currentTaskId, newTask) {
  if (_isPlainObject(newTask) && newTask.id !== currentTaskId) {
    // The route we use is different for virtual challenges vs standard
    // challenges.
    if (_isFinite(props.virtualChallengeId)) {
      props.history.push(`/virtual/${props.virtualChallengeId}/task/${newTask.id}`)
    }
    else {
      const challengeId = challengeIdFromRoute(props, props.challengeId)
      props.history.push(`/challenge/${challengeId}/task/${newTask.id}`)
    }
  }
  else {
    // If challenge is complete, redirect home with note to congratulate user
    if (_isFinite(props.virtualChallengeId)) {
      // We don't get a status for virtual challenges, so just assume we're done
      props.history.push('/browse/challenges', {congratulate: true, warn: false})
    }
    else {
      const challengeId = challengeIdFromRoute(props, props.challengeId)
      dispatch(fetchChallenge(challengeId)).then( normalizedResults => {
        const challenge = normalizedResults.entities.challenges[normalizedResults.result]
        if (challenge.status === CHALLENGE_STATUS_FINISHED) {
          props.history.push('/browse/challenges', {congratulate: true, warn: false})
        }
        else {
          props.history.push('/browse/challenges', {warn: true, congratulate: false})
        }
      })
    }
  }
}

export default WithCurrentTask
