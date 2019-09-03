import React, { Component } from 'react'
import { LatLng } from 'leaflet'
import { toLatLngBounds } from '../../../services/MapBounds/MapBounds'
import _get from 'lodash/get'
import _filter from 'lodash/filter'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'

export const WithBoundedTasks = function(WrappedComponent,
                                         tasksProp='clusteredTasks',
                                         outputProp) {
  return class extends Component {
    state = {
      localMapBounds: null,
    }

    currentChallengeId = () => _get(this.props, 'challenge.id', this.props.challengeId)

    componentDidUpdate() {
      if (this.state.localMapBounds &&
          this.state.localMapBounds.challengeId !== this.currentChallengeId()) {
        this.setState({localMapBounds: null})
      }
    }

    updateLocalMapBounds = (challengeId, bounds, zoom) => {
      this.setState({
        localMapBounds: {
          challengeId, bounds: toLatLngBounds(bounds), zoom,
        }
      })
    }

    render() {
      let boundedTasks = this.props[tasksProp]
      let mapBounds = null
      let mapZoom = null

      if (this.state.localMapBounds) {
        mapBounds = this.state.localMapBounds
        mapZoom = this.state.localMapBounds.zoom
      }
      else if (this.props.mapBounds &&
               this.props.mapBounds.challengeId === this.currentChallengeId()) {
        mapBounds = this.props.mapBounds
        mapZoom = this.props.mapBounds.zoom
      }

      if (mapBounds && _isArray(_get(boundedTasks, 'tasks'))) {
        boundedTasks = Object.assign({}, boundedTasks, {
          tasks: _filter(boundedTasks.tasks, task =>
            task.point &&
            mapBounds.bounds.contains(new LatLng(task.point.lat, task.point.lng))
          )
        })
      }

      if (_isEmpty(outputProp)) {
        outputProp = tasksProp
      }

      return <WrappedComponent {...{[outputProp]: boundedTasks}}
                               mapBounds={mapBounds}
                               mapZoom={mapZoom}
                               updateLocalMapBounds={this.updateLocalMapBounds}
                               {..._omit(this.props, [outputProp, 'mapBounds'])} />
    }
  }
}

export default (WrappedComponent, tasksProp='clusteredTasks', outputProp) =>
  WithBoundedTasks(WrappedComponent, tasksProp, outputProp)
