import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { get as _get,
         isEmpty as _isEmpty,
         isArray as _isArray,
         isNumber as _isNumber,
         each as _each,
         fromPairs as _fromPairs,
         map as _map,
         omit as _omit } from 'lodash'

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

    render() {
      const challenges = _isArray(this.props.challenges) ?
                          this.props.challenges :
                          [this.props.challenge]

      let totalChallenges = 0
      const taskMetrics = {}

      if (!_isEmpty(challenges)) {
        taskMetrics.percentages = {}
        taskMetrics.averages = {}

        for (let challenge of challenges) {
          totalChallenges += 1
          const totalTasks = _get(challenge, 'actions.total', 0)

          if (totalTasks > 0) {
            _each(challenge.actions, (value, label) => {
              taskMetrics[label] = _isNumber(taskMetrics[label]) ?
                                  taskMetrics[label] + value :
                                  value

              const percentage = (1.0 * value / totalTasks) * 100.0
              taskMetrics.percentages[label] =  _isNumber(taskMetrics.percentages[label]) ?
                                                taskMetrics.percentages[label] + percentage :
                                                percentage
            })
          }
        }

        taskMetrics.averages =
          this.computeAverages(taskMetrics.percentages, totalChallenges)
      }

      return <WrappedComponent totalChallenges={totalChallenges}
                               taskMetrics={taskMetrics}
                               {..._omit(this.props, ['totalChallenges', 'taskMetrics'])} />
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
