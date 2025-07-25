import { format } from "date-fns";
import _cloneDeep from "lodash/cloneDeep";
import _filter from "lodash/filter";
import _isEqual from "lodash/isEqual";
import _merge from "lodash/merge";
import _omit from "lodash/omit";
import { Component } from "react";
import { connect } from "react-redux";
import AppErrors from "../../../services/Error/AppErrors";
import { addError } from "../../../services/Error/Error";
import {
  buildSearchCriteria,
  buildSearchURL,
} from "../../../services/SearchCriteria/SearchCriteria";
import { ReviewTasksType } from "../../../services/Task/TaskReview/TaskReview";
import {
  fetchReviewChallenges,
  loadNextReviewTask,
} from "../../../services/Task/TaskReview/TaskReview";
import { fetchReviewNeededTasks } from "../../../services/Task/TaskReview/TaskReviewNeeded";
import { fetchReviewedTasks } from "../../../services/Task/TaskReview/TaskReviewed";
import { TaskStatus } from "../../../services/Task/TaskStatus/TaskStatus";
import WithCurrentUser from "../WithCurrentUser/WithCurrentUser";

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_CRITERIA = {
  sortCriteria: { sortBy: "mappedOn", direction: "ASC" },
  pageSize: DEFAULT_PAGE_SIZE,
  invertFields: {},
};

