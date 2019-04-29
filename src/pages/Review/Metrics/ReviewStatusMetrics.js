import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import messages from './Messages'
import { ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'

/**
 * ReviewStatusMetrics displays metrics by Review Status
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class ReviewStatusMetrics extends Component {
  render() {
    const metrics = this.props.reviewMetrics
    const type = this.props.reviewTasksType

    return (
      <div className={classNames("review-status-metrics", this.props.className)}>
        {metrics &&
          <div className="mr-grid mr-grid-columns-1 mr-grid-gap-4">
            {type === ReviewTasksType.toBeReviewed &&
              buildMetric(metrics.reviewRequested, metrics.total,
                <FormattedMessage {...messages.awaitingReview} />)}
            {type === ReviewTasksType.toBeReviewed &&
              buildMetric(metrics.reviewDisputed, metrics.total,
                <FormattedMessage {...messages.disputedReview} />)}

            {type === ReviewTasksType.reviewedByMe &&
              buildMetric(metrics.reviewApproved, metrics.total,
                <FormattedMessage {...messages.approvedReview} />)}
            {type === ReviewTasksType.reviewedByMe &&
              buildMetric(metrics.reviewRejected, metrics.total,
                <FormattedMessage {...messages.rejectedReview} />)}
            {type === ReviewTasksType.reviewedByMe &&
              buildMetric(metrics.reviewAssisted, metrics.total,
                <FormattedMessage {...messages.assistedReview} />)}
            {type === ReviewTasksType.reviewedByMe &&
              buildMetric(metrics.reviewDisputed, metrics.total,
                <FormattedMessage {...messages.disputedReview} />)}

            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewRequested, metrics.total,
                <FormattedMessage {...messages.awaitingReview} />)}
            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewApproved, metrics.total,
                <FormattedMessage {...messages.approvedReview} />)}
            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewRejected, metrics.total,
                <FormattedMessage {...messages.rejectedReview} />)}
            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewAssisted, metrics.total,
                <FormattedMessage {...messages.assistedReview} />)}
            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewDisputed, metrics.total,
                <FormattedMessage {...messages.disputedReview} />)}

          </div>
        }
      </div>
    )
  }
}

function buildMetric(amount, total, description) {
  return <div className="mr-ml-4 mr-grid mr-grid-columns-2 mr-grid-gap-2">
    <div className="mr-text-yellow mr-text-xl">{amount === 0 ? 0 : Math.round(amount / total * 100)}%</div>
    <div className="decription">
      <div className="mr-text-yellow">{amount} / {total}</div>
      <div >{description}</div>
    </div>
  </div>
}
