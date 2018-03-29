import React, { Component } from 'react'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _each from 'lodash/each'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'

/**
 * WithTaskMarkers generates map markers for the given tasks and passes them
 * down to the WrappedComponent. The tasks can either be an array of tasks or a
 * wrapper object that contains a `tasks` array. If a wrapper object is given
 * that also has a `loading` field, then it will be passed down as a
 * `tasksLoading` prop.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function WithTaskMarkers(WrappedComponent,
                                        tasksProp='clusteredTasks') {
  return class extends Component {
    render() {
      const clusteredTasks = this.props[tasksProp]
      const markers = []
      if (!_isObject(clusteredTasks)) {
        return null
      }

      if (_isArray(clusteredTasks.tasks) && clusteredTasks.tasks.length > 0) {
        _each(clusteredTasks.tasks, task => {
          // Only create markers for created or skipped tasks
          if (task.point && (task.status === TaskStatus.created ||
                             task.status === TaskStatus.skipped)) {
            markers.push({
              position: [task.point.lat, task.point.lng],
              options: {
                challengeId: clusteredTasks.challengeId,
                isVirtualChallenge: clusteredTasks.isVirtualChallenge,
                challengeName: task.parentName,
                taskId: task.id,
              },
            })
          }
        })
      }

      return <WrappedComponent taskMarkers={markers}
                               tasksLoading={_get(this.props,
                                                 `${tasksProp}.loading`, false)}
                               {...this.props} />
    }
  }
}
