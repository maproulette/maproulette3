import React, { Component } from 'react'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'
import _map from 'lodash/map'
import _get from 'lodash/get'
import messages from './Messages'
import { ReviewTasksType } from '../../../services/Task/TaskReview/TaskReview'
import { TaskPriority, keysByPriority, taskPriorityLabels }
       from '../../../services/Task/TaskPriority/TaskPriority'
import { TaskStatus, keysByStatus, statusLabels }
      from '../../../services/Task/TaskStatus/TaskStatus'
import SvgSymbol from '../../../components/SvgSymbol/SvgSymbol'
import BusySpinner from '../../../components/BusySpinner/BusySpinner'


/**
 * ReviewStatusMetrics displays metrics by Review Status
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default class ReviewStatusMetrics extends Component {
  buildReviewStats = (type, metrics) => {
    const asMetaReview = this.props.asMetaReview
    const metaReviewTotal = metrics.metaReviewRequested +
                            metrics.metaReviewApproved +
                            metrics.metaReviewRejected +
                            metrics.metaReviewAssisted
    return (
      <div className="mr-grid mr-grid-columns-1 mr-grid-gap-4">
        {type === ReviewTasksType.toBeReviewed &&
          this.buildToBeReviewed(metrics)}

        {type === ReviewTasksType.reviewedByMe && !asMetaReview &&
          this.buildReviewedByMe(metrics)}

        {type === ReviewTasksType.myReviewedTasks && !asMetaReview &&
          this.buildMyReviewTasks(metrics)}

        {type === ReviewTasksType.allReviewedTasks && !asMetaReview &&
          this.buildAllReviewedTasks(metrics)}

        {type === ReviewTasksType.allReviewedTasks && asMetaReview &&
          this.buildAllReviewedTasksAsMetaReviewStatus(metrics, metaReviewTotal)}

        {type === ReviewTasksType.metaReviewTasks && !asMetaReview &&
          this.buildMetaReviewTasks(metrics)}

        {type === ReviewTasksType.metaReviewTasks && asMetaReview &&
          this.buildMetaReviewTasksAsMetaReviewStatus(metrics, metaReviewTotal)}
      </div>
    )
  }

  buildToBeReviewed = metrics => {
    return (
      <React.Fragment>
        {buildMetric(metrics.reviewRequested, metrics.total,
          <FormattedMessage {...messages.awaitingReview} />)}
        {buildMetric(metrics.reviewDisputed, metrics.total,
          <FormattedMessage {...messages.disputedReview} />)}
      </React.Fragment>
    )
  }

  buildReviewedByMe = metrics => {
    return (
      <React.Fragment>
        {buildMetric(metrics.reviewApproved, metrics.total,
          <FormattedMessage {...messages.approvedReview} />)}
        {buildMetric(metrics.reviewRejected, metrics.total,
          <FormattedMessage {...messages.rejectedReview} />)}
        {buildMetric(metrics.reviewAssisted, metrics.total,
          <FormattedMessage {...messages.assistedReview} />)}
        {buildMetric(metrics.reviewDisputed, metrics.total,
          <FormattedMessage {...messages.disputedReview} />)}
      </React.Fragment>
    )
  }

  buildMyReviewTasks = metrics => {
    return (
      <React.Fragment>
        {buildMetric(metrics.reviewRequested, metrics.total,
          <FormattedMessage {...messages.awaitingReview} />)}
        {buildMetric(metrics.reviewApproved, metrics.total,
          <FormattedMessage {...messages.approvedReview} />)}
        {buildMetric(metrics.reviewRejected, metrics.total,
          <FormattedMessage {...messages.rejectedReview} />)}
        {buildMetric(metrics.reviewAssisted, metrics.total,
          <FormattedMessage {...messages.assistedReview} />)}
        {buildMetric(metrics.reviewDisputed, metrics.total,
          <FormattedMessage {...messages.disputedReview} />)}
      </React.Fragment>
    )
  }

  buildAllReviewedTasks = metrics => {
    return (
      <React.Fragment>
        {buildMetric(metrics.reviewRequested, metrics.total,
          <FormattedMessage {...messages.awaitingReview} />)}
        {buildMetric(metrics.reviewApproved, metrics.total,
          <FormattedMessage {...messages.approvedReview} />)}
        {buildMetric(metrics.reviewRejected, metrics.total,
          <FormattedMessage {...messages.rejectedReview} />)}
        {buildMetric(metrics.reviewAssisted, metrics.total,
          <FormattedMessage {...messages.assistedReview} />)}
        {buildMetric(metrics.reviewDisputed, metrics.total,
          <FormattedMessage {...messages.disputedReview} />)}
      </React.Fragment>
    )
  }

  buildAllReviewedTasksAsMetaReviewStatus = (metrics, metaReviewTotal) => {
    return (
      <React.Fragment>
        {buildMetric(metrics.metaReviewRequested, metaReviewTotal,
          <FormattedMessage {...messages.metaRequestedReview} />)}
        {buildMetric(metrics.metaReviewApproved, metaReviewTotal,
          <FormattedMessage {...messages.metaApprovedReview} />)}
        {buildMetric(metrics.metaReviewRejected, metaReviewTotal,
          <FormattedMessage {...messages.metaRejectedReview} />)}
        {buildMetric(metrics.metaReviewAssisted, metaReviewTotal,
          <FormattedMessage {...messages.metaAssistedReview} />)}
      </React.Fragment>
    )
  }

  buildMetaReviewTasks = metrics => {
    return (
      <React.Fragment>
        {buildMetric(metrics.reviewApproved, metrics.total,
          <FormattedMessage {...messages.approvedReview} />)}
        {buildMetric(metrics.reviewAssisted, metrics.total,
          <FormattedMessage {...messages.assistedReview} />)}
      </React.Fragment>
    )
  }

  buildMetaReviewTasksAsMetaReviewStatus = (metrics) => {
    return (
      <React.Fragment>
        {buildMetric((metrics.total - metrics.metaReviewRequested), metrics.total,
          <FormattedMessage {...messages.awaitingMetaReview} />)}
        {buildMetric(metrics.metaReviewRequested, metrics.total,
          <FormattedMessage {...messages.awaitingMetaReReview} />)}
      </React.Fragment>
    )
  }

  render() {
    if (this.props.loading) return <BusySpinner />

    if (this.props.metricsUpdateAvailable) {
      return (
        <button className="mr-button" onClick={this.props.refreshMetrics}>
          <FormattedMessage {...messages.loadMetricsLabel} />
        </button>
      )
    }

    const metrics = this.props.reviewMetrics
    const reviewMetricsByPriority = this.props.reviewMetricsByPriority
    const reviewMetricsByTaskStatus = this.props.reviewMetricsByTaskStatus

    const type = this.props.reviewTasksType || ReviewTasksType.allReviewedTasks

    const prioritizedReviewStats = _map(TaskPriority, (priority) => {
      if (reviewMetricsByPriority && reviewMetricsByPriority[priority]) {
        const localizedPriorityLabels = taskPriorityLabels(this.props.intl)

        return (
          <div className="mr-mt-6 mr-mb-6" key={priority}>
            <div
              className={classNames(
                "mr-text-md mr-mb-4",
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

    const byStatusReviewStats = _map(TaskStatus, (status) => {
      if (reviewMetricsByTaskStatus && reviewMetricsByTaskStatus[status]) {
        const localizedStatusLabels = statusLabels(this.props.intl)

        return (
          <div className="mr-mt-6" key={status}>
            <div
              className={classNames(
                "mr-text-md mr-mb-4",
                "mr-text-yellow mr-font-normal"
              )}
            >
              <FormattedMessage
                {...messages.taskStatusLabel}
                values={{status: localizedStatusLabels[keysByStatus[status]]}}
              />
            </div>
            {this.buildReviewStats(type, reviewMetricsByTaskStatus[status])}
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
              "mr-text-green-lighter"
            )}
            onClick={() => this.props.setShowByPriority(!this.props.showByPriority)}
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

        {reviewMetricsByTaskStatus && this.props.setShowByTaskStatus &&
          <div
            className={classNames(
              "mr-cursor-pointer mr-flex mr-items-center mr-mt-2",
              "mr-text-green-lighter"
            )}
            onClick={() => this.props.setShowByTaskStatus(!this.props.showByTaskStatus)}
          >
            <span className="mr-align-top">
              <FormattedMessage {...messages.byTaskStatusToggle} />
            </span>
            <span>
              <SvgSymbol
                sym="icon-cheveron-down"
                viewBox="0 0 20 20"
                className={classNames("mr-fill-current mr-w-5 mr-h-5 mr-transition",
                                      {"mr-expand-available": !this.props.showByTaskStatus})}
              />
            </span>
          </div>
        }
        {this.props.showByTaskStatus && byStatusReviewStats}
      </div>
    )
  }
}

function buildMetric(amount, total, description) {
  return (
    <div className="mr-grid mr-grid-columns-5 mr-grid-gap-2">
      <div className="mr-col-span-1 mr-text-2xl mr-text-pink">
        {amount === 0 || !(total > 0) ? 0 : Math.round(amount / total * 100)}%
      </div>
      <div className="mr-col-span-4">
        <div className="mr-text-pink mr-text-base">
          {amount ? amount : 0}/{total ? total : 0}
        </div>
        <div>{description}</div>
      </div>
    </div>
  )
}
