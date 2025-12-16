import { format } from "date-fns";
import _cloneDeep from "lodash/cloneDeep";
import _debounce from "lodash/debounce";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _keys from "lodash/keys";
import _merge from "lodash/merge";
import _omit from "lodash/omit";
import _pickBy from "lodash/pickBy";
import _toInteger from "lodash/toInteger";
import { Component } from "react";
import { fromLatLngBounds } from "../../../services/MapBounds/MapBounds";
import {
  buildSearchCriteriafromURL,
  buildSearchURL,
} from "../../../services/SearchCriteria/SearchCriteria";

export const DEFAULT_PAGE_SIZE = 20;

export const DEFAULT_CRITERIA = {
  sortCriteria: { sortBy: "name", direction: "DESC" },
  pageSize: DEFAULT_PAGE_SIZE,
  filters: {
    status: [0, 1, 2, 3, 4, 5, 6, 9],
    priorities: [0, 1, 2],
    reviewStatus: [0, 1, 2, 3, 4, 5, 6, 7, -1],
    metaReviewStatus: [0, 1, 2, 3, 5, 6, 7, -2, -1],
  },
  invertFields: {},
};

/**
 * Parse a criteria string (URL search params) into a criteria object.
 * Shared utility for both HOC and hook implementations.
 *
 * @param {string} criteriaString - The URL search string to parse
 * @returns {Object|null} - The parsed criteria object or null
 */
export const parseCriteriaString = (criteriaString) => {
  if (!criteriaString) return null;

  const criteria = buildSearchCriteriafromURL(criteriaString);
  if (!criteria) return null;

  const keysToSplit = ["status", "reviewStatus", "metaReviewStatus", "priorities", "boundingBox"];

  for (const key of keysToSplit) {
    if (criteria[key] !== undefined && key === "boundingBox") {
      if (typeof criteria[key] === "string") {
        criteria[key] = criteria[key].split(",").map((x) => parseFloat(x));
      }
    } else if (criteria?.filters?.[key] !== undefined) {
      if (typeof criteria.filters[key] === "string") {
        criteria.filters[key] = criteria.filters[key].split(",").map((x) => _toInteger(x));
      }
    }
  }

  return criteria;
};

/**
 * Build included filters from props.
 * Shared utility for both HOC and hook implementations.
 * Only includes filter values if the corresponding props exist,
 * otherwise returns empty object to preserve defaults.
 */
export const buildIncludedFilters = (props) => {
  const filters = {};

  if (props.includeTaskStatuses) {
    filters.status = _keys(_pickBy(props.includeTaskStatuses, (s) => s));
  }
  if (props.includeTaskReviewStatuses) {
    filters.reviewStatus = _keys(_pickBy(props.includeTaskReviewStatuses, (r) => r));
  }
  if (props.includeMetaReviewStatuses) {
    filters.metaReviewStatus = _keys(_pickBy(props.includeMetaReviewStatuses, (r) => r));
  }
  if (props.includeTaskPriorities) {
    filters.priorities = _keys(_pickBy(props.includeTaskPriorities, (p) => p));
  }

  return filters;
};

