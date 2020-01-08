import React, { Component } from 'react'
import _get from 'lodash/get'
import _isArray from 'lodash/isArray'
import _isFinite from 'lodash/isFinite'
import _isObject from 'lodash/isObject'
import _each from 'lodash/each'
import { TaskStatus } from '../../../services/Task/TaskStatus/TaskStatus'
import AsMappableTask from '../../../interactions/Task/AsMappableTask'

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

      // Only create markers for created, skipped, or too-hard tasks
      const allowedStatuses = [TaskStatus.created, TaskStatus.skipped, TaskStatus.tooHard]
      const markers = []
      if (_isObject(challengeTasks)) {
        if (_isArray(challengeTasks.tasks) && challengeTasks.tasks.length > 0) {
          _each(challengeTasks.tasks, task => {
            if (allowedStatuses.indexOf(task.status) === -1) {
              return
            }

            const nearestToCenter = AsMappableTask(task).nearestPointToCenter()
            markers.push({
              position: [nearestToCenter.geometry.coordinates[1], nearestToCenter.geometry.coordinates[0]],
              options: {
                challengeId: _isFinite(challengeTasks.challengeId) ?
                              challengeTasks.challengeId : (task.challengeId || task.parentId),
                isVirtualChallenge: challengeTasks.isVirtualChallenge,
                challengeName: task.parentName,
                taskId: task.id,
              },
            })
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
