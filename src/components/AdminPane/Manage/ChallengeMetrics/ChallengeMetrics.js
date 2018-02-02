import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import CompletionMetrics from '../../MetricsOverview/CompletionMetrics'
import BurndownChart from '../BurndownChart/BurndownChart'
import CompletionChart from '../../MetricsOverview/CompletionChart'
import WithComputedMetrics from '../../HOCs/WithComputedMetrics/WithComputedMetrics'
import messages from './Messages'
import './ChallengeMetrics.css'

/**
 * Displays various metrics and charts concerning one or more challenges.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class ChallengeMetrics extends Component {
  render() {
    return (
      <div className="challenge-metrics">
        <h3 className="subtitle">
          <FormattedMessage {...messages.tasksHeading} />
        </h3>
        <p className="subheading">
          <FormattedMessage {...messages.tasksAvailableHeading} />
        </p>
        <BurndownChart {...this.props} />
        <CompletionMetrics {...this.props} />
        <CompletionChart width={320} height={240}
                         outerRadius={75} centerX={145} centerY={125}
                         {...this.props} />
      </div>
    )
  }
}

ChallengeMetrics.propTypes = {
  challenges: PropTypes.array.isRequired,
}

export default WithComputedMetrics(ChallengeMetrics)
