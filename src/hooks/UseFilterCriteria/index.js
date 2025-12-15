import { format } from "date-fns";
import _cloneDeep from "lodash/cloneDeep";
import _debounce from "lodash/debounce";
import _isEmpty from "lodash/isEmpty";
import _isEqual from "lodash/isEqual";
import _keys from "lodash/keys";
import _merge from "lodash/merge";
import _pickBy from "lodash/pickBy";
import _toInteger from "lodash/toInteger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { fromLatLngBounds } from "../../services/MapBounds/MapBounds";
import {
  buildSearchCriteriafromURL,
  buildSearchURL,
} from "../../services/SearchCriteria/SearchCriteria";

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
 * Parse a criteria string (URL search params) into a criteria object
 * @param {string} criteriaString - The URL search string to parse
 * @returns {Object|null} - The parsed criteria object or null
 */
const parseCriteriaString = (criteriaString) => {
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
 * Only includes filter values if the corresponding props exist,
 * otherwise returns empty object to preserve defaults.
 */
const buildIncludedFilters = (props) => {
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
 * Custom hook for managing filter criteria state
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.ignoreURL - Whether to ignore URL-based criteria (default: true)
 * @param {boolean} options.ignoreLocked - Whether to ignore locked tasks (default: true)
 * @param {boolean} options.usePersistedFilters - Whether to use persisted filters (default: false)
 * @param {string} options.savedFilterSettingName - The setting name for saved filters
 * @param {Object} props - Component props containing filter states and callbacks
 */
export function useFilterCriteria(options = {}, props = {}) {
  const {
    ignoreURL = true,
    ignoreLocked = true,
    usePersistedFilters = false,
    savedFilterSettingName = undefined,
  } = options;

  const history = useHistory();
  const location = useLocation();

  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [loading, setLoading] = useState(false);
  const [bundledOnly, setBundledOnly] = useState(true);

  const prevCriteriaRef = useRef(null);
  const prevChallengeIdRef = useRef(null);

  // Get challenge ID from props
  const challengeId = props.challenge?.id || props.challengeId;

  /**
   * Update criteria with new values
   */
  const updateCriteria = useCallback((newCriteria) => {
    setCriteria((prev) => {
      const updated = _cloneDeep(prev);
      updated.sortCriteria = newCriteria.sortCriteria ?? prev.sortCriteria;
      updated.page = newCriteria.page ?? prev.page;
      updated.includeTags = newCriteria.includeTags ?? prev.includeTags;

      if (newCriteria.filters && Object.keys(newCriteria.filters).length > 0) {
        updated.filters = { ...prev.filters, ...newCriteria.filters };
      }

      return updated;
    });
  }, []);

  /**
   * Update task filter bounds
   */
  const updateTaskFilterBounds = useCallback((bounds, zoom) => {
    setCriteria((prev) => ({
      ...prev,
      boundingBox: fromLatLngBounds(bounds),
      zoom,
    }));
  }, []);

  /**
   * Update task property criteria
   */
  const updateTaskPropertyCriteria = useCallback((propertySearch) => {
    setCriteria((prev) => ({
      ...prev,
      filters: { ...prev.filters, taskPropertySearch: propertySearch },
    }));
  }, []);

  /**
   * Invert a filter field
   */
  const invertField = useCallback(
    (fieldName) => {
      setCriteria((prev) => {
        const updated = {
          ...prev,
          invertFields: {
            ...prev.invertFields,
            [fieldName]: !prev.invertFields?.[fieldName],
          },
        };

        if (props.setSearchFilters) {
          props.setSearchFilters(updated);
        }

        return updated;
      });
    },
    [props.setSearchFilters],
  );

  /**
   * Clear task property criteria
   */
  const clearTaskPropertyCriteria = useCallback(() => {
    setCriteria((prev) => ({
      ...prev,
      filters: { ...prev.filters, taskPropertySearch: null },
    }));
  }, []);

  /**
   * Clear all filters and reset to defaults
   */
  const clearAllFilters = useCallback(() => {
    if (props.clearAllFilters) {
      props.clearAllFilters();
    }

    const newCriteria = _cloneDeep(DEFAULT_CRITERIA);
    newCriteria.boundingBox = usePersistedFilters ? criteria.boundingBox : null;
    newCriteria.zoom = criteria.zoom;

    const includedFilters = buildIncludedFilters(props);
    newCriteria.filters = { ...newCriteria.filters, ...includedFilters };

    if (!ignoreURL) {
      history.push({
        pathname: location.pathname,
        state: { refresh: true },
      });
    }

    setCriteria(newCriteria);
    setLoading(true);
  }, [
    criteria.boundingBox,
    criteria.zoom,
    history,
    ignoreURL,
    location.pathname,
    props,
    usePersistedFilters,
  ]);

  /**
   * Change page size
   */
  const changePageSize = useCallback((pageSize) => {
    setCriteria((prev) => ({ ...prev, pageSize }));
  }, []);

  /**
   * Set a specific filter value
   */
  const setFiltered = useCallback((column, value) => {
    setCriteria((prev) => ({
      ...prev,
      filters: { ...prev.filters, [column]: value },
      page: 0,
    }));
  }, []);

  /**
   * Build search URL from criteria
   */
  const buildURL = useCallback((criteriaToUse) => {
    const searchCriteria = _merge({ filters: {} }, criteriaToUse);

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
  }, []);

  /**
   * Debounced task fetch
   */
  const debouncedTasksFetch = useMemo(
    () =>
      _debounce((challengeId, criteriaToUse, pageSize) => {
        if (props.augmentClusteredTasks) {
          props
            .augmentClusteredTasks(challengeId, false, criteriaToUse, pageSize, false, ignoreLocked)
            .then(() => {
              setLoading(false);
            });
        }
      }, 800),
    [ignoreLocked, props.augmentClusteredTasks],
  );

  /**
   * Refresh tasks with current criteria
   */
  const refreshTasks = useCallback(
    (typedCriteria) => {
      if (!ignoreURL) {
        const searchURL = buildURL(typedCriteria || criteria);
        if (_isEqual(location.search, searchURL) && loading) {
          return;
        }
        history.push({
          pathname: location.pathname,
          search: searchURL,
        });
      }

      setLoading(true);

      const criteriaToUse = typedCriteria || _cloneDeep(criteria);

      // Apply included filters from props
      if (props.includeTaskStatuses) {
        criteriaToUse.filters.status = _keys(_pickBy(props.includeTaskStatuses, (s) => s));
      }
      if (props.includeTaskPriorities) {
        criteriaToUse.filters.priorities = _keys(_pickBy(props.includeTaskPriorities, (p) => p));
      }
      if (props.includeTaskReviewStatuses) {
        criteriaToUse.filters.reviewStatus = _keys(
          _pickBy(props.includeTaskReviewStatuses, (r) => r),
        );
      }
      if (props.includeMetaReviewStatuses) {
        criteriaToUse.filters.metaReviewStatus = _keys(
          _pickBy(props.includeMetaReviewStatuses, (r) => r),
        );
      }

      criteriaToUse.filters.archived = true;

      debouncedTasksFetch(challengeId, criteriaToUse, criteria.pageSize);
    },
    [
      buildURL,
      challengeId,
      criteria,
      debouncedTasksFetch,
      history,
      ignoreURL,
      loading,
      location.pathname,
      location.search,
      props,
    ],
  );

  /**
   * Update criteria from URL
   */
  const updateCriteriaFromURL = useCallback(() => {
    const urlCriteria = location.search
      ? parseCriteriaString(location.search)
      : _cloneDeep(location.state);

    if (!urlCriteria?.filters?.status) {
      const includedFilters = buildIncludedFilters(props);
      setCriteria((prev) => ({
        ...prev,
        filters: { ...prev.filters, ...includedFilters },
        page: 0,
      }));
    } else {
      setCriteria(urlCriteria);
    }
  }, [location.search, location.state, props]);

  /**
   * Update criteria from saved filters
   */
  const updateCriteriaFromSavedFilters = useCallback(() => {
    const savedFilters =
      usePersistedFilters && savedFilterSettingName && props.getUserAppSetting
        ? props.getUserAppSetting(props.user, savedFilterSettingName)
        : "";

    const savedCriteria =
      savedFilters && savedFilters.length > 0
        ? parseCriteriaString(savedFilters)
        : _cloneDeep(location.state);

    if (!savedCriteria) {
      const includedFilters = buildIncludedFilters(props);
      setCriteria((prev) => ({
        ...prev,
        filters: { ...prev.filters, ...includedFilters },
        page: 0,
      }));
      return;
    }

    if (!savedCriteria?.filters?.status) {
      const includedFilters = buildIncludedFilters(props);
      setCriteria((prev) => ({
        ...prev,
        filters: { ...prev.filters, ...includedFilters },
        page: 0,
      }));
    } else {
      setCriteria(savedCriteria);
    }
  }, [location.state, props, savedFilterSettingName, usePersistedFilters]);

  // Initialize criteria on mount
  useEffect(() => {
    if (!ignoreURL && (!_isEmpty(location.search) || !_isEmpty(location.state))) {
      updateCriteriaFromURL();
    } else if (usePersistedFilters) {
      updateCriteriaFromSavedFilters();
    } else {
      const includedFilters = buildIncludedFilters(props);
      setCriteria((prev) => ({
        ...prev,
        filters: { ...prev.filters, ...includedFilters },
        page: 0,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle criteria changes and refresh tasks
  useEffect(() => {
    if (!challengeId) return;

    // Handle URL refresh state
    if (!ignoreURL && location.state?.refresh) {
      history.push({
        pathname: location.pathname,
        search: location.search,
        state: {},
      });

      if (props.setupFilters) {
        props.setupFilters();
      }
      updateCriteriaFromURL();
      return;
    }

    // Check if included filters changed
    const currentIncludedFilters = buildIncludedFilters(props);
    const prevIncludedFilters = buildIncludedFilters(prevCriteriaRef.current || {});

    if (!_isEqual(currentIncludedFilters, prevIncludedFilters)) {
      setCriteria((prev) => ({
        ...prev,
        filters: { ...prev.filters, ...currentIncludedFilters },
        page: 0,
      }));
      prevCriteriaRef.current = props;
      return;
    }

    // Refresh tasks if criteria changed or challenge changed
    if (
      !_isEqual(prevCriteriaRef.current?.criteria, criteria) ||
      challengeId !== prevChallengeIdRef.current
    ) {
      refreshTasks(criteria);
    }

    // Handle refreshAfterSave
    if (location.state?.refreshAfterSave) {
      refreshTasks(criteria);
      history.push({
        pathname: location.pathname,
        state: { refreshAfterSave: false },
      });
    }

    prevCriteriaRef.current = { ...props, criteria };
    prevChallengeIdRef.current = challengeId;
  }, [
    challengeId,
    criteria,
    history,
    ignoreURL,
    location,
    props,
    refreshTasks,
    updateCriteriaFromURL,
  ]);

  return {
    criteria,
    loading,
    bundledOnly,
    pageSize: criteria.pageSize,
    page: criteria.page,
    defaultPageSize: DEFAULT_PAGE_SIZE,
    updateCriteria,
    updateTaskFilterBounds,
    updateTaskPropertyCriteria,
    clearTaskPropertyCriteria,
    invertField,
    clearAllFilters,
    changePageSize,
    setFiltered,
    refreshTasks,
    setBundledOnly,
    loadingTasks: loading,
  };
}

export default useFilterCriteria;
