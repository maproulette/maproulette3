import { format } from "date-fns";
import _omit from "lodash/omit";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  ALL_TIME,
  CUSTOM_RANGE,
} from "../../../components/PastDurationSelector/PastDurationSelector";
import { fetchLeaderboardForUser } from "../../../services/Leaderboard/Leaderboard";
import { fetchUserMetrics } from "../../../services/User/User";

/**
 * WithUserMetrics retrieves metrics for the current user
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithUserMetrics = function (WrappedComponent, userProp) {
  return class extends Component {
    state = {
      loading: false,
      tasksCompletedMonthsPast: ALL_TIME,
      tasksReviewedMonthsPast: ALL_TIME,
      tasksReviewerMonthsPast: ALL_TIME,
      tasksCompletedDateRange: [], // Range will be [start, end] when set
      tasksReviewedDateRange: [],
      tasksReviewerDateRange: [],
    };

    async updateAllMetrics() {
      if (
        this.props[userProp] &&
        (!this.props[userProp]?.settings?.leaderboardOptOut ||
          this.props[userProp]?.id === this.props.currentUser?.userId)
      ) {
        this.setState({ loading: true });

        const userLeaderboard = await this.props.fetchLeaderboardForUser(
          this.props[userProp].id,
          0,
          -1,
        );
        this.setState({ loading: false, leaderboardMetrics: userLeaderboard[0] });

        await this.updateUserMetrics();
      }
    }

    async updateUserMetrics() {
      if (
        !this.props[userProp]?.settings?.leaderboardOptOut ||
        this.props[userProp]?.id === this.props.currentUser?.userId
      ) {
        const startDate =
          (this.state.tasksCompletedDateRange?.length ?? 0) === 2
            ? format(this.state.tasksCompletedDateRange[0], "yyyy-MM-dd")
            : null;

        const endDate =
          (this.state.tasksCompletedDateRange?.length ?? 0) === 2
            ? format(this.state.tasksCompletedDateRange[1], "yyyy-MM-dd")
            : null;

        const reviewStart =
          (this.state.tasksReviewedDateRange?.length ?? 0) === 2
            ? format(this.state.tasksReviewedDateRange[0], "yyyy-MM-dd")
            : null;

        const reviewEnd =
          (this.state.tasksReviewedDateRange?.length ?? 0) === 2
            ? format(this.state.tasksReviewedDateRange[1], "yyyy-MM-dd")
            : null;

        const reviewerStart =
          (this.state.tasksReviewerDateRange?.length ?? 0) === 2
            ? format(this.state.tasksReviewerDateRange[0], "yyyy-MM-dd")
            : null;

        const reviewerEnd =
          (this.state.tasksReviewerDateRange?.length ?? 0) === 2
            ? format(this.state.tasksReviewerDateRange[1], "yyyy-MM-dd")
            : null;

        const metrics = await fetchUserMetrics(
          this.props[userProp].id,
          this.state.tasksCompletedMonthsPast,
          this.state.tasksReviewedMonthsPast,
          this.state.tasksReviewerMonthsPast,
          startDate,
          endDate,
          reviewStart,
          reviewEnd,
          reviewerStart,
          reviewerEnd,
        );

        this.setState({
          taskMetrics: metrics.tasks,
          reviewMetrics: metrics.reviewTasks,
          reviewerMetrics: metrics.asReviewerTasks,
        });
      }
    }

    setTasksCompletedMonthsPast = (monthsPast) => {
      if (this.state.tasksCompletedMonthsPast !== monthsPast) {
        this.setState({
          tasksCompletedMonthsPast: monthsPast,
          tasksCompletedDateRange: [],
        });
      }
    };

    setTasksCompletedDateRange = (startDate, endDate) => {
      this.setState({
        tasksCompletedDateRange: [startDate, endDate],
        tasksCompletedMonthsPast: CUSTOM_RANGE,
      });
    };

    setTasksReviewedMonthsPast = (monthsPast) => {
      if (this.state.tasksReviewedMonthsPast !== monthsPast) {
        this.setState({
          tasksReviewedMonthsPast: monthsPast,
          tasksReviewedDateRange: [],
        });
      }
    };

    setTasksReviewedDateRange = (startDate, endDate) => {
      this.setState({
        tasksReviewedDateRange: [startDate, endDate],
        tasksReviewedMonthsPast: CUSTOM_RANGE,
      });
    };

    setTasksReviewerMonthsPast = (monthsPast) => {
      if (this.state.tasksReviewerMonthsPast !== monthsPast) {
        this.setState({
          tasksReviewerMonthsPast: monthsPast,
          tasksReviewerDateRange: [],
        });
      }
    };

    setTasksReviewerDateRange = (startDate, endDate) => {
      this.setState({
        tasksReviewerDateRange: [startDate, endDate],
        tasksReviewerMonthsPast: CUSTOM_RANGE,
      });
    };

    componentDidMount() {
      this.updateAllMetrics();
    }

    componentDidUpdate(prevProps, prevState) {
      const scoreChanged = prevProps[userProp]?.score !== this.props[userProp]?.score;
      const {
        tasksCompletedMonthsPast,
        tasksReviewedMonthsPast,
        tasksReviewerMonthsPast,
        tasksCompletedDateRange,
        tasksReviewedDateRange,
        tasksReviewerDateRange,
      } = this.state;

      if (scoreChanged) {
        this.updateAllMetrics();
      } else if (
        tasksReviewedMonthsPast !== CUSTOM_RANGE &&
        (prevState.tasksCompletedMonthsPast !== tasksCompletedMonthsPast ||
          prevState.tasksReviewedMonthsPast !== tasksReviewedMonthsPast ||
          prevState.tasksReviewerMonthsPast !== tasksReviewerMonthsPast)
      ) {
        this.updateUserMetrics();
      } else if (
        tasksCompletedMonthsPast === CUSTOM_RANGE &&
        (prevState.tasksCompletedDateRange !== tasksCompletedDateRange ||
          prevState.tasksReviewedDateRange !== tasksReviewedDateRange ||
          prevState.tasksReviewerDateRange !== tasksReviewerDateRange)
      ) {
        this.updateUserMetrics();
      }
    }

    render() {
      return (
        <WrappedComponent
          leaderboardMetrics={this.state.leaderboardMetrics}
          taskMetrics={this.state.taskMetrics}
          reviewMetrics={this.state.reviewMetrics}
          reviewerMetrics={this.state.reviewerMetrics}
          tasksCompletedMonthsPast={this.state.tasksCompletedMonthsPast}
          setTasksCompletedMonthsPast={this.setTasksCompletedMonthsPast}
          setTasksCompletedDateRange={this.setTasksCompletedDateRange}
          tasksReviewedMonthsPast={this.state.tasksReviewedMonthsPast}
          setTasksReviewedMonthsPast={this.setTasksReviewedMonthsPast}
          setTasksReviewedDateRange={this.setTasksReviewedDateRange}
          tasksReviewerMonthsPast={this.state.tasksReviewerMonthsPast}
          setTasksReviewerMonthsPast={this.setTasksReviewerMonthsPast}
          setTasksReviewerDateRange={this.setTasksReviewerDateRange}
          loading={this.state.loading}
          {..._omit(this.props, ["updateLeaderboardMetrics", "fetchLeaderboardForUser"])}
        />
      );
    }
  };
};

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchLeaderboardForUser }, dispatch);

export default (WrappedComponent, userProp = "targetUser") =>
  connect(mapStateToProps, mapDispatchToProps)(WithUserMetrics(WrappedComponent, userProp));