/**
 * WithFilterCriteria keeps track of the current criteria being used
 * to filter, sort and page the tasks. If a use case requires user app settings for
 * saving and loading filters, the 'usePersistedFilters' prop must be true and the correct
 * setting name provided via the 'savedFilterSettingName' prop.
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export default function WithFilterCriteria(
  WrappedComponent,
  ignoreURL = true,
  ignoreLocked = true,
  usePersistedFilters = false,
  savedFilterSettingName = undefined,
) {
  return class extends Component {
    state = {
      loading: false,
      criteria: DEFAULT_CRITERIA,
      pageSize: DEFAULT_PAGE_SIZE,
      bundledOnly: true,
    };

    updateCriteria = (newCriteria) => {
      this.setState(
        (prevState) => {
          const criteria = _cloneDeep(prevState.criteria);

          if (newCriteria.sortCriteria !== undefined) {
            criteria.sortCriteria = newCriteria.sortCriteria;
          }
          if (newCriteria.page !== undefined) {
            criteria.page = newCriteria.page;
          }
          if (newCriteria.includeTags !== undefined) {
            criteria.includeTags = newCriteria.includeTags;
          }

          if (newCriteria.filters && typeof newCriteria.filters === "object") {
            criteria.filters = { ...criteria.filters, ...newCriteria.filters };
          }

          return { criteria };
        },
        () => {
          if (this.props.setSearchFilters) {
            this.props.setSearchFilters(this.state.criteria);
          }
        },
      );
    };

    updateTaskFilterBounds = (bounds, zoom) => {
      const newCriteria = _cloneDeep(this.state.criteria);
      newCriteria.boundingBox = fromLatLngBounds(bounds);
      newCriteria.zoom = zoom;
      this.setState({ criteria: newCriteria });
    };

    updateTaskPropertyCriteria = (propertySearch) => {
      const criteria = _cloneDeep(this.state.criteria);
      criteria.filters.taskPropertySearch = propertySearch;
      this.setState({ criteria });
    };

    invertField = (fieldName) => {
      const criteria = _cloneDeep(this.state.criteria);
      criteria.invertFields = criteria.invertFields || {};
      criteria.invertFields[fieldName] = !criteria.invertFields[fieldName];
      this.setState({ criteria });
      if (this.props.setSearchFilters) {
        this.props.setSearchFilters(criteria);
      }
    };

    clearTaskPropertyCriteria = () => {
      const criteria = _cloneDeep(this.state.criteria);
      criteria.filters.taskPropertySearch = null;
      this.setState({ criteria });
    };

    clearAllFilters = () => {
      if (this.props.clearAllFilters) {
        this.props.clearAllFilters();
      }

      const newCriteria = _cloneDeep(DEFAULT_CRITERIA);
      newCriteria.boundingBox = usePersistedFilters ? this.state.criteria.boundingBox : null;
      newCriteria.zoom = this.state.zoom;

      if (!ignoreURL) {
        this.props.history.push({
          pathname: this.props.history.location.pathname,
          search: "",
          state: {},
        });
      }

      this.setState({ criteria: newCriteria, loading: true });
    };

    changePageSize = (pageSize) => {
      const typedCriteria = _cloneDeep(this.state.criteria);
      typedCriteria.pageSize = pageSize;
      this.setState({ criteria: typedCriteria });
    };

    setFiltered = (column, value) => {
      const typedCriteria = _cloneDeep(this.state.criteria);
      typedCriteria.filters[column] = value;

      //Reset Page so it goes back to 0
      typedCriteria.page = 0;
      this.setState({ criteria: typedCriteria });
    };

    updateIncludedFilters(props, criteria = {}) {
      const includedFilters = buildIncludedFilters(props);

      this.setState((prevState) => {
        const typedCriteria = _merge({}, criteria, _cloneDeep(prevState.criteria));
        typedCriteria.filters = { ...typedCriteria.filters, ...includedFilters };
        typedCriteria.page = 0;
        return { criteria: typedCriteria };
      });

      const typedCriteria = _merge({}, criteria, _cloneDeep(this.state.criteria));
      typedCriteria.filters = { ...typedCriteria.filters, ...includedFilters };
      return typedCriteria;
    }

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

      return buildSearchURL(searchCriteria);
    }

    refreshTasks = (typedCriteria) => {
      const challengeId = this.props.challenge?.id || this.props.challengeId;

      if (!ignoreURL) {
        const searchURL = this.updateURL(this.props, typedCriteria);
        // If our search on the URL hasn't changed then don't do another
        // update as we could receive a second update when we change the URL.
        if (_isEqual(this.props.history.location.search, searchURL) && this.state.loading) {
          return;
        }
        this.props.history.push({
          pathname: this.props.history.location.pathname,
          search: searchURL,
        });
      }

      this.setState({ loading: true });

      const criteria = typedCriteria || _cloneDeep(this.state.criteria);

      if (!criteria.boundingBox && this.props.challenge?.bounding) {
        try {
          const bounding = this.props.challenge.bounding;
          if (bounding.bbox) {
            criteria.boundingBox = bounding.bbox;
          } else if (bounding.coordinates) {
            const coords = bounding.coordinates.flat(3);
            const lngs = coords.filter((_, i) => i % 2 === 0);
            const lats = coords.filter((_, i) => i % 2 === 1);
            criteria.boundingBox = [
              Math.min(...lngs),
              Math.min(...lats),
              Math.max(...lngs),
              Math.max(...lats),
            ];
          }
        } catch (e) {
          console.warn("Could not extract bounding box from challenge:", e);
        }
      }

      if (this.props.includeTaskStatuses) {
        criteria.filters.status = _keys(_pickBy(this.props.includeTaskStatuses, (s) => s));
      }
      if (this.props.includeTaskPriorities) {
        criteria.filters.priorities = _keys(_pickBy(this.props.includeTaskPriorities, (p) => p));
      }
      if (this.props.includeTaskReviewStatuses) {
        criteria.filters.reviewStatus = _keys(
          _pickBy(this.props.includeTaskReviewStatuses, (r) => r),
        );
      }
      if (this.props.includeMetaReviewStatuses) {
        criteria.filters.metaReviewStatus = _keys(
          _pickBy(this.props.includeMetaReviewStatuses, (r) => r),
        );
      }

      criteria.filters.archived = true;

      this.debouncedTasksFetch(challengeId, criteria, this.state.criteria.pageSize);
    };

    debouncedTasksFetch = _debounce((challengeId, criteria, pageSize) => {
      this.props
        .augmentClusteredTasks(challengeId, false, criteria, pageSize, false, ignoreLocked)
        .then(() => {
          this.setState({ loading: false });
        });
    }, 800);

    updateCriteriaFromURL(props) {
      const criteria = props.history.location.search
        ? parseCriteriaString(props.history.location.search)
        : _cloneDeep(props.history.location.state);

      if (!criteria?.filters?.status) {
        this.updateIncludedFilters(props);
      } else {
        this.setState({ criteria });
      }
    }

    updateCriteriaFromSavedFilters(props) {
      const savedFilters =
        usePersistedFilters && savedFilterSettingName
          ? this.props.getUserAppSetting(this.props.user, savedFilterSettingName)
          : "";
      const criteria =
        savedFilters && savedFilters.length > 0
          ? parseCriteriaString(savedFilters)
          : _cloneDeep(props.history.location.state);

      if (!criteria) {
        this.updateIncludedFilters(props);
        return;
      }

      if (!criteria?.filters?.status) {
        this.updateIncludedFilters(props);
      } else {
        this.setState({ criteria });
      }
    }

    componentDidMount() {
      this.initialLoadTriggered = false;

      if (
        !ignoreURL &&
        (!_isEmpty(this.props.history.location.search) ||
          !_isEmpty(this.props.history.location.state))
      ) {
        this.updateCriteriaFromURL(this.props);
      } else if (usePersistedFilters) {
        this.updateCriteriaFromSavedFilters(this.props);
      } else {
        this.updateIncludedFilters(this.props);
      }
    }

    componentDidUpdate(prevProps, prevState) {
      const challengeId = this.props.challenge?.id || this.props.challengeId;
      const prevChallengeId = prevProps?.challenge?.id || prevProps?.challengeId;

      if (!challengeId) {
        return;
      }

      const challengeIdJustBecameAvailable = !prevChallengeId && challengeId;

      if (!ignoreURL && this.props.history.location?.state?.refresh) {
        this.props.history.push({
          pathname: this.props.history.location.pathname,
          search: this.props.history.location.search,
          state: {},
        });

        if (this.props.setupFilters) {
          this.props.setupFilters();
        }
        this.updateCriteriaFromURL(this.props);
        return;
      }

      let typedCriteria = _cloneDeep(this.state.criteria);

      const filterPropsChanged =
        prevProps.includeTaskStatuses !== this.props.includeTaskStatuses ||
        prevProps.includeTaskReviewStatuses !== this.props.includeTaskReviewStatuses ||
        prevProps.includeMetaReviewStatuses !== this.props.includeMetaReviewStatuses ||
        prevProps.includeTaskPriorities !== this.props.includeTaskPriorities;

      if (filterPropsChanged) {
        this.updateIncludedFilters(this.props);
        return;
      }

      if (!_isEqual(prevState.criteria, this.state.criteria)) {
        this.refreshTasks(typedCriteria);
      } else if (challengeIdJustBecameAvailable || challengeId !== prevChallengeId) {
        this.refreshTasks(typedCriteria);
      } else if (!this.initialLoadTriggered) {
        this.initialLoadTriggered = true;
        this.refreshTasks(typedCriteria);
      } else if (this.props.history.location?.state?.refreshAfterSave) {
        this.refreshTasks(typedCriteria);
        this.props.history.push({
          pathname: this.props.history.location.pathname,
          state: { refreshAfterSave: false },
        });
      }
    }

    render() {
      const criteria = _cloneDeep(this.state.criteria) || DEFAULT_CRITERIA;

      if (this.props.includeTaskStatuses) {
        criteria.filters.status = _keys(_pickBy(this.props.includeTaskStatuses, (s) => s));
      }
      if (this.props.includeTaskPriorities) {
        criteria.filters.priorities = _keys(_pickBy(this.props.includeTaskPriorities, (p) => p));
      }
      if (this.props.includeTaskReviewStatuses) {
        criteria.filters.reviewStatus = _keys(
          _pickBy(this.props.includeTaskReviewStatuses, (r) => r),
        );
      }
      if (this.props.includeMetaReviewStatuses) {
        criteria.filters.metaReviewStatus = _keys(
          _pickBy(this.props.includeMetaReviewStatuses, (r) => r),
        );
      }

      return (
        <WrappedComponent
          defaultPageSize={DEFAULT_PAGE_SIZE}
          updateTaskFilterBounds={this.updateTaskFilterBounds}
          updateTaskPropertyCriteria={this.updateTaskPropertyCriteria}
          clearTaskPropertyCriteria={this.clearTaskPropertyCriteria}
          invertField={this.invertField}
          criteria={criteria}
          pageSize={criteria.pageSize}
          page={criteria.page}
          changePageSize={this.changePageSize}
          setFiltered={this.setFiltered}
          loadingTasks={this.state.loading}
          updateCriteria={this.updateCriteria}
          refreshTasks={this.refreshTasks}
          clearAllFilters={this.clearAllFilters}
          bundledOnly={this.state.bundledOnly}
          setBundledOnly={(bundledOnly) => {
            this.setState({ bundledOnly });
          }}
          {..._omit(this.props, ["loadingChallenge", "clearAllFilters"])}
        />
      );
    }
  };
}