/**
 * WithReviewTasks retrieves tasks that need to be Reviewed
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export const WithReviewTasks = function (WrappedComponent) {
  return class extends Component {
    state = {
      loading: false,
      criteria: {},
      pageSize: DEFAULT_PAGE_SIZE,
    };

    buildDefaultCriteria(props) {
      return _merge({}, DEFAULT_CRITERIA, props.defaultFilters);
    }

    refresh = () => {
      this.update(this.props, this.state.criteria[this.props.reviewTasksType], true);
    };

    changePageSize = (pageSize) => {
      const typedCriteria = _cloneDeep(this.state.criteria);
      typedCriteria[this.props.reviewTasksType].pageSize = pageSize;
      this.setState({ criteria: typedCriteria });
    };

    setFiltered = (column, value) => {
      const typedCriteria = _cloneDeep(this.state.criteria);
      typedCriteria[this.props.reviewTasksType].filters[column] = value;
      this.setState({ criteria: typedCriteria });
    };

    invertField = (fieldName) => {
      const typedCriteria = _cloneDeep(this.state.criteria);
      typedCriteria[this.props.reviewTasksType].invertFields =
        typedCriteria[this.props.reviewTasksType].invertFields || {};
      typedCriteria[this.props.reviewTasksType].invertFields[fieldName] =
        !typedCriteria[this.props.reviewTasksType].invertFields[fieldName];

      this.setState({ criteria: typedCriteria });
      this.update(this.props, typedCriteria[this.props.reviewTasksType]);
    };

    update(props, criteria, skipURLUpdate = false) {
      const searchOnCriteria = _cloneDeep(criteria);
      const userId = props.user?.id;
      const pageSize =
        criteria?.pageSize ||
        this.state.criteria[props.reviewTasksType]?.pageSize ||
        DEFAULT_PAGE_SIZE;

      if (!criteria.invertFields) {
        searchOnCriteria.invertFields = this.state.criteria[props.reviewTasksType].invertFields;
      }

      if (searchOnCriteria.savedChallengesOnly === undefined) {
        searchOnCriteria.savedChallengesOnly =
          this.state.criteria[this.props.reviewTasksType]?.savedChallengesOnly;
      }
      if (searchOnCriteria.excludeOtherReviewers === undefined) {
        // Exclude reviews assigned to other reviewers by default
        searchOnCriteria.excludeOtherReviewers =
          this.state.criteria[this.props.reviewTasksType]?.excludeOtherReviewers ?? true;
      }

      // We need to update our list of challenges since some challenges may
      // have been excluded on initial fetch because the list was limited to
      // taskStatus 'fixed' and 'excludeOtherReviewers' by default.
      if (
        searchOnCriteria.excludeOtherReviewers === false ||
        searchOnCriteria?.filters?.status !==
          this.state.criteria[this.props.reviewTasksType]?.filters?.status
      ) {
        this.props.updateReviewChallenges(this.props.reviewTasksType);
      }

      const typedCriteria = _cloneDeep(this.state.criteria);
      typedCriteria[props.reviewTasksType] = searchOnCriteria;
      typedCriteria[props.reviewTasksType].pageSize = pageSize;

      const searchURL = this.updateURL(props, searchOnCriteria);

      // If our search on the URL hasn't changed then don't do another
      // update as we receive a second update when we change the URL.
      if (_isEqual(props.history.location.search, searchURL) && this.state.loading) {
        return;
      }

      if (!skipURLUpdate) {
        props.history.push({
          pathname: props.history.location.pathname,
          search: searchURL,
        });
      }

      this.setState({ loading: true, criteria: typedCriteria });

      switch (props.reviewTasksType) {
        case ReviewTasksType.reviewedByMe:
          const asMetaReviewer = props.reviewTasksSubType === "meta-reviewer";
          return props
            .updateUserReviewedTasks(userId, searchOnCriteria, pageSize, asMetaReviewer)
            .then(() => {
              this.setState({ loading: false });
            });
        case ReviewTasksType.toBeReviewed:
          return props.updateReviewNeededTasks(searchOnCriteria, pageSize).then(() => {
            this.setState({ loading: false });
          });
        case ReviewTasksType.allReviewedTasks:
          return props.updateReviewedTasks(userId, searchOnCriteria, pageSize).then(() => {
            this.setState({ loading: false });
          });
        case ReviewTasksType.metaReviewTasks:
          return props.updateReviewedTasks(userId, searchOnCriteria, pageSize, true).then(() => {
            this.setState({ loading: false });
          });
        case ReviewTasksType.myReviewedTasks:
        default:
          return props.updateMapperReviewedTasks(userId, searchOnCriteria, pageSize).then(() => {
            this.setState({ loading: false });
          });
      }
    }

    clearCriteria = () => {
      this.props.clearFilters();
    };

    updateURL(props, criteria) {
      let searchCriteria = _merge({ filters: {} }, criteria);

      if (
        searchCriteria.filters.reviewedAt &&
        typeof searchCriteria.filters.reviewedAt === "object"
      ) {
        searchCriteria.filters.reviewedAt = format(searchCriteria.filters.reviewedAt, "yyyy-MM-dd");
      }

      if (searchCriteria.filters.mappedOn && typeof searchCriteria.filters.mappedOn === "object") {
        searchCriteria.filters.mappedOn = format(searchCriteria.filters.mappedOn, "yyyy-MM-dd");
      }

      // The criteria filters use 'project' but on the url it can also be
      // referenced as 'projectName'
      if (criteria?.filters?.project == null) {
        _omit(searchCriteria, "filters.projectName");
      }

      // The criteria filters use 'challenge' but on the url it can also be
      // referenced as 'challengeName'
      if (criteria?.filters?.challenge == null) {
        _omit(searchCriteria.filters, "challengeName");
      }

      return buildSearchURL(searchCriteria);
    }

    componentDidMount() {
      const searchParams = this.props.history.location.search;
      const criteria = buildSearchCriteria(searchParams, this.buildDefaultCriteria(this.props));

      let pageSize = criteria.pageSize || DEFAULT_PAGE_SIZE;
      criteria.pageSize = pageSize;

      const stateCriteria = this.state.criteria;
      stateCriteria[this.props.reviewTasksType] = criteria;
      if (this.props.reviewTasksType === ReviewTasksType.toBeReviewed) {
        stateCriteria[this.props.reviewTasksType].filters = _merge(
          { status: TaskStatus.fixed },
          stateCriteria[this.props.reviewTasksType].filters,
        );
      }
      this.setState({ criteria: stateCriteria });
    }

    componentDidUpdate(prevProps) {
      if (
        prevProps.reviewTasksType !== this.props.reviewTasksType ||
        prevProps.reviewTasksSubType !== this.props.reviewTasksSubType
      ) {
        this.update(
          this.props,
          this.state.criteria[this.props.reviewTasksType] || this.buildDefaultCriteria(this.props),
          true,
        );
        return;
      }

      if (!_isEqual(this.props.defaultFilters, prevProps.defaultFilters)) {
        this.update(this.props, this.buildDefaultCriteria(this.props), true);
        return;
      }
    }

    render() {
      let reviewData = null;

      switch (this.props.reviewTasksType) {
        case ReviewTasksType.reviewedByMe:
          reviewData = this.props.currentReviewTasks.reviewedByUser;
          break;
        case ReviewTasksType.toBeReviewed:
          reviewData = this.props.currentReviewTasks.reviewNeeded;
          break;
        case ReviewTasksType.allReviewedTasks:
          reviewData = this.props.currentReviewTasks.reviewed;
          break;
        case ReviewTasksType.metaReviewTasks:
          reviewData = this.props.currentReviewTasks.reviewed;
          break;
        case ReviewTasksType.myReviewedTasks:
        default:
          reviewData = this.props.currentReviewTasks.mapperReviewed;
          break;
      }

      const criteria =
        this.state.criteria[this.props.reviewTasksType] || this.buildDefaultCriteria(this.props);
      const projectId = this.state.criteria[this.props.reviewTasksType]?.filters?.projectId;

      // Filter available challenges to ones in selected project if applicable
      const reviewChallenges = !projectId
        ? this.props.currentReviewTasks.reviewChallenges
        : _filter(this.props.currentReviewTasks.reviewChallenges, (c) => c.parent === projectId);

      return (
        <WrappedComponent
          reviewData={reviewData}
          updateReviewTasks={(criteria) => this.update(this.props, criteria)}
          refresh={this.refresh}
          reviewCriteria={criteria}
          clearFilterCriteria={this.clearCriteria}
          pageSize={criteria.pageSize}
          changePageSize={this.changePageSize}
          setFiltered={this.setFiltered}
          startReviewing={(url, asMetaReview = false) =>
            this.props.startNextReviewTask(criteria, url, criteria.pageSize, asMetaReview)
          }
          loading={this.state.loading}
          reviewChallenges={reviewChallenges}
          reviewProjects={this.props.currentReviewTasks.reviewProjects}
          invertField={this.invertField}
          {..._omit(this.props, ["updateReviewTasks"])}
        />
      );
    }
  };
};

const mapStateToProps = (state) => ({ currentReviewTasks: state.currentReviewTasks });

const mapDispatchToProps = (dispatch) => ({
  updateReviewNeededTasks: (searchCriteria = {}, pageSize = DEFAULT_PAGE_SIZE) => {
    return dispatch(fetchReviewNeededTasks(searchCriteria, pageSize));
  },
  updateReviewedTasks: (
    userId,
    searchCriteria = {},
    pageSize = DEFAULT_PAGE_SIZE,
    asMetaReview = false,
  ) => {
    return dispatch(
      fetchReviewedTasks(userId, searchCriteria, false, false, false, pageSize, asMetaReview),
    );
  },
  updateMapperReviewedTasks: (userId, searchCriteria = {}, pageSize = DEFAULT_PAGE_SIZE) => {
    return dispatch(fetchReviewedTasks(userId, searchCriteria, false, true, false, pageSize));
  },
  updateUserReviewedTasks: (
    userId,
    searchCriteria = {},
    pageSize = DEFAULT_PAGE_SIZE,
    asMetaReviewer,
  ) => {
    return dispatch(
      fetchReviewedTasks(userId, searchCriteria, !asMetaReviewer, false, asMetaReviewer, pageSize),
    );
  },

  updateReviewChallenges: (reviewTasksType) => {
    return dispatch(fetchReviewChallenges(reviewTasksType, null, false));
  },

  startNextReviewTask: (searchCriteria = {}, url, pageSize, asMetaReview) => {
    const reviewType = asMetaReview ? "meta-review" : "review";
    dispatch(loadNextReviewTask(searchCriteria, null, asMetaReview))
      .then((task) => {
        const searchParams = _cloneDeep(searchCriteria);
        searchParams.pageSize = pageSize;
        url.push(`/challenge/${task.parent}/task/${task.id}/${reviewType}`, searchParams);
      })
      .catch((error) => {
        console.log(error);
        dispatch(addError(AppErrors.reviewTask.fetchFailure));
        url.push(`/${reviewType}`, searchCriteria);
      });
  },
});

export default (WrappedComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(WithCurrentUser(WithReviewTasks(WrappedComponent)));
