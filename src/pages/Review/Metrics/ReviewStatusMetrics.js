import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import messages from './Messages'
import { ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'
import { TaskPriority, keysByPriority, taskPriorityLabels }
       from '../../../services/Task/TaskPriority/TaskPriority'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'


/**
 * ReviewStatusMetrics displays metrics by Review Status
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class ReviewStatusMetrics extends Component {
  buildReviewStats = (type, metrics) => {
    return (
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
    )
  }
  render() {
    const metrics = this.props.reviewMetrics
    const reviewMetricsByPriority = this.props.reviewMetricsByPriority

    const type = this.props.reviewTasksType || ReviewTasksType.allReviewedTasks

    const prioritizedReviewStats = _map(TaskPriority, (priority, key) => {
      if (reviewMetricsByPriority && reviewMetricsByPriority[priority]) {
        const localizedPriorityLabels = taskPriorityLabels(this.props.intl)

        return (
          <div className="mr-mt-6" key={priority}>
            <div
              className={classNames(
                "mr-text-md mr-mb-4",
                this.props.lightMode ? "mr-text-matisse-blue mr-font-medium" :
                                       "mr-text-yellow mr-font-normal"
              )}
            >
              <FormattedMessage
                {...messages.priorityLabel}
                values={{priority: localizedPriorityLabels[keysByPriority[priority]]}}
              />
            </div>
            {this.buildReviewStats(type, reviewMetricsByPriority[priority])}
          </div>
        )
      }
    })

    let averageTime = null
    if (_get(metrics, 'avgReviewTime', 0) > 0) {
      const seconds = metrics.avgReviewTime / 1000
      averageTime =
        <div className="mr-mt-4">
          <FormattedMessage {...messages.avgTimeSpent} />
          <span className="mr-pl-2">
            {Math.floor(seconds / 60)}m {Math.floor(seconds) % 60}s
          </span>
        </div>
    }

    return (
      <div className={classNames("review-status-metrics")}>
        {metrics && this.buildReviewStats(type, metrics)}
        {averageTime}
        {reviewMetricsByPriority && this.props.setShowByPriority &&
          <div
            className={classNames(
              "mr-cursor-pointer mr-flex mr-items-center mr-mt-6",
              this.props.lightMode ? "mr-text-green-light" : "mr-text-green-lighter"
            )}
            onClick={(e) => this.props.setShowByPriority(!this.props.showByPriority)}
          >
            <span className="mr-align-top">
              <FormattedMessage {...messages.byPriorityToggle} />
            </span>
            <span>
              <SvgSymbol
                sym="icon-cheveron-down"
                viewBox="0 0 20 20"
                className={classNames("mr-fill-current mr-w-5 mr-h-5 mr-transition",
                                      {"mr-expand-available": !this.props.showByPriority})}
              />
            </span>
          </div>
        }
        {this.props.showByPriority && prioritizedReviewStats}
      </div>
    )
  }
}

function buildMetric(amount, total, description, lightMode = false) {
  return (
    <div className="mr-grid mr-grid-columns-5 mr-grid-gap-2">
      <div className="mr-col-span-1 mr-text-2xl mr-text-pink">
        {amount === 0 ? 0 : Math.round(amount / total * 100)}%
      </div>
      <div className="mr-col-span-4">
        <div className="mr-text-pink mr-text-base">
          {amount}/{total}
        </div>
        <div>{description}</div>
      </div>
    </div>
  )
}
