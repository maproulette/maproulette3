import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import QuickWidget from '../../../components/QuickWidget/QuickWidget'
import PastDurationSelector from '../../../components/PastDurationSelector/PastDurationSelector'
import {ALL_TIME, CURRENT_MONTH}
       from '../../../components/PastDurationSelector/PastDurationSelector'
import _get from 'lodash/get'

export default class ReviewStats extends Component {
  calculatePercentage(count, total) {
    if (total === 0) {
      return 0
    }
    else {
      return Math.round(count / total * 100)
    }
  }

  displayStat(count, total, label) {
    return (
      <li className="mr-flex mr-items-center">
        <strong className="mr-font-light mr-text-5xl mr-min-w-12 mr-text-yellow mr-text-right">
          {this.calculatePercentage(count, total)}%
        </strong>
        <div className="mr-pl-4 mr-leading-tight">
          <small className="mr-font-normal mr-text-yellow">
            {count}/{total}
          </small>
          <br />
          {label}
        </div>
      </li>
    )
  }

  render() {
    const totalReviewTasks = _get(this.props.reviewMetrics, 'total') || 0

    return (
      <QuickWidget
        {...this.props}
        className="mr-card-widget mr-card-widget--padded"
        widgetTitle={this.props.title}
        rightHeaderControls={
          <PastDurationSelector
            className="mr-button mr-button--small"
            pastMonthsOptions={[1, 3, 6, 9, 12, CURRENT_MONTH, ALL_TIME]}
            currentMonthsPast={this.props.tasksMonthsPast}
            selectDuration={this.props.setTasksMonthsPast}
          />
        }
        noMain
        permanent
      >
        <ul className="mr-list-reset mr-my-3 mr-o-3 mr-text-base">
          {this.displayStat(_get(this.props.reviewMetrics, 'approved'),
                            totalReviewTasks, <FormattedMessage {...this.props.messages.approvedReview} />)}
          {this.displayStat(_get(this.props.reviewMetrics, 'rejected'),
                            totalReviewTasks, <FormattedMessage {...this.props.messages.rejectedReview} />)}
          {this.displayStat(_get(this.props.reviewMetrics, 'assisted'),
                            totalReviewTasks, <FormattedMessage {...this.props.messages.assistedReview} />)}
          {this.displayStat(_get(this.props.reviewMetrics, 'disputed'),
                            totalReviewTasks, <FormattedMessage {...this.props.messages.disputedReview} />)}
          {this.displayStat(_get(this.props.reviewMetrics, 'requested'),
                            totalReviewTasks, <FormattedMessage {...this.props.messages.awaitingReview} />)}
        </ul>
      </QuickWidget>
    )
  }
}
