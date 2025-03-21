import _map from "lodash/map";
import _values from "lodash/values";
import { v1 as uuidv1 } from "uuid";
import uuidTime from "uuid-time";
import { CHALLENGE_EXCLUDE_LOCAL, CHALLENGE_INCLUDE_LOCAL } from "../Challenge/Challenge";
import { CHALLENGE_LOCATION_WITHIN_MAPBOUNDS } from "../Challenge/ChallengeLocation/ChallengeLocation";
import AppErrors from "../Error/AppErrors";
import { addError } from "../Error/Error";
import { toLatLngBounds } from "../MapBounds/MapBounds";
import { generateSearchParametersString } from "../Search/Search";
import Endpoint from "../Server/Endpoint";
import RequestStatus from "../Server/RequestStatus";
import { defaultRoutes as api } from "../Server/Server";
import { taskSchema } from "./Task";
import { clearTaskClusters } from "./TaskClusters";

// redux actions
const RECEIVE_BOUNDED_TASKS = "RECEIVE_BOUNDED_TASKS";
const CLEAR_BOUNDED_TASKS = "CLEAR_BOUNDED_TASKS";

// redux action creators

/**
 * Add or replace the map-bounded tasks in the redux store
 */
export const receiveBoundedTasks = function (
  tasks,
  status = RequestStatus.success,
  fetchId,
  totalCount = null,
) {
  return {
    type: RECEIVE_BOUNDED_TASKS,
    status,
    tasks,
    fetchId,
    totalCount,
    receivedAt: Date.now(),
  };
};

/**
 * Retrieve all task markers (up to the given limit) matching the given search
 * criteria, which should at least include a boundingBox field, and may
 * optionally include a filters field with additional constraints
 */
export function fetchBoundedTaskMarkers(
  criteria,
  limit = 50,
  skipDispatch = false,
  ignoreLocked = true,
) {
  return function (dispatch) {
    if (!skipDispatch) {
      // The map is either showing task clusters or bounded tasks so we shouldn't
      // have both in redux.
      // (ChallengeLocation needs to know which challenge tasks pass the location)
      dispatch(clearTaskClusters());
    }

    const normalizedBounds = toLatLngBounds(criteria.boundingBox);
    if (!normalizedBounds) {
      return null;
    }

    const filters = criteria.filters ?? {};
    const searchParameters = generateSearchParametersString(
      filters,
      null,
      criteria.savedChallengesOnly,
      null,
      null,
      criteria.invertFields,
    );

    if (!filters.challengeId) {
      const onlyEnabled = criteria.onlyEnabled ?? true;
      const challengeStatus = criteria.challengeStatus;
      if (challengeStatus) {
        searchParameters.cStatus = challengeStatus.join(",");
      }

      // ce: limit to enabled challenges
      // pe: limit to enabled projects
      searchParameters.ce = onlyEnabled ? "true" : "false";
      searchParameters.pe = onlyEnabled ? "true" : "false";

      // if we are restricting to onlyEnabled challenges then let's
      // not show 'local' challenges either.
      searchParameters.cLocal = onlyEnabled ? CHALLENGE_EXCLUDE_LOCAL : CHALLENGE_INCLUDE_LOCAL;
    }

    // If we are searching within map bounds we need to ensure the parent
    // challenge is also within those bounds
    if (filters.location === CHALLENGE_LOCATION_WITHIN_MAPBOUNDS) {
      if (Array.isArray(criteria.boundingBox)) {
        searchParameters.bb = criteria.boundingBox.join(",");
      } else {
        searchParameters.bb = criteria.boundingBox;
      }
    }

    const fetchId = uuidv1();
    !skipDispatch && dispatch(receiveBoundedTasks(null, RequestStatus.inProgress, fetchId));

    return new Endpoint(api.tasks.markersWithinBounds, {
      schema: {
        tasks: [taskSchema()],
      },
      variables: {
        left: normalizedBounds.getWest(),
        bottom: normalizedBounds.getSouth(),
        right: normalizedBounds.getEast(),
        top: normalizedBounds.getNorth(),
      },
      params: {
        limit,
        excludeLocked: ignoreLocked,
        ...searchParameters,
      },
      json: filters.taskPropertySearch
        ? {
            taskPropertySearch: filters.taskPropertySearch,
          }
        : null,
    })
      .execute()
      .then(({ result }) => {
        let tasks = result ? Object.values(result) : [];
        tasks = tasks.map((task) => Object.assign(task, task.pointReview));

        if (!skipDispatch) {
          dispatch(receiveBoundedTasks(tasks, RequestStatus.success, fetchId, tasks.length));
        }

        return tasks;
      })
      .catch((error) => {
        dispatch(receiveBoundedTasks([], RequestStatus.error, fetchId));
        dispatch(addError(AppErrors.boundedTask.fetchFailure));
        console.log(error.response || error);
      });
  };
}

/**
 * Retrieve all tasks (up to the given limit) matching the given search
 * criteria, which should at least include a boundingBox field, and may
 * optionally include a filters field with additional constraints
 */
