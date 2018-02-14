import React, { Component } from 'react'
import { LatLng } from 'leaflet'
import _get from 'lodash/get'
import _filter from 'lodash/filter'
import _isArray from 'lodash/isArray'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'

export default function WithBoundedTasks(WrappedComponent,
                                         tasksProp='clusteredTasks',
                                         outputProp) {
  return class extends Component {
    render() {
      let boundedTasks = this.props[tasksProp]
      let withinBounds = _get(this.props, 'filterOptions.withinBounds',
                              this.props.withinBounds)

      if (withinBounds && _isArray(_get(boundedTasks, 'tasks'))) {
        boundedTasks = Object.assign({}, boundedTasks, {
          tasks: _filter(boundedTasks.tasks, task =>
            task.point &&
            withinBounds.contains(new LatLng(task.point.lat, task.point.lng))
          )
        })
      }

      if (_isEmpty(outputProp)) {
        outputProp = tasksProp
      }

      return <WrappedComponent {...{[outputProp]: boundedTasks}}
                               {..._omit(this.props, outputProp)} />
    }
  }
}
