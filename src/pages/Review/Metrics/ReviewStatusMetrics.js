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
    const type = this.props.reviewTasksType || ReviewTasksType.allReviewedTasks

    return (
      <div className={classNames("review-status-metrics")}>
        {metrics &&
          <div className="mr-grid mr-grid-columns-1 mr-grid-gap-4">
            {type === ReviewTasksType.toBeReviewed &&
              buildMetric(metrics.reviewRequested, metrics.total,
                <FormattedMessage {...messages.awaitingReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.toBeReviewed &&
              buildMetric(metrics.reviewDisputed, metrics.total,
                <FormattedMessage {...messages.disputedReview} />,
                this.props.lightMode)}

            {type === ReviewTasksType.reviewedByMe &&
              buildMetric(metrics.reviewApproved, metrics.total,
                <FormattedMessage {...messages.approvedReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.reviewedByMe &&
              buildMetric(metrics.reviewRejected, metrics.total,
                <FormattedMessage {...messages.rejectedReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.reviewedByMe &&
              buildMetric(metrics.reviewAssisted, metrics.total,
                <FormattedMessage {...messages.assistedReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.reviewedByMe &&
              buildMetric(metrics.reviewDisputed, metrics.total,
                <FormattedMessage {...messages.disputedReview} />,
                this.props.lightMode)}

            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewRequested, metrics.total,
                <FormattedMessage {...messages.awaitingReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewApproved, metrics.total,
                <FormattedMessage {...messages.approvedReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewRejected, metrics.total,
                <FormattedMessage {...messages.rejectedReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewAssisted, metrics.total,
                <FormattedMessage {...messages.assistedReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.myReviewedTasks &&
              buildMetric(metrics.reviewDisputed, metrics.total,
                <FormattedMessage {...messages.disputedReview} />,
                this.props.lightMode)}

            {type === ReviewTasksType.allReviewedTasks &&
              buildMetric(metrics.reviewRequested, metrics.total,
                <FormattedMessage {...messages.awaitingReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.allReviewedTasks &&
              buildMetric(metrics.reviewApproved, metrics.total,
                <FormattedMessage {...messages.approvedReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.allReviewedTasks &&
              buildMetric(metrics.reviewRejected, metrics.total,
                <FormattedMessage {...messages.rejectedReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.allReviewedTasks &&
              buildMetric(metrics.reviewAssisted, metrics.total,
                <FormattedMessage {...messages.assistedReview} />,
                this.props.lightMode)}
            {type === ReviewTasksType.allReviewedTasks &&
              buildMetric(metrics.reviewDisputed, metrics.total,
                <FormattedMessage {...messages.disputedReview} />,
                this.props.lightMode)}
          </div>
        }
      </div>
    )
  }
}

function buildMetric(amount, total, description, lightMode = false) {
  return <div className="mr-grid mr-grid-columns-5 mr-grid-gap-2">
    <div className={classNames("mr-col-span-1 mr-text-2xl",
                    lightMode ? "mr-text-pink":"mr-text-yellow")}>
      {amount === 0 ? 0 : Math.round(amount / total * 100)}%
    </div>
    <div className="mr-col-span-4">
      <div className={classNames(lightMode ? "mr-text-pink":"mr-text-yellow")}>
        {amount} / {total}
      </div>
      <div>{description}</div>
    </div>
  </div>
}
