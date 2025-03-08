import _cloneDeep from "lodash/cloneDeep";
import _omit from "lodash/omit";
import _values from "lodash/values";
import PropTypes from "prop-types";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  ReviewTasksType,
  fetchReviewChallenges,
} from "../../../services/Task/TaskReview/TaskReview";
import { TaskStatus } from "../../../services/Task/TaskStatus/TaskStatus";

/**
 * WithReviewChallenges - Will fetch a list of challenges and projects
 * associated with reviews
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewChallenges = function (WrappedComponent) {
  class _WithReviewChallenges extends Component {
    componentIsMounted = false;

    state = {
      reviewChallenges: {},
    };

    /**
     * Kick off loading of challenges that have review tasks
     *
     * @private
     */
    updateReviewChallenges = (reviewTasksType, projectSearch, challengeSearch) => {
      const reviewChallenges = _cloneDeep(this.state.reviewChallenges);
      reviewChallenges[reviewTasksType] = {
        ...reviewChallenges[reviewTasksType],
        loading: true,
      };
      this.setState({ reviewChallenges });

      const includeStatuses =
        reviewTasksType === ReviewTasksType.toBeReviewed ? [TaskStatus.fixed] : null;

      this.props
        .fetchReviewChallenges(
          reviewTasksType,
          includeStatuses,
          true,
          projectSearch,
          challengeSearch,
          20,
        )
        .then((challenges) => {
          const loadedChallenges = _cloneDeep(this.state.reviewChallenges);
          loadedChallenges[reviewTasksType] = {
            loading: false,
            challenges: _values(challenges?.entities?.challenges),
          };

          if (this.componentIsMounted) {
            this.setState({ reviewChallenges: loadedChallenges });
          }
        });
    };

    componentDidMount() {
      this.componentIsMounted = true;
      this.updateReviewChallenges(this.props.reviewTasksType, null, null);
    }

    componentDidUpdate(prevProps) {
      const reviewTasksType = this.props.reviewTasksType;

      // Only update if the reviewTasksType has changed
      if (
        reviewTasksType !== prevProps.reviewTasksType &&
        !this.state.reviewChallenges[reviewTasksType]?.challenges &&
        !this.state.reviewChallenges[reviewTasksType]?.loading
      ) {
        this.updateReviewChallenges(
          reviewTasksType,
          this.props.projectSearch,
          this.props.challengeSearch,
        );
      }
    }

    componentWillUnmount() {
      this.componentIsMounted = false;
    }

    render() {
      return (
        <WrappedComponent
          {..._omit(this.props, ["fetchReviewChallenges"])}
          updateReviewChallenges={this.updateReviewChallenges}
          challenges={this.state.reviewChallenges[this.props.reviewTasksType]?.challenges}
        />
      );
    }
  }

  _WithReviewChallenges.propTypes = {
    fetchReviewChallenges: PropTypes.func.isRequired,
  };

  return _WithReviewChallenges;
};

export const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchReviewChallenges }, dispatch);

export default (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WithReviewChallenges(WrappedComponent));
