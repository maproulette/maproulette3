import React, { Component } from 'react'
import CompletionMetrics from '../../MetricsOverview/CompletionMetrics'
import BurndownChart from '../BurndownChart/BurndownChart'
import CompletionChart from '../../MetricsOverview/CompletionChart'
import WithComputedMetrics from '../../HOCs/WithComputedMetrics/WithComputedMetrics'

/**
 * Displays various metrics about a challenge and its tasks.
 */
export class ChallengeMetrics extends Component {
  render() {
    return (
      <div className="challenge-metrics">
        <h3 className="subtitle">Tasks</h3>
        <p className="subheading">Remaining</p>
        <BurndownChart actions={this.props.challenge.actions}
                       activity={this.props.challenge.activity}
                       {...this.props} />
        <CompletionMetrics {...this.props} />
        <CompletionChart width={320} height={240}
                         outerRadius={75} centerX={145} centerY={125} {...this.props} />
      </div>
    )
  }
}

export default WithComputedMetrics(ChallengeMetrics)
