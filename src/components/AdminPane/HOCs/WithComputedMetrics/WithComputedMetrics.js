import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import _isObject from 'lodash/isObject'
import _isNumber from 'lodash/isNumber'
import _each from 'lodash/each'
import _fromPairs from 'lodash/fromPairs'
import _map from 'lodash/map'
import _values from 'lodash/values'
import { TaskPriority } from '../../../../services/Task/TaskPriority/TaskPriority'

/**
 * WithComputedMetrics computes aggregated metrics for most of the task
 * "actions" in the challenges prop, passing them as a taskMetrics prop to its
 * wrapped component.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default function(WrappedComponent) {
  class WithComputedMetrics extends Component {
    computeAverages = (metrics, total) =>
      _fromPairs(_map(metrics, (value, label) => [label, 1.0 * value / total]))

    updateTotals = (actions, totalTasks, taskMetrics) => {
      _each(actions, (value, label) => {
        taskMetrics[label] = _isNumber(taskMetrics[label]) ?
                            taskMetrics[label] + value :
                            value

        const percentage = (1.0 * value / totalTasks) * 100.0
        taskMetrics.percentages[label] =  _isNumber(taskMetrics.percentages[label]) ?
                                          taskMetrics.percentages[label] + percentage :
                                          percentage
      })
    }

    render() {
      const challenges = _isArray(this.props.challenges) && this.props.challenges.length > 0 ?
                          this.props.challenges :
                          _isObject(this.props.challenge) ? [this.props.challenge] : []

      let totalChallenges = 0
      const taskMetrics = {}

      if (!_isEmpty(challenges)) {
        taskMetrics.percentages = {}
        taskMetrics.averages = {}

        for (let challenge of challenges) {
          totalChallenges += 1
          const totalTasks = _get(challenge, 'actions.total', 0)

          if (totalTasks > 0) {
            this.updateTotals(challenge.actions, totalTasks, taskMetrics)
          }
        }

        taskMetrics.averages =
          this.computeAverages(taskMetrics.percentages, totalChallenges)
      }

      let taskMetricsByPriority = null
      if (!_isEmpty(challenges) && challenges[0].priorityActions) {
        taskMetricsByPriority = {}
        taskMetricsByPriority.percentages = {}
        taskMetricsByPriority.averages = {}

        _each(_values(TaskPriority), priority => {
          taskMetricsByPriority[priority] = {percentages: {}, averages: {}}

          for (let challenge of challenges) {
            totalChallenges += 1
            const totalTasks = _get(challenge, 'actions.total', 0)

            if (totalTasks > 0 && challenge.priorityActions) {
              this.updateTotals(challenge.priorityActions[priority], totalTasks, taskMetricsByPriority[priority])
            }
          }

          taskMetricsByPriority[priority].averages =
            this.computeAverages(taskMetricsByPriority[priority].percentages, totalChallenges)
        })
      }

      return <WrappedComponent {...this.props}
                               challenges={challenges}
                               totalChallenges={totalChallenges}
                               taskMetrics={taskMetrics}
                               taskMetricsByPriority={taskMetricsByPriority} />
    }
  }

  WithComputedMetrics.propTypes = {
    /** challenges for which metrics are to be aggregated */
    challenges: PropTypes.array,
    /** single challenge for which metrics are to be aggregated */
    challenge: PropTypes.object,
  }

  return WithComputedMetrics
}
