import _findIndex from "lodash/findIndex";
import _isEmpty from "lodash/isEmpty";
import _omit from "lodash/omit";
import _reverse from "lodash/reverse";
import _sortBy from "lodash/sortBy";
import _toLower from "lodash/toLower";
import PropTypes from "prop-types";
import { Component } from "react";
import { isCooperative } from "../../../services/Challenge/CooperativeType/CooperativeType";
import {
  SORT_COMPLETION,
  SORT_COOPERATIVE_WORK,
  SORT_CREATED,
  SORT_NAME,
  SORT_OLDEST,
  SORT_POPULARITY,
  SORT_TASKS_REMAINING,
} from "../../../services/Search/Search";
import WithChallengeSearch from "../WithSearch/WithChallengeSearch";

const FEATURED_POINTS = -1;
const SAVED_POINTS = -2;

export const sortChallenges = function (props, challengesProp = "challenges", config) {
  const sortCriteria = props.searchSort?.sortBy;
  let sortedChallenges = props[challengesProp];

  if (sortCriteria === SORT_NAME) {
    sortedChallenges = _sortBy(sortedChallenges, (c) => _toLower(c.name));
  } else if (sortCriteria === SORT_CREATED) {
    sortedChallenges = _reverse(_sortBy(sortedChallenges, (c) => (c.created ? c.created : "")));
  } else if (sortCriteria === SORT_OLDEST) {
    sortedChallenges = _sortBy(sortedChallenges, (c) => (c.created ? c.created : ""));
  } else if (sortCriteria === SORT_COMPLETION) {
    if (!config?.frontendSearch) {
      sortedChallenges = sortedChallenges.filter(
        (challenge) => challenge.completionPercentage !== 100,
      );
    }
    sortedChallenges = _reverse(
      _sortBy(sortedChallenges, (c) => (c.completionPercentage ? c.completionPercentage : "")),
    );
  } else if (sortCriteria === SORT_TASKS_REMAINING) {
    sortedChallenges = sortedChallenges.filter((challenge) => challenge.tasksRemaining !== 0);
    sortedChallenges = _sortBy(sortedChallenges, (c) => (c.tasksRemaining ? c.tasksRemaining : ""));
  } else if (sortCriteria === SORT_POPULARITY) {
    sortedChallenges = _reverse(
      _sortBy(sortedChallenges, (c) => (Number.isFinite(c.popularity) ? c.popularity : 0)),
    );
  } else if (sortCriteria === SORT_COOPERATIVE_WORK) {
    sortedChallenges = _sortBy(sortedChallenges, (c) => (isCooperative(c.cooperativeType) ? 0 : 1));
  } else {
    // default sort. Prioritizes featured and user-saved challenges,
    // followed by popular challenges
    const savedChallenges = props.user?.savedChallenges ?? [];

    sortedChallenges = _sortBy(sortedChallenges, [
      (challenge) => {
        let score = 0;
        score += challenge.featured ? FEATURED_POINTS : 0;
        score += _findIndex(savedChallenges, { id: challenge.id }) !== -1 ? SAVED_POINTS : 0;
        return score;
      },
      (challenge) => -1 * challenge.popularity,
    ]);
  }

  return sortedChallenges;
};

export default function (WrappedComponent, challengesProp = "challenges", outputProp, config) {
  class WithSortedChallenges extends Component {
    render() {
      const sortedChallenges = sortChallenges(this.props, challengesProp, config);

      if (_isEmpty(outputProp)) {
        outputProp = challengesProp;
      }

      return (
        <WrappedComponent
          {...{ [outputProp]: sortedChallenges }}
          {..._omit(this.props, outputProp)}
        />
      );
    }
  }

  WithSortedChallenges.propTypes = {
    user: PropTypes.object,
    challenges: PropTypes.array,
  };

  return WithChallengeSearch(WithSortedChallenges, config);
}
