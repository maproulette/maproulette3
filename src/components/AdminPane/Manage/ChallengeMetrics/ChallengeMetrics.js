import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import _isEmpty from 'lodash/isEmpty'
import _omit from 'lodash/omit'
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
        <p className="subheading">
          <FormattedMessage {...messages.tasksAvailableHeading} />
        </p>
        <BurndownChart height={this.props.burndownHeight}
                       {..._omit(this.props, 'height')} />
        <div className="challenge-metrics__completion">
          <CompletionChart height={this.props.completionHeight}
                           {..._omit(this.props, 'height')} />
          <CompletionMetrics {...this.props} />
        </div>
      </div>
    )
  }
}

ChallengeMetrics.propTypes = {
  challenges: PropTypes.array.isRequired,
}

export default WithComputedMetrics(ChallengeMetrics)
