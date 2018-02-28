import { connect } from 'react-redux'
import { LatLng } from 'leaflet'
import _get from 'lodash/get'
import _sample from 'lodash/sample'
import { loadRandomTaskFromChallenge} from '../../../services/Task/Task'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { BasemapLayerSources }
       from '../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import { changeVisibleLayer } from '../../../services/VisibleLayer/VisibleLayer'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * WithStartChallenge passes down a startChallenge function that, when invoked,
 * will load a task from the given challenge for the user to work on. If the
 * challenge is being actively browsed, then an attempt is made to begin the
 * with a task that is currently visible to the user in the challenge map;
 * otherwise a random task from the challenge is loaded.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithStartChallenge = WrappedComponent =>
  connect(null, mapDispatchToProps)(WrappedComponent)

/**
 * Return a task within the given challenge that is visible within the
 * challenge map bounds, if possible. Only tasks in a created or skipped
 * status are considered.
 *
 * @private
 */
export const chooseVisibleTask = (challenge, challengeBounds, clusteredTasks) => {
  if (challenge.id !== clusteredTasks.challengeId ||
      _get(clusteredTasks, 'tasks.length', 0) === 0) {
    return null
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

    // If the challenge defines a default basemap layer, use it.
    const defaultLayer = BasemapLayerSources[challenge.defaultBasemap]
    if (defaultLayer) {
      dispatch(changeVisibleLayer(defaultLayer))
    }
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
    const visibleTask = chooseVisibleTask(challenge,
                                          _get(ownProps, 'mapBounds.challenge'),
                                          ownProps.clusteredTasks)
    if (visibleTask) {
      openTask(dispatch, challenge, visibleTask, ownProps.history)
    }
    else {
      dispatch(loadRandomTaskFromChallenge(challenge.id)).then(task => {
        openTask(dispatch, challenge, task, ownProps.history)
      })
    }
  }
})

export default WithStartChallenge
