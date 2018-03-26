import React, { Component } from 'react'
import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _isFinite from 'lodash/isFinite'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'
import _debounce from 'lodash/debounce'
import { taskDenormalizationSchema,
         loadCompleteTask,
         loadRandomTaskFromChallenge,
         loadRandomTaskFromVirtualChallenge,
         addTaskComment,
         completeTask } from '../../../services/Task/Task'
import { TaskLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import { contactOSMUserURL } from '../../../services/OSMUser/OSMUser'
import { fetchChallengeActions } from '../../../services/Challenge/Challenge'
import { renewVirtualChallenge }
       from '../../../services/VirtualChallenge/VirtualChallenge'

const FRESHNESS_THRESHOLD = 5000 // 5 seconds

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
        props.loadTask(props.taskId)
      }
    }

    componentDidMount() {
      this.loadNeededTask(this.props)
    }

    componentWillReceiveProps(nextProps) {
      if (nextProps.taskId !== this.props.taskId) {
        this.loadNeededTask(nextProps)
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
    loadTask: _debounce(taskId => dispatch(loadCompleteTask(taskId)),
                        FRESHNESS_THRESHOLD),

    /**
     * Invoke to mark as a task as complete with the given status
     */
    completeTask: (taskId, challengeId, taskStatus, comment, taskLoadBy) => {
      dispatch(
        completeTask(taskId, challengeId, taskStatus)
      ).then(() => {
        if (_isString(comment) && comment.length > 0) {
          dispatch(addTaskComment(taskId, comment, taskStatus))
        }
        dispatch(fetchChallengeActions(challengeId))

        // If working on a virtual challenge, renew it (extend its expiration)
        // since we've seen some activity.
        if (_isFinite(ownProps.virtualChallengeId)) {
          dispatch(renewVirtualChallenge(ownProps.virtualChallengeId))
        }
      })

      // Load the next task from the challenge.
      nextRandomTask(dispatch, ownProps, taskId, taskLoadBy).then(newTask =>
        visitNewTask(ownProps, taskId, newTask)
      )
    },

    /**
     * Move to the next task without setting any completion status,
     * useful for when a user visits a task that is already complete.
     */
    nextTask: (challengeId, taskId, taskLoadBy, comment) => {
      if (_isString(comment) && comment.length > 0) {
        dispatch(addTaskComment(taskId, comment))
      }

      nextRandomTask(dispatch, ownProps, taskId, taskLoadBy).then(newTask =>
        visitNewTask(ownProps, taskId, newTask)
      )
    },

    contactTaskOwnerURL: ownerOSMId => contactOSMUserURL(ownerOSMId),
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
 * Route to the given new task, if valid. Otherwise route back to the home
 * page.
 */
export const visitNewTask = function(props, currentTaskId, newTask) {
  if (_isObject(newTask) && newTask.id !== currentTaskId) {
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
    // Probably no tasks left in this challenge, back to challenges.
    props.history.push('/')
  }
}

export default WithCurrentTask
