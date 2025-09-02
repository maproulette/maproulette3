import _isEmpty from "lodash/isEmpty";
import _omit from "lodash/omit";
import _reverse from "lodash/reverse";
import _sortBy from "lodash/sortBy";
import _toLower from "lodash/toLower";
import PropTypes from "prop-types";
import { Component } from "react";
import { SORT_CREATED, SORT_NAME, SORT_OLDEST, SORT_SCORE } from "../../services/Search/Search";

export const sortUsers = function (props, usersProp = "users") {
  const sortCriteria = props.searchSort?.sortBy;
  let sortedUsers = props[usersProp];
  if (sortCriteria === SORT_NAME) {
    sortedUsers = _sortBy(sortedUsers, (u) => _toLower(u.name));
  } else if (sortCriteria === SORT_CREATED) {
    sortedUsers = _reverse(_sortBy(sortedUsers, (u) => (u.created ? u.created : "")));
  } else if (sortCriteria === SORT_OLDEST) {
    sortedUsers = _sortBy(sortedUsers, (u) => (u.created ? u.created : ""));
  } else if (sortCriteria === SORT_SCORE) {
    sortedUsers = _sortBy(sortedUsers, (u) => (u.score ? u.score : ""));
  }
  return sortedUsers;
};

export default function (WrappedComponent, usersProp = "users", outputProp) {
  class WithSortedUsers extends Component {
    render() {
      const sortedUsers = sortUsers(this.props, usersProp);

      if (_isEmpty(outputProp)) {
        outputProp = usersProp;
      }

      return (
        <WrappedComponent {...{ [outputProp]: sortedUsers }} {..._omit(this.props, outputProp)} />
      );
    }
  }

  WithSortedUsers.propTypes = {
    users: PropTypes.array,
  };

  return WithSortedUsers;
}
