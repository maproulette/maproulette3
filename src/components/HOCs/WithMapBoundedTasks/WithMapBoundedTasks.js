import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _filter from 'lodash/filter'
import _omit from 'lodash/omit'
import _debounce from 'lodash/debounce'
import _map from 'lodash/map'
import _noop from 'lodash/noop'
import { fetchBoundedTasks } from '../../../services/Task/BoundedTask'
import { createVirtualChallenge }
       from '../../../services/VirtualChallenge/VirtualChallenge'
import { loadRandomTaskFromVirtualChallenge }
       from '../../../services/Task/Task'
import { toLatLngBounds,
         boundsWithinAllowedMaxDegrees }
       from '../../../services/MapBounds/MapBounds'
import { addError } from '../../../services/Error/Error'
import AppErrors from '../../../services/Error/AppErrors'

/**
 * Returns the maximum allowed size, in degrees, of the bounding box for
 * task-browsing to be enabled. Uses the REACT_APP_BOUNDED_TASKS_MAX_DIMENSION
 * .env setting or a system default if that hasn't been set.
 *
 * @private
 */
const maxAllowedDegrees = function() {
  return _get(process.env, 'REACT_APP_BOUNDED_TASKS_MAX_DIMENSION',
              2.5) // degrees
}

/**
 * Debounced dispatch of fetchBoundedTasks
 *
 * @private
 */
const doUpdateBoundedTasks =
  _get(process.env, 'REACT_APP_FEATURE_BOUNDED_TASK_BROWSING') === 'enabled' ?
  _debounce((dispatch, bounds) => {
    if (boundsWithinAllowedMaxDegrees(bounds, maxAllowedDegrees())) {
      dispatch(fetchBoundedTasks(bounds, 1000))
    }
  }, 500) : _noop

/**
 * WithMapBoundedTasks retrieves map-bounded task clusters
 * (regardless of challenge) within the given mapBounds bounding box when it's
 * of an appropriately small size as determiend by the
 * REACT_APP_BOUNDED_TASKS_MAX_DIMENSION .env setting.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithMapBoundedTasks = function(WrappedComponent,
                                            mapType='locator',
                                            matchChallenges=true) {
  return class extends Component {
    state = {
      creatingVirtualChallenge: false,
    }

    /**
     * Ensure bounds are represented as LatLngBounds object.
     */
    normalizedBounds = props =>
      toLatLngBounds(_get(props, `mapBounds.${mapType}.bounds`))

    /**
     * Applies bounds and challenge filters to the map-bounded tasks, as appropriate,
     * returning only those tasks that pass the filters.
     */
    allowedTasks = () => {
      const bounds = this.normalizedBounds(this.props)
      let mapBoundedTasks = null

      if (bounds && boundsWithinAllowedMaxDegrees(bounds, maxAllowedDegrees())) {
        mapBoundedTasks = this.props.mapBoundedTasks
      }

      if (!matchChallenges || _get(mapBoundedTasks, 'tasks.length', 0) === 0) {
        return mapBoundedTasks
      }

      const allowedChallenges = new Set()
      _each(this.props.challenges,
            challenge => allowedChallenges.add(challenge.id))

      const filteredTasks = _filter(mapBoundedTasks.tasks,
        task => allowedChallenges.has(task.parentId)
      )

      return Object.assign({}, mapBoundedTasks, {tasks: filteredTasks})
    }

    /**
     * Invoked when the user wishes to start work on the mapped tasks,
     * creating a virtual challenge.
     */
    startMapBoundedTasks = name => {
      const tasks = _get(this.allowedTasks(), 'tasks')
      if (tasks && tasks.length > 0) {
        this.setState({creatingVirtualChallenge: true})

        this.props.startBoundedTasks(
          name,
          _map(tasks, 'id')
        ).catch(e => {}).then(() => this.setState({creatingVirtualChallenge: false}))
      }
    }

    componentWillMount() {
      const bounds = this.normalizedBounds(this.props)

      if (bounds) {
        this.props.updateBoundedTasks(bounds)
      }
    }

    componentWillReceiveProps(nextProps) {
      const nextBounds = this.normalizedBounds(nextProps)
      const currentBounds = this.normalizedBounds(this.props)

      if (nextBounds) {
        if (!currentBounds || !nextBounds.equals(currentBounds)) {
          this.props.updateBoundedTasks(nextBounds)
        }
      }
    }

    render() {
      return (
        <WrappedComponent mapBoundedTasks={this.allowedTasks()}
                          startMapBoundedTasks={this.startMapBoundedTasks}
                          creatingVirtualChallenge={this.state.creatingVirtualChallenge}
                          {..._omit(this.props, ['mapBoundedTasks',
                                                 'updateBoundedTasks',
                                                 'startBoundedTasks'])} />)
    }
  }
}

const mapStateToProps = state => ({
  mapBoundedTasks: state.currentBoundedTasks,
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateBoundedTasks: bounds => doUpdateBoundedTasks(dispatch, bounds),

  startBoundedTasks: (name, taskIds) => {
    return dispatch(
      createVirtualChallenge(name, taskIds)
    ).then(virtualChallenge => {
      dispatch(
        loadRandomTaskFromVirtualChallenge(virtualChallenge.id)
      ).then(task => {
        if (task) {
          ownProps.history.push(`/virtual/${virtualChallenge.id}/task/${task.id}`)
        }
        else {
          dispatch(addError(AppErrors.task.none))
        }
      })
    })
  },
})

export default WrappedComponent =>
  connect(mapStateToProps, mapDispatchToProps)(
    WithMapBoundedTasks(WrappedComponent)
  )
