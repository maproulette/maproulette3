import _fromPairs from "lodash/fromPairs";
import _isEmpty from "lodash/isEmpty";
import _isObject from "lodash/isObject";
import _map from "lodash/map";
import PropTypes from "prop-types";
import { Component } from "react";
import { TaskPriority } from "../../../../services/Task/TaskPriority/TaskPriority";

/**
 * WithComputedMetrics computes aggregated metrics for most of the task
 * "actions" in the challenges prop, passing them as a taskMetrics prop to its
 * wrapped component.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function (WrappedComponent) {
  class WithComputedMetrics extends Component {
    computeAverages = (metrics, total) =>
      _fromPairs(_map(metrics, (value, label) => [label, (1.0 * value) / total]));

    updateTotals = (actions, totalTasks, taskMetrics) => {
      for (const [label, value] of Object.entries(actions)) {
        if (label === "avgTimeSpent") {
          taskMetrics.totalTimeSpent = Number.isFinite(taskMetrics.totalTimeSpent)
            ? taskMetrics.totalTimeSpent + value * actions.tasksWithTime
            : value * actions.tasksWithTime;
        } else {
          taskMetrics[label] = Number.isFinite(taskMetrics[label])
            ? taskMetrics[label] + value
            : value;

          const percentage = ((1.0 * value) / totalTasks) * 100.0;
          taskMetrics.percentages[label] = Number.isFinite(taskMetrics.percentages[label])
            ? taskMetrics.percentages[label] + percentage
            : percentage;
        }
      }
    };

    render() {
      const challenges =
        Array.isArray(this.props.challenges) && this.props.challenges.length > 0
          ? this.props.challenges
          : _isObject(this.props.challenge)
            ? [this.props.challenge]
            : [];

      let totalChallenges = 0;
      const taskMetrics = {};

      if (!_isEmpty(challenges)) {
        taskMetrics.percentages = {};
        taskMetrics.averages = {};

        for (let challenge of challenges) {
          totalChallenges += 1;
          const totalTasks = challenge?.actions?.total ?? 0;

          if (totalTasks > 0) {
            this.updateTotals(challenge.actions, totalTasks, taskMetrics);
          }
        }

        taskMetrics.averages = this.computeAverages(taskMetrics.percentages, totalChallenges);
      }

      let taskMetricsByPriority = null;
      if (!_isEmpty(challenges) && challenges[0].priorityActions) {
        taskMetricsByPriority = {};
        taskMetricsByPriority.percentages = {};
        taskMetricsByPriority.averages = {};

        for (const priority of Object.values(TaskPriority)) {
          taskMetricsByPriority[priority] = { percentages: {}, averages: {} };

          for (let challenge of challenges) {
            totalChallenges += 1;
            const totalTasks = challenge?.actions?.total ?? 0;

            if (totalTasks > 0 && challenge.priorityActions) {
              this.updateTotals(
                challenge.priorityActions[priority],
                totalTasks,
                taskMetricsByPriority[priority],
              );
            }
          }

          taskMetricsByPriority[priority].averages = this.computeAverages(
            taskMetricsByPriority[priority].percentages,
            totalChallenges,
          );
        }
      }

      return (
        <WrappedComponent
          {...this.props}
          challenges={challenges}
          totalChallenges={totalChallenges}
          taskMetrics={taskMetrics}
          taskMetricsByPriority={taskMetricsByPriority}
        />
      );
    }
  }

  WithComputedMetrics.propTypes = {
    /** challenges for which metrics are to be aggregated */
    challenges: PropTypes.array,
    /** single challenge for which metrics are to be aggregated */
    challenge: PropTypes.object,
  };

  return WithComputedMetrics;
}
