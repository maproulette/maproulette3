import React, { Component } from 'react'
import classNames from 'classnames'
import messages from './Messages'
import ChallengeProgress from '../../../components/ChallengeProgress/ChallengeProgress'


/**
 * ReviewTaskMetrics displays metrics by Task Status
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class ReviewTaskMetrics extends Component {
  render() {
    const metrics = this.props.reviewMetrics

    return (
      <div className={classNames("review-status-metrics", this.props.className)}>
        {metrics &&
          <div className="mr-my-4 mr-grid mr-grid-columns-2 mr-grid-gap-1">
            {buildMetric(metrics.fixed, metrics.total, this.props.intl.formatMessage(messages.fixed))}
            {buildMetric(metrics.falsePositive, metrics.total, this.props.intl.formatMessage(messages.falsePositive))}
            {buildMetric(metrics.alreadyFixed, metrics.total, this.props.intl.formatMessage(messages.alreadyFixed))}
            {buildMetric(metrics.tooHard, metrics.total, this.props.intl.formatMessage(messages.tooHard))}
          </div>
        }

        {metrics && metrics.total > 0 &&
          <ChallengeProgress className="mr-mt-4 mr-mb-12" taskMetrics={metrics} />
        }
      </div>
    )
  }
}

function buildMetric(amount, total, description) {
  return <div className="mr-mx-2 mr-grid mr-grid-columns-2">
    <div className="mr-text-yellow">{amount === 0 ? 0 : Math.round(amount / total * 100)}%</div>
    <div className="decription mr-text-xs mr-min-w-100">{amount}/{total} - {description}</div>
  </div>
}
