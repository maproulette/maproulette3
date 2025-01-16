import _keys from "lodash/keys";
import _merge from "lodash/merge";
import _omit from "lodash/omit";
import _pickBy from "lodash/pickBy";
import { Component } from "react";
import { connect } from "react-redux";
import { fetchTagMetrics } from "../../../../services/Challenge/Challenge";
import WithCurrentUser from "../../../HOCs/WithCurrentUser/WithCurrentUser";

/**
 * WithChallengeTagMetrics retrieves tag metrics for the challenge tasks
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithChallengeTagMetrics = function (WrappedComponent) {
  return class extends Component {
    state = {
      loading: false,
    };

    updateMetrics(props) {
      this.setState({ loading: true });

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
      if (props.includeTaskPriorities) {
        criteria.filters.priorities = _keys(_pickBy(props.includeTaskPriorities, (v) => v)).join(
          ",",
        );
      }

      props.updateTagMetrics(props.user?.id, criteria).then((entity) => {
        this.setState({ loading: false, tagMetrics: entity });
      });
    }

    componentDidMount() {
      this.updateMetrics(this.props);
    }

    componentDidUpdate(prevProps) {
      if (prevProps.challenge?.id !== this.props.challenge?.id) {
        return this.updateMetrics(this.props);
      }

      if (this.props.includeTaskStatuses !== prevProps.includeTaskStatuses) {
        return this.updateMetrics(this.props);
      }

      if (this.props.includeTaskReviewStatuses !== prevProps.includeTaskReviewStatuses) {
        return this.updateMetrics(this.props);
      }

      if (this.props.includeMetaReviewStatuses !== prevProps.includeMetaReviewStatuses) {
        return this.updateMetrics(this.props);
      }

      if (this.props.includeTaskPriorities !== prevProps.includeTaskPriorities) {
        return this.updateMetrics(this.props);
      }

      if (this.props.searchFilters?.filters !== prevProps.searchFilters?.filters) {
        return this.updateMetrics(this.props);
      }
    }

    render() {
      return (
        <WrappedComponent
          tagMetrics={this.state.tagMetrics}
          totalTasks={this.props.filteredClusteredTasks?.totalCount}
          loading={this.state.loading}
          {..._omit(this.props, ["updateTagMetrics"])}
        />
      );
    }
  };
};

const mapDispatchToProps = (dispatch) => ({
  updateTagMetrics: (userId, criteria) => {
    return dispatch(fetchTagMetrics(userId, criteria));
  },
});

export default (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WithCurrentUser(WithChallengeTagMetrics(WrappedComponent)));
