import React, { Component } from 'react'
import { connect } from 'react-redux'
import _get from 'lodash/get'
import _each from 'lodash/each'
import _filter from 'lodash/filter'
import _omit from 'lodash/omit'
import _debounce from 'lodash/debounce'
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

    normalizedBounds = props =>
      toLatLngBounds(_get(props, `mapBounds.${mapType}.bounds`))

    startMapBoundedTasks = () => {
      this.setState({creatingVirtualChallenge: true})

      this.props.startBoundedTasks(
        this.normalizedBounds(this.props)
      ).then(() => this.setState({creatingVirtualChallenge: false}))
    }

    allowedTasks = boundedTasks => {
      if (!matchChallenges || _get(boundedTasks, 'tasks.length', 0) === 0) {
        return boundedTasks
      }

      const allowedChallenges = new Set()
      _each(this.props.challenges,
            challenge => allowedChallenges.add(challenge.id))

      const filteredTasks = _filter(boundedTasks.tasks,
        task => allowedChallenges.has(task.parentId)
      )

      return Object.assign({}, boundedTasks, {tasks: filteredTasks})
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
      const bounds = this.normalizedBounds(this.props)
      const mapBoundedTasks = 
        bounds && boundsWithinAllowedMaxDegrees(bounds, maxAllowedDegrees()) ?
        this.allowedTasks(this.props.mapBoundedTasks) : null

      return (
        <WrappedComponent mapBoundedTasks={mapBoundedTasks}
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

  startBoundedTasks: bounds => {
    return dispatch(createVirtualChallenge(bounds)).then(virtualChallenge => {
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
