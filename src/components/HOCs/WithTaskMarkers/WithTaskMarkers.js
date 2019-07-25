import React, { Component } from 'react'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isFinite from 'lodash/isFinite'
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
  class _WithTaskMarkers extends Component {
    render() {
      const challengeTasks = _get(this.props, tasksProp)

      const markers = []
      if (_isObject(challengeTasks)) {
        if (_isArray(challengeTasks.tasks) && challengeTasks.tasks.length > 0) {
          _each(challengeTasks.tasks, task => {
            // Only create markers for created or skipped tasks
            if (task.point && (task.status === TaskStatus.created ||
                               task.status === TaskStatus.skipped ||
                               task.status === TaskStatus.tooHard)) {
              markers.push({
                position: [task.point.lat, task.point.lng],
                options: {
                  challengeId: _isFinite(challengeTasks.challengeId) ?
                               challengeTasks.challengeId : (task.challengeId || task.parentId),
                  isVirtualChallenge: challengeTasks.isVirtualChallenge,
                  challengeName: task.parentName,
                  taskId: task.id,
                },
              })
            }
            else if (task.geometries) {
              _each(_get(task.geometries, 'features'), (feature) => {
                if (feature.geometry.type === "Point" )
                  markers.push({
                    position: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
                    options: {
                      challengeId: _isFinite(challengeTasks.challengeId) ?
                                   challengeTasks.challengeId : (task.challengeId || task.parentId),
                      isVirtualChallenge: challengeTasks.isVirtualChallenge,
                      challengeName: task.parentName,
                      taskId: task.id,
                    },
                  })
                }
              )
            }
          })
        }
      }

      return <WrappedComponent taskMarkers={markers}
                               tasksLoading={_get(this.props,
                                                 `${tasksProp}.loading`, false)}
                               {...this.props} />
    }
  }

  _WithTaskMarkers.displayName =
    `WithTaskMarkers(${WrappedComponent.displayName ||
                       WrappedComponent.name || 'Component'})`

  return _WithTaskMarkers
}
