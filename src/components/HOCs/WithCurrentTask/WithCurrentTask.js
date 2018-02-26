import React, { Component } from 'react'
import { connect } from 'react-redux'
import { denormalize } from 'normalizr'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _isObject from 'lodash/isObject'
import { taskDenormalizationSchema,
         loadCompleteTask,
         loadRandomTaskFromChallenge,
         addTaskComment,
         completeTask } from '../../../services/Task/Task'
import { TaskLoadMethod }
       from '../../../services/Task/TaskLoadMethod/TaskLoadMethod'
import { fetchChallengeActions } from '../../../services/Challenge/Challenge'

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
 * from the server.
 *
 * @private
 */
const WithLoadedTask = function(WrappedComponent) {
  return class extends Component {
    loadNeededTask = props => {
      if (!isNaN(props.taskId)) {
        // Load task if we don't already have it or if the data is stale
        const fetchedAt = _get(props, 'task._meta.fetchedAt')

        if (!_isNumber(fetchedAt) || Date.now() - fetchedAt > FRESHNESS_THRESHOLD) {
          props.loadTask(props.taskId)
        }
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

  // Pull taskId from route
  const taskId =
    parseInt(_get(ownProps, 'match.params.taskId', ownProps.taskId), 10)

  if (!isNaN(taskId)) {
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
    loadTask: taskId => dispatch(loadCompleteTask(taskId)),

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
      })

      // Load the next task from the challenge.
      dispatch(
        loadRandomTaskFromChallenge(
          challengeId,
          taskLoadBy === TaskLoadMethod.proximity ? taskId : undefined
        )
      ).then(newTask =>
        visitNewTask(challengeId, taskId, newTask, ownProps.history)
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

      dispatch(
        loadRandomTaskFromChallenge(
          challengeId,
          taskLoadBy === TaskLoadMethod.proximity ? taskId : undefined
        )
      ).then(newTask =>
        visitNewTask(challengeId, taskId, newTask, ownProps.history)
      )
    },
  }
}

/**
 * Route to the given new task, if valid. Otherwise route back to the home
 * page.
 */
export const visitNewTask = function(challengeId, currentTaskId, newTask, history) {
  if (_isObject(newTask) && newTask.id !== currentTaskId) {
    history.push(`/challenge/${challengeId}/task/${newTask.id}`)
  }
  else {
    // Probably no tasks left in this challenge, back to challenges.
    history.push('/')
  }
}

export default WithCurrentTask
