import _has from "lodash/has";
import { Component } from "react";
import { FormattedMessage } from "react-intl";
import PastDurationSelector from "../../../components/PastDurationSelector/PastDurationSelector";
import {
  ALL_TIME,
  CURRENT_MONTH,
  CUSTOM_RANGE,
} from "../../../components/PastDurationSelector/PastDurationSelector";
import QuickWidget from "../../../components/QuickWidget/QuickWidget";
import messages from "../Messages";

export default class ReviewStats extends Component {
  calculatePercentage(count, total) {
    if (total === 0) {
      return 0;
    } else {
      return Math.round((count / total) * 100);
    }
  }

  displayStat(count, total, label) {
    return (
      <li className="mr-flex mr-items-center">
        <strong className="mr-font-light mr-text-5xl mr-min-w-12 mr-text-pink mr-text-right">
          {this.calculatePercentage(count, total)}%
        </strong>
        <div className="mr-pl-4 mr-leading-tight">
          <small className="mr-font-normal mr-text-pink">
            {count}/{total}
          </small>
          <br />
          {label}
        </div>
      </li>
    );
  }

  render() {
    const totalReviewTasks = this.props.reviewMetrics?.total || 0;

    let averageTime = null;
    if (!!this.props.asReviewer && (this.props.reviewMetrics?.avgReviewTime ?? 0) > 0) {
      const seconds = this.props.reviewMetrics.avgReviewTime / 1000;
      averageTime = (
        <div className="">
          <FormattedMessage {...messages.avgReviewTime} />
          <span className="mr-pl-2">
            {Math.floor(seconds / 60)}m {Math.floor(seconds) % 60}s
          </span>
        </div>
      );
    }

    return (
      <QuickWidget
        {...this.props}
        className="mr-card-widget mr-card-widget--padded"
        widgetTitle={this.props.title}
        rightHeaderControls={
          <PastDurationSelector
            className="mr-button mr-button--small"
            pastMonthsOptions={[1, 3, 6, 9, 12, CURRENT_MONTH, ALL_TIME, CUSTOM_RANGE]}
            currentMonthsPast={this.props.tasksMonthsPast}
            selectDuration={this.props.setTasksMonthsPast}
            selectCustomRange={this.props.setTasksCustomRange}
          />
        }
        noMain
        permanent
      >
        <ul className="mr-list-reset mr-my-3 mr-o-3 mr-text-base">
          {this.displayStat(
            this.props.reviewMetrics?.approved,
            this.props.totalReviews || totalReviewTasks,
            <FormattedMessage {...this.props.messages.approvedReview} />,
          )}
          {this.displayStat(
            this.props.reviewMetrics?.rejected,
            this.props.totalReviews || totalReviewTasks,
            <FormattedMessage {...this.props.messages.rejectedReview} />,
          )}
          {this.displayStat(
            this.props.reviewMetrics?.assisted,
            this.props.totalReviews || totalReviewTasks,
            <FormattedMessage {...this.props.messages.assistedReview} />,
          )}
          {this.displayStat(
            this.props.reviewMetrics?.disputed,
            this.props.totalReviews || totalReviewTasks,
            <FormattedMessage {...this.props.messages.disputedReview} />,
          )}
          {_has(this.props.reviewMetrics, "requested") &&
            this.displayStat(
              this.props.reviewMetrics?.requested,
              totalReviewTasks,
              <FormattedMessage {...this.props.messages.awaitingReview} />,
            )}
          {_has(this.props.reviewMetrics, "additionalReviews") &&
            this.displayStat(
              this.props.reviewMetrics?.additionalReviews,
              this.props.totalReviews || totalReviewTasks,
              <FormattedMessage {...this.props.messages.additionalReviews} />,
            )}
        </ul>

        {this.props.totalReviews && (
          <h5 className="mr-pt-4 mr-pb-2">
            <FormattedMessage {...this.props.messages.reviewerTasksTotal} />: {totalReviewTasks}
          </h5>
        )}
        {averageTime}
      </QuickWidget>
    );
  }
}
