import React, { Component } from 'react'
import { connect } from 'react-redux'
import { LatLng } from 'leaflet'
import _get from 'lodash/get'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _filter from 'lodash/filter'
import _each from 'lodash/each'
import _sample from 'lodash/sample'
import _omit from 'lodash/omit'
import _isEqual from 'lodash/isEqual'
import { loadRandomTaskFromChallenge,
         fetchClusteredTasks } from '../../../services/Task/Task'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import { BasemapLayerSources }
       from '../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import { changeVisibleLayer } from '../../../services/VisibleLayer/VisibleLayer'
import { buildError, addError } from '../../../services/Error/Error'
import WithMapBounds from '../WithMapBounds/WithMapBounds'

/**
 * WithBrowsedChallenge provides functions for starting and stopping browsing of
 * a challenge, and passes down the challenge being actively browsed (if any).
 * Once browsing begins, the clustered tasks for the challenge are fetched and
 * passed down once loaded.
 *
 * A startChallenge function is also provided, and can be used to begin work
 * on the given challenge. Typically this will be the same as the actively
 * browsed challenge, but it doesn't need to be. If it is the same, and if
 * valid bounds of the challenge map are available, then an attempt is made to
 * begin with a task that is currently visible to the user on the map; otherwise
 * a random task from the challenge is simply loaded.
 *
 * > Note: unlike most data retrievals, clustered tasks are not stored in the
 * > redux store due to their potentially very large size. Instead they're
 * > simply represented here in local state.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithBrowsedChallenge = function(WrappedComponent) {
  return class extends Component {
    state = {
      browsedChallenge: null,
      tasks: [],
      loadingClusteredTasks: false,
    }
    
    shouldComponentUpdate(nextProps, nextState) {
      // Only re-render if our state changes.
      return !_isEqual(nextState, this.state)
    }

    /**
     * Invoked to indicate that the user has begun browsing the given challenge
     * during challenge discovery.
     */
    startBrowsingChallenge = challenge => {
      if (_isObject(challenge)) {
        this.setState({browsedChallenge: challenge,
                       tasks: [], loadingClusteredTasks: true})

        this.props.fetchClusteredTasks(challenge.id).then(
          tasks => this.setState({tasks, loadingClusteredTasks: false})
        ).catch(error =>
          this.setState({loadingClusteredTasks: false})
        )
      }
    }

    /**
     * Invoked to indicate that the user has stopped browsing (minimized) the given
     * challenge during challenge discovery.
     */
    stopBrowsingChallenge = () => {
      this.setState({browsedChallenge: null,
                     tasks: [], loadingClusteredTasks: false})
    }

    /**
     * Start working on the given challenge. It doesn't necessarily have to be the
     * current browsed challenge, but if it is then we'll try to start with a
     * task that is visible within the current challenge map bounds.
     */
    startChallenge = challenge => {
      const visibleTask = this.chooseVisibleTask(challenge)
      if (visibleTask) {
        this.workOnTask(challenge, visibleTask)
      }
      else {
        this.props.loadRandomTaskFromChallenge(challenge.id).then(task => {
          this.workOnTask(challenge, task)
        })
      }
    }

    /**
     * Choose a task within the given challenge that is visible within the
     * challenge map bounds, if possible (and if the given challenge is the
     * one we're actively browsing).
     *
     * @private
     */
    chooseVisibleTask = challenge => {
      const challengeBounds = _get(this.props, 'mapBounds.challenge')

      if (challenge.id !== _get(this.state, 'browsedChallenge.id') ||
          challenge.id !== _get(challengeBounds, 'challengeId') ||
          _get(this.state, 'tasks.length', 0) === 0) {
        return null
      }

      const createdTasks = []
      const skippedTasks = []

      _each(this.state.tasks, task => {
        if (task.point &&
            challengeBounds.bounds.contains(new LatLng(task.point.lat, task.point.lng))) {
          if (task.status === TaskStatus.created) {
            createdTasks.push(task)
          }
          else if(task.status === TaskStatus.skipped) {
            skippedTasks.push(task)
          }
        }
      })

      // Choose created tasks over skipped tasks, when possible
      return createdTasks.length > 0 ? _sample(createdTasks) : _sample(skippedTasks)
    }

    /**
     * Opens the given task to begin work on.
     *
     * @private
     */
    workOnTask = (challenge, task) => {
      if (task) {
        this.props.history.push(`/challenge/${task.parent}/task/${task.id}`)

        // If the challenge defines a default basemap layer, use it.
        const defaultLayer = BasemapLayerSources[challenge.defaultBasemap]
        if (defaultLayer) {
          this.props.changeVisibleLayer(defaultLayer)
        }
      }
      else {
        // No tasks left in this challenge, back to challenges.
        this.props.addError(buildError(
          "Task.none", "No tasks remain in this challenge."
        ))
      }
    }

    render() {
      const challengeId = _get(this.state, 'browsedChallenge.id')
      let clusteredTasks = []

      if (_isNumber(challengeId)) {
        clusteredTasks = _filter(this.state.tasks,
                                 task => task.parent === challengeId && task.point)
      }

      return (
        <WrappedComponent clusteredTasks={clusteredTasks}
                          startBrowsingChallenge={this.startBrowsingChallenge}
                          stopBrowsingChallenge={this.stopBrowsingChallenge}
                          startChallenge={this.startChallenge}
                          browsedChallenge = {this.state.browsedChallenge}
                          loadingClusteredTasks={this.state.loadingClusteredTasks}
                          {..._omit(this.props, [
                            'entities',
                            'fetchClusteredTasks',
                            'loadRandomTaskFromChallenge',
                            'changeVisibleLayer',
                            'addError',
                          ])} />
      )
    }
  }
}

const mapStateToProps = state => ({
  entities: state.entities,
})

const mapDispatchToProps = dispatch => ({
  fetchClusteredTasks: challengeId =>
    dispatch(fetchClusteredTasks(challengeId)),

  loadRandomTaskFromChallenge: challengeId =>
    dispatch(loadRandomTaskFromChallenge(challengeId)),

  changeVisibleLayer: layer =>
    dispatch(changeVisibleLayer(layer)),

  addError: error => dispatch(addError),
})

export default WrappedComponent =>
  connect(mapStateToProps,
          mapDispatchToProps)(WithMapBounds(WithBrowsedChallenge(WrappedComponent)))

