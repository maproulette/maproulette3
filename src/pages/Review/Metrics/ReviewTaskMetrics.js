import React, { Component } from 'react'
import classNames from 'classnames'
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
      <div className={classNames("review-status-metrics")}>


        {metrics && metrics.total > 0 &&
          <ChallengeProgress className="mr-mt-4 mr-mb-12" taskMetrics={metrics} />
        }
      </div>
    )
  }
}
