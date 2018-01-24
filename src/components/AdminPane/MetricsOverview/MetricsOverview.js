import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { map as _map,
         compact as _compact,
         round as _round,
         startCase as _startCase } from 'lodash'
import WithComputedMetrics from '../HOCs/WithComputedMetrics/WithComputedMetrics'
import CompletionMetrics from './CompletionMetrics'
import CompletionChart from './CompletionChart'
import './MetricsOverview.css'


/**
 * MetricsOverview displays a number of high-level aggregated metrics and
 * visualizations describing the challenges it is provided.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class MetricsOverview extends Component {
  render() {
    const headlineStats = _compact(_map(this.props.taskMetrics.averages, (value, label) => {
      if (label === 'total') {
        return null
      }

      return (
        <div className="column stat" key={label}>
          <div className="value">{_round(value, 1)}%</div>
          <div className="name">{_startCase(label)}</div>
        </div>
      )
    }))

    headlineStats.unshift((
      <div className="column stat" key='totalTasks'>
        <div className="value">{this.props.taskMetrics.total}</div>
        <div className="name">Tasks</div>
      </div>
    ))

    headlineStats.unshift((
      <div className="column stat" key='totalChallenges'>
        <div className="value">{this.props.totalChallenges}</div>
        <div className="name">Challenges</div>
      </div>
    ))

    return (
      <div className="metrics-overview">
        <div className="columns stats">{headlineStats}</div>

        <div className="task-stats">
          <CompletionChart {...this.props} />
          <CompletionMetrics {...this.props} />
        </div>
      </div>
    )
  }
}

MetricsOverview.propTypes = {
  totalChallenges: PropTypes.number.isRequired,
  taskMetrics: PropTypes.object.isRequired,
}

export default WithComputedMetrics(MetricsOverview)
