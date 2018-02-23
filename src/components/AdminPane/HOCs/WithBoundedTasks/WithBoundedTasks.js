import React, { Component } from 'react'
import { LatLng } from 'leaflet'
import _get from 'lodash/get'
import _filter from 'lodash/filter'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
import WithMapBounds from '../../../HOCs/WithMapBounds/WithMapBounds'

export const WithBoundedTasks = function(WrappedComponent,
                                         tasksProp='clusteredTasks',
                                         outputProp) {
  return class extends Component {
    render() {
      let boundedTasks = this.props[tasksProp]
      let mapBounds = null
      let mapZoom = null

      // Only use challenge-owner map bounds and zoom if they match this
      // this challenge.
      const challengeOwnerBounds = _get(this.props.mapBounds, 'challengeOwner')
      if (challengeOwnerBounds &&
          challengeOwnerBounds.challengeId === this.props.challenge.id) {
        mapBounds = challengeOwnerBounds.bounds
        mapZoom = challengeOwnerBounds.zoom
      }

      if (mapBounds && _isArray(_get(boundedTasks, 'tasks'))) {
        boundedTasks = Object.assign({}, boundedTasks, {
          tasks: _filter(boundedTasks.tasks, task =>
            task.point &&
            mapBounds.contains(new LatLng(task.point.lat, task.point.lng))
          )
        })
      }

      if (_isEmpty(outputProp)) {
        outputProp = tasksProp
      }

      return <WrappedComponent {...{[outputProp]: boundedTasks}}
                               mapBounds={mapBounds}
                               mapZoom={mapZoom}
                               {..._omit(this.props, [outputProp, 'mapBounds'])} />
    }
  }
}

export default (WrappedComponent, tasksProp='clusteredTasks', outputProp) =>
  WithMapBounds(WithBoundedTasks(WrappedComponent, tasksProp, outputProp))
