import _each from "lodash/each";
import _get from "lodash/get";
import _isObject from "lodash/isObject";
import { Component } from "react";
import AsMappableTask from "../../../interactions/Task/AsMappableTask";
import { TaskStatus } from "../../../services/Task/TaskStatus/TaskStatus";

/**
 * WithTaskMarkers generates map markers for the given tasks and passes them
 * down to the WrappedComponent. The tasks can either be an array of tasks or a
 * wrapper object that contains a `tasks` array. If a wrapper object is given
 * that also has a `loading` field, then it will be passed down as a
 * `tasksLoading` prop.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function WithTaskMarkers(WrappedComponent, tasksProp = "clusteredTasks") {
  class _WithTaskMarkers extends Component {
    render() {
      const challengeTasks = _get(this.props, tasksProp);

      // Only create markers for allowed statuses OR [created, skipped, or too-hard tasks]
      const allowedStatuses = this.props.allowedStatuses || [
        TaskStatus.created,
        TaskStatus.skipped,
        TaskStatus.tooHard,
      ];

      const markers = [];
      if (_isObject(challengeTasks)) {
        if (Array.isArray(challengeTasks.tasks) && challengeTasks.tasks.length > 0) {
          _each(challengeTasks.tasks, (task) => {
            if (allowedStatuses.indexOf(task.status) === -1) {
              return;
            }

            const nearestToCenter = AsMappableTask(task).nearestPointToCenter();
            markers.push({
              position: [
                nearestToCenter.geometry.coordinates[1],
                nearestToCenter.geometry.coordinates[0],
              ],
              options: {
                challengeId: Number.isFinite(challengeTasks.challengeId)
                  ? challengeTasks.challengeId
                  : task.challengeId || task.parentId || task.parent,
                isVirtualChallenge: challengeTasks.isVirtualChallenge,
                challengeName: task.parentName,
                taskId: task.id,
                status: task.status,
                priority: task.priority,
                reviewStatus: task.reviewStatus,
              },
            });
          });
        }
      }

      return (
        <WrappedComponent
          taskMarkers={markers}
          tasksLoading={this.props[tasksProp]?.loading ?? false}
          {...this.props}
        />
      );
    }
  }

  _WithTaskMarkers.displayName = `WithTaskMarkers(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return _WithTaskMarkers;
}