export function fetchBoundedTasks(
  criteria,
  limit = 50,
  skipDispatch = false,
  ignoreLocked = true,
  withGeometries,
) {
  return function (dispatch) {
    if (!skipDispatch) {
      // The map is either showing task clusters or bounded tasks so we shouldn't
      // have both in redux.
      // (ChallengeLocation needs to know which challenge tasks pass the location)
      dispatch(clearTaskClusters());
    }

    const normalizedBounds = toLatLngBounds(criteria.boundingBox);
    if (!normalizedBounds) {
      return null;
    }

    let includeGeometries = withGeometries === undefined ? limit <= 100 : withGeometries;
    const page = criteria?.page ?? 0;
    const sortBy = criteria?.sortCriteria?.sortBy;
    const direction = (criteria?.sortCriteria?.direction || "ASC").toUpperCase();

    const filters = criteria?.filters ?? {};
    const searchParameters = generateSearchParametersString(
      filters,
      null,
      criteria?.savedChallengesOnly,
      null,
      null,
      criteria?.invertFields,
    );
    const includeTags = criteria?.includeTags ?? false;

    // If we don't have a challenge Id then we need to do some limiting.
    if (!filters.challengeId) {
      includeGeometries = false;
      const onlyEnabled = criteria.onlyEnabled === undefined ? true : criteria.onlyEnabled;
      const challengeStatus = criteria.challengeStatus;
      if (challengeStatus) {
        searchParameters.cStatus = challengeStatus.join(",");
      }

      // ce: limit to enabled challenges
      // pe: limit to enabled projects
      searchParameters.ce = onlyEnabled ? "true" : "false";
      searchParameters.pe = onlyEnabled ? "true" : "false";

      // if we are restricting to onlyEnabled challenges then let's
      // not show 'local' challenges either.
      searchParameters.cLocal = onlyEnabled ? CHALLENGE_EXCLUDE_LOCAL : CHALLENGE_INCLUDE_LOCAL;
    }

    // If we are searching within map bounds we need to ensure the parent
    // challenge is also within those bounds
    if (filters.location === CHALLENGE_LOCATION_WITHIN_MAPBOUNDS) {
      if (Array.isArray(criteria.boundingBox)) {
        searchParameters.bb = criteria.boundingBox.join(",");
      } else {
        searchParameters.bb = criteria.boundingBox;
      }
    }

    const fetchId = uuidv1();
    !skipDispatch && dispatch(receiveBoundedTasks(null, RequestStatus.inProgress, fetchId));

    return new Endpoint(api.tasks.withinBounds, {
      schema: { tasks: [taskSchema()] },
      variables: {
        left: normalizedBounds.getWest(),
        bottom: normalizedBounds.getSouth(),
        right: normalizedBounds.getEast(),
        top: normalizedBounds.getNorth(),
      },
      params: {
        limit,
        page,
        sort: sortBy,
        order: direction,
        includeTotal: true,
        excludeLocked: ignoreLocked,
        ...searchParameters,
        includeGeometries,
        includeTags,
      },
      json: filters.taskPropertySearch ? { taskPropertySearch: filters.taskPropertySearch } : null,
    })
      .execute()
      .then((normalizedResults) => {
        const totalCount = normalizedResults.result.total;

        let tasks = _values(normalizedResults?.entities?.tasks ?? {});
        tasks = _map(tasks, (task) => Object.assign(task, {}, task.pointReview));

        !skipDispatch &&
          dispatch(receiveBoundedTasks(tasks, RequestStatus.success, fetchId, totalCount));

        return { tasks, totalCount };
      })
      .catch((error) => {
        dispatch(receiveBoundedTasks([], RequestStatus.error, fetchId));
        dispatch(addError(AppErrors.boundedTask.fetchFailure));
        console.log(error.response || error);
      });
  };
}

/**
 * Clear the bounded tasks from the redux store
 */
export const clearBoundedTasks = function () {
  return {
    type: CLEAR_BOUNDED_TASKS,
    receivedAt: Date.now(),
  };
};

// redux reducers
export const currentBoundedTasks = function (state = {}, action) {
  if (action.type === RECEIVE_BOUNDED_TASKS) {
    // Only update the state if this represents either a later fetch
    // of data or an update to the current data in the store.
    if (action.fetchId !== state.fetchId || action.status !== state.status) {
      const fetchTime = parseInt(uuidTime.v1(action.fetchId));
      const lastFetch = state.fetchId ? parseInt(uuidTime.v1(state.fetchId)) : 0;

      if (fetchTime >= lastFetch) {
        const updatedTasks = {
          fetchId: action.fetchId,
        };

        if (action.status === RequestStatus.inProgress) {
          // Don't overwrite old tasks for in-progress fetches, as they're probably
          // still at least partially relevant as the user pans/zooms the map.
          updatedTasks.tasks = state.tasks;
          updatedTasks.loading = true;
        } else {
          updatedTasks.tasks = Array.isArray(action.tasks) ? action.tasks : [];
          updatedTasks.loading = false;
          updatedTasks.totalCount = action.totalCount;
        }

        return updatedTasks;
      }
    }

    return state;
  } else if (action.type === CLEAR_BOUNDED_TASKS) {
    return {};
  } else {
    return state;
  }
};
