import React, { Component } from 'react'
import { connect } from 'react-redux'
import { LatLng } from 'leaflet'
import _get from 'lodash/get'
import _sample from 'lodash/sample'
import { loadRandomTaskFromChallenge,
         loadRandomTaskFromVirtualChallenge }
       from '../../../services/Task/Task'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'
import WithOptionalManagement from '../WithOptionalManagement/WithOptionalManagement'

/**
 * WithStartChallenge passes down a startChallenge function that, when invoked,
 * will load a task from the given challenge for the user to work on. If the
 * challenge is being actively browsed, then an attempt is made to begin the
 * with a task that is currently visible to the user in the challenge map;
 * otherwise a random task from the challenge is loaded.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithStartChallenge = WrappedComponent => {
  return WithOptionalManagement(
    connect(null, mapDispatchToProps)(_WithStartChallenge(WrappedComponent))
  )
}

export const _WithStartChallenge = function(WrappedComponent) {
   return class extends Component {
     render() {
       return (
         <WrappedComponent isStarting={this.props.isActive()} {...this.props} />
       )
     }
   }
 }

/**
 * Return a task within the given challenge that is visible within the
 * challenge map bounds, if possible. Only tasks in a created or skipped
 * status are considered.
 *
 * @private
 */
export const chooseVisibleTask = (challenge, challengeBounds, clusteredTasks) => {
  if (challenge.id !== _get(clusteredTasks, 'challengeId') ||
      _get(clusteredTasks, 'tasks.length', 0) === 0) {
    return null
  }

  // If no bounds available, or they don't match this challenge, just go with
  // the first task
  if (!challengeBounds || !challengeBounds.bounds ||
      challengeBounds.challengeId !== challenge.id) {
    return clusteredTasks[0]
  }

  const createdTasks = []
  const skippedTasks = []
  let task = null

  for (let i = 0; i < clusteredTasks.tasks.length; i++) {
    task = clusteredTasks.tasks[i]

    if (task.point &&
        challengeBounds.bounds.contains(new LatLng(task.point.lat, task.point.lng))) {
      if (task.status === TaskStatus.created) {
        createdTasks.push(task)
      }
      else if(task.status === TaskStatus.skipped) {
        skippedTasks.push(task)
      }
    }
  }

  // Choose created tasks over skipped tasks, when possible
  return createdTasks.length > 0 ? _sample(createdTasks) : _sample(skippedTasks)
}

/**
 * Opens the given task to begin work on.
 *
 * @private
 */
export const openTask = (dispatch, challenge, task, history) => {
  if (task) {
    history.push(`/challenge/${task.parent}/task/${task.id}`)
  }
  else {
    // No tasks left in this challenge, back to challenges.
    dispatch(addError(AppErrors.task.none))
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => ({
  /**
   * Start working on the given challenge. If it's the currently browsed
   * challenge, an attempt is made to start with a task that is visible within
   * the current challenge map bounds. Otherwise a random task is loaded.
   */
  startChallenge: challenge => {
    ownProps.setActive(true)

    if (challenge.isVirtual) {
      dispatch(loadRandomTaskFromVirtualChallenge(challenge.id)).then(task => {
        if (task) {
          ownProps.history.push(`/virtual/${challenge.id}/task/${task.id}`)
          window.scrollTo(0, 0)
        }
        else {
          dispatch(addError(AppErrors.task.none))
        }
      }).then(() => {
        ownProps.setActive(false)
      })
    }
    else {
      const visibleTask = chooseVisibleTask(challenge,
                                            _get(ownProps, 'mapBounds'),
                                            ownProps.clusteredTasks)
      if (visibleTask) {
        openTask(dispatch, challenge, visibleTask, ownProps.history)
        ownProps.setActive(false)
        window.scrollTo(0, 0)
      }
      else {
        dispatch(loadRandomTaskFromChallenge(challenge.id)).then(task => {
          openTask(dispatch, challenge, task, ownProps.history)
        }).then(() => {
          window.scrollTo(0, 0)
          ownProps.setActive(false)
        }).catch(() => {
          dispatch(addError(AppErrors.task.fetchFailure))
          ownProps.setActive(false)
        })
      }
    }
  },

  /** Invoked when user wants to start a challenge with a specific task */
  startChallengeWithTask: (challengeId, isVirtual, taskId) => {
    if (isVirtual) {
      ownProps.history.push(`/virtual/${challengeId}/task/${taskId}`)
    }
    else {
      ownProps.history.push(`/challenge/${challengeId}/task/${taskId}`)
    }
    window.scrollTo(0, 0)
  }
})

export default WithStartChallenge
