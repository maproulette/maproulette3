import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { injectIntl } from 'react-intl'
import _isEmpty from 'lodash/isEmpty'
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
    if (_isEmpty(this.props.taskMetrics)) {
      return null
    }

    return (
      <div className="challenge-metrics">
        <BurndownChart chartTitle={this.props.intl.formatMessage(
                                    messages.tasksAvailableHeading
                                  )}
                       activity={this.props.burndownActivity}
                       {...this.props} />

        <div className="challenge-metrics__completion">
          <CompletionChart {...this.props} />
          <CompletionMetrics {...this.props} />
        </div>
      </div>
    )
  }
}

ChallengeMetrics.propTypes = {
  challenges: PropTypes.array.isRequired,
}

export default WithComputedMetrics(injectIntl(ChallengeMetrics))
