import _keys from "lodash/keys";
import _merge from "lodash/merge";
import _omit from "lodash/omit";
import _pickBy from "lodash/pickBy";
import { Component } from "react";
import { connect } from "react-redux";
import {
  ReviewTasksType,
  fetchReviewMetrics,
} from "../../../../services/Task/TaskReview/TaskReview";
import WithCurrentUser from "../../../HOCs/WithCurrentUser/WithCurrentUser";

/**
 * WithChallengeReviewMetrics retrieves review metrics for the challenge tasks
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithChallengeReviewMetrics = function (WrappedComponent) {
  return class extends Component {
    state = {
      updateAvailable: true,
      loading: false,
    };

    updateMetrics(props) {
      this.setState({ updateAvailable: false, loading: true });

      const filters = { challengeId: props.challenge?.id };
      _merge(filters, props.searchFilters?.filters);

      const criteria = { filters };
      criteria.invertFields = props.searchCriteria?.filters?.invertFields;

      if (props.includeTaskStatuses) {
        criteria.filters.status = _keys(_pickBy(props.includeTaskStatuses, (v) => v)).join(",");
      }
      if (props.includeTaskReviewStatuses) {
        criteria.filters.reviewStatus = _keys(
          _pickBy(props.includeTaskReviewStatuses, (v) => v),
        ).join(",");
      }
      if (props.includeMetaReviewStatuses) {
        criteria.filters.metaReviewStatus = _keys(
          _pickBy(props.includeMetaReviewStatuses, (v) => v),
        ).join(",");
      }
      if (props.includeTaskPriorities) {
        criteria.filters.priorities = _keys(_pickBy(props.includeTaskPriorities, (v) => v)).join(
          ",",
        );
      }

      props.updateReviewMetrics(props.user?.id, criteria).then((entity) => {
        const reviewMetrics = entity;
        this.setState({ loading: false, reviewMetrics: reviewMetrics });
      });
    }

    componentDidUpdate(prevProps) {
      if (this.state.updateAvailable) {
        return; // nothing to do
      }

      if (prevProps.challenge?.id !== this.props.challenge?.id) {
        this.setState({ updateAvailable: true });
        return;
      }

      if (this.props.includeTaskStatuses !== prevProps.includeTaskStatuses) {
        this.setState({ updateAvailable: true });
        return;
      }

      if (this.props.includeTaskReviewStatuses !== prevProps.includeTaskReviewStatuses) {
        this.setState({ updateAvailable: true });
        return;
      }

      if (this.props.includeTaskPriorities !== prevProps.includeTaskPriorities) {
        this.setState({ updateAvailable: true });
        return;
      }

      if (this.props.searchFilters?.filters !== prevProps.searchFilters?.filters) {
        this.setState({ updateAvailable: true });
        return;
      }
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ["updateReviewMetrics"])}
          reviewMetrics={this.state.reviewMetrics || this.props.allReviewMetrics}
          metricsUpdateAvailable={this.state.updateAvailable}
          refreshMetrics={() => this.updateMetrics(this.props)}
          loading={this.state.loading}
        />
      );
    }
  };
};

const mapStateToProps = (state) => ({
  reviewMetrics: state.currentReviewTasks?.metrics?.reviewActions,
  reviewMetricsByPriority: state.currentReviewTasks?.metrics?.priorityReviewActions,
  reviewMetricsByTaskStatus: state.currentReviewTasks?.metrics?.statusReviewActions,
});

const mapDispatchToProps = (dispatch) => ({
  updateReviewMetrics: (userId, criteria) => {
    return dispatch(fetchReviewMetrics(userId, ReviewTasksType.allReviewedTasks, criteria));
  },
});

export default (WrappedComponent) =>
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(WithCurrentUser(WithChallengeReviewMetrics(WrappedComponent)));
