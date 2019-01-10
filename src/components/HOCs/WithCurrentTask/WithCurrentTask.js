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
         addTaskComment,
         completeTask } from '../../../services/Task/Task'
import { fetchChallenge, fetchParentProject }
       from '../../../services/Challenge/Challenge'
import { TaskLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import { fetchOSMUser } from '../../../services/OSMUser/OSMUser'
import { fetchChallengeActions } from '../../../services/Challenge/Challenge'
import { renewVirtualChallenge }
       from '../../../services/VirtualChallenge/VirtualChallenge'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

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
const WithCurrentTask = WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(WithLoadedTask(WrappedComponent))

/**
 * WithLoadedTask is a private HOC used to fetch an up-to-date copy of the task
 * and parent challenge from the server.
 *
 * @private
 */
const WithLoadedTask = function(WrappedComponent) {
  return class extends Component {
    loadNeededTask = props => {
      if (_isFinite(props.taskId)) {
        props.loadTask(props.taskId, props.task)
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
    loadTask: (taskId, existingTask=null) => {
      dispatch(
        fetchTask(taskId)
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

        return normalizedResults
      })
    },

    /**
     * Refresh just the task data (no comments, location, etc.), potentially
     * including mapillary image if desired
     */
    refreshTask: async (taskId, includeMapillary=false) => {
      const normalizedResults = await dispatch(fetchTask(taskId, false, includeMapillary))

      if (!_isFinite(normalizedResults.result) ||
          _get(normalizedResults, `entities.tasks.${normalizedResults.result}.deleted`)) {
        dispatch(addError(AppErrors.task.doesNotExist))
        ownProps.history.push('/browse/challenges')
      }

      return normalizedResults
    },

    /**
     * Invoke to mark as a task as complete with the given status
     */
    completeTask: (taskId, challengeId, taskStatus, comment, taskLoadBy) => {
      return dispatch(
        completeTask(taskId, challengeId, taskStatus)
      ).then(() => {
        // Start loading the next task from the challenge.
        nextRandomTask(dispatch, ownProps, taskId, taskLoadBy).then(newTask =>
          visitNewTask(ownProps, taskId, newTask)
        ).catch(error => {
          ownProps.history.push(`/browse/challenges/${challengeId}`)
        })

        if (_isString(comment) && comment.length > 0) {
          dispatch(addTaskComment(taskId, comment, taskStatus))
        }

        // Updating the challenge actions will allow us to show more accurate
        // completion progress, but this can be done in the background
        setTimeout(() => dispatch(fetchChallengeActions(challengeId)), 500)

        // If working on a virtual challenge, renew it (extend its expiration)
        // since we've seen some activity, but this can be done in the
        // background
        if (_isFinite(ownProps.virtualChallengeId)) {
          setTimeout(() => dispatch(renewVirtualChallenge(ownProps.virtualChallengeId)), 1000)
        }
      })
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
        visitNewTask(ownProps, taskId, newTask)
      )
    },

    fetchOSMUser,
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
 * Route to the given new task. If there's no new task, we assume the challenge
 * is complete and congratulate the user.
 */
export const visitNewTask = function(props, currentTaskId, newTask) {
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
    // Assume challenge is complete. Redirect home with note to congratulate
    // user.
    props.history.push('/browse/challenges', {congratulate: true})
  }
}

export default WithCurrentTask
