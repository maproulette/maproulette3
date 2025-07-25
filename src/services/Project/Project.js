import { startOfDay } from "date-fns";
import _cloneDeep from "lodash/cloneDeep";
import _find from "lodash/find";
import _map from "lodash/map";
import { schema } from "normalizr";
import { setupCustomCache } from "../../utils/setupCustomCache";
import { RECEIVE_CHALLENGES } from "../Challenge/ChallengeActions";
import AppErrors from "../Error/AppErrors";
import { addError, addServerError } from "../Error/Error";
import { RESULTS_PER_PAGE } from "../Search/Search";
import Endpoint from "../Server/Endpoint";
import genericEntityReducer from "../Server/GenericEntityReducer";
import RequestStatus from "../Server/RequestStatus";
import { defaultRoutes as api, isSecurityError } from "../Server/Server";
import { ensureUserLoggedIn, fetchUser, findUser } from "../User/User";

// 5 minute cache
const CACHE_TIME = 5 * 60 * 1000;
const PROJECT_ACTIVITY_CACHE = "projectActivity";
const FEATURED_PROJECTS_CACHE = "featuredProjects";
const projectCache = setupCustomCache(CACHE_TIME);

/** normalizr schema for projects */
export const projectSchema = function () {
  return new schema.Entity("projects");
};

// redux actions
const RECEIVE_PROJECTS = "RECEIVE_PROJECTS";
const REMOVE_PROJECT = "REMOVE_PROJECT";

// redux action creators

/**
 * Add or update project data in the redux store
 */
export const receiveProjects = function (normalizedEntities) {
  return {
    type: RECEIVE_PROJECTS,
    status: RequestStatus.success,
    entities: normalizedEntities,
    receivedAt: Date.now(),
  };
};

/**
 * Remove project data from the redux store
 */
export const removeProject = function (projectId) {
  return {
    type: REMOVE_PROJECT,
    projectId,
    receivedAt: Date.now(),
  };
};

// async action creators

/**
 * Fetch data on all projects (up to the given limit).
 */
export const fetchProjects = function (limit = 50) {
  return function (dispatch) {
    return new Endpoint(api.projects.all, {
      schema: [projectSchema()],
      params: { limit },
    })
      .execute()
      .then((normalizedResults) => {
        dispatch(receiveProjects(normalizedResults.entities));
        return normalizedResults;
      })
      .catch((error) => {
        dispatch(addError(AppErrors.project.fetchFailure));
        console.log(error.response || error);
      });
  };
};

/**
 * Fetch data on projects the current user has permission to manage (up to the
 * given limit).
 */
export const fetchManageableProjects = function (
  page = null,
  limit = RESULTS_PER_PAGE,
  onlyOwned = false,
  onlyEnabled = false,
) {
  const pageToFetch = Number.isFinite(page) ? page : 0;

  return function (dispatch) {
    return new Endpoint(api.projects.managed, {
      schema: [projectSchema()],
      params: { limit: limit, page: pageToFetch, onlyOwned, onlyEnabled },
    })
      .execute()
      .then((normalizedResults) => {
        dispatch(receiveProjects(normalizedResults.entities));
        return normalizedResults;
      })
      .catch((error) => {
        if (isSecurityError(error)) {
          dispatch(ensureUserLoggedIn()).then(() =>
            dispatch(addError(AppErrors.user.unauthorized)),
          );
        } else {
          dispatch(addError(AppErrors.project.fetchFailure));
          console.log(error.response || error);
        }
      });
  };
};

/**
 * Retrieve all featured projects, up to the given limit
 */
export const fetchFeaturedProjects = function (
  onlyEnabled = true,
  limit = RESULTS_PER_PAGE,
  page = null,
) {
  return function (dispatch) {
    const pageToFetch = Number.isFinite(page) ? page : 0;
    const params = { onlyEnabled, limit, page: pageToFetch };
    const cachedFeaturedProjects = projectCache.get({}, params, FEATURED_PROJECTS_CACHE);

    if (cachedFeaturedProjects) {
      return new Promise((resolve) => {
        dispatch(receiveProjects(cachedFeaturedProjects.entities));
        resolve(cachedFeaturedProjects);
      });
    }

    return new Endpoint(api.projects.featured, {
      schema: [projectSchema()],
      params,
    })
      .execute()
      .then((normalizedResults) => {
        projectCache.set({}, params, normalizedResults, FEATURED_PROJECTS_CACHE);
        dispatch(receiveProjects(normalizedResults.entities));
        return normalizedResults;
      })
      .catch((error) => {
        dispatch(addError(AppErrors.project.fetchFailure));
        console.log(error.response || error);
      });
  };
};

/**
 * Fetch data for the given project.
 */
export const fetchProject = function (projectId) {
  return function (dispatch) {
    return new Endpoint(api.project.single, {
      schema: projectSchema(),
      variables: { id: projectId },
    })
      .execute()
      .then((normalizedResults) => {
        dispatch(receiveProjects(normalizedResults.entities));
        return normalizedResults;
      })
      .catch((error) => {
        dispatch(addError(AppErrors.project.fetchFailure));
        console.log(error.response || error);
      });
  };
};

/**
 * Fetch data for the given project.
 */
export const fetchProjectsById = function (projectIds) {
  return function (dispatch) {
    return new Endpoint(api.project.multiple, {
      schema: [projectSchema()],
      params: {
        projectIds: Array.isArray(projectIds) ? projectIds.join(",") : projectIds,
      },
    })
      .execute()
      .then((normalizedResults) => {
        dispatch(receiveProjects(normalizedResults.entities));
        return normalizedResults;
      })
      .catch((error) => {
        dispatch(addError(AppErrors.project.fetchFailure));
        console.log(error.response || error);
      });
  };
};

/**
 * Search projects by name using the given search string
 *
 * @param {string} query - the search string
 */
export const searchProjects = function (searchCriteria, limit = RESULTS_PER_PAGE) {
  const query = searchCriteria?.searchQuery;
  const onlyEnabled = searchCriteria.onlyEnabled === undefined ? true : searchCriteria.onlyEnabled;

  // We are just making sure the pqge passed in is a) present and b) a number
  const page = Number.isFinite(searchCriteria?.page) ? searchCriteria?.page : 0;

  return function (dispatch) {
    return new Endpoint(api.projects.search, {
      schema: [projectSchema()],
      params: {
        q: `%${query}%`,
        onlyEnabled: onlyEnabled ? "true" : "false",
        page,
        limit,
      },
    })
      .execute()
      .then((normalizedResults) => {
        dispatch(receiveProjects(normalizedResults.entities));
        return normalizedResults;
      })
      .catch((error) => {
        dispatch(addError(AppErrors.project.searchFailure));
        console.log(error.response || error);
      });
  };
};

/**
 * Save the given project (either creating it or updating it, depending on
 * whether it already has an id) and update the redux store with the latest
 * version from the server.
 */
export const saveProject = function (projectData, user) {
  return function (dispatch) {
    // Setup the save endpoint to either edit or create the project depending
    // on whether it has an id.
    const areCreating = !Number.isFinite(projectData.id);

    const saveEndpoint = new Endpoint(areCreating ? api.project.create : api.project.edit, {
      schema: projectSchema(),
      variables: { id: projectData.id },
      json: projectData,
    });

    return saveEndpoint
      .execute()
      .then((normalizedResults) => {
        dispatch(receiveProjects(normalizedResults.entities));
        const project = normalizedResults?.entities?.projects?.[normalizedResults.result];

        // If we just created the project, we should refresh the user as they
        // almost certainly have new grants
        if (areCreating && project) {
          return fetchUser(user.id)(dispatch).then(() => project);
        } else {
          return project;
        }
      })
      .catch((error) => {
        if (isSecurityError(error)) {
          dispatch(ensureUserLoggedIn()).then(() =>
            dispatch(addError(AppErrors.user.unauthorized)),
          );
        } else {
          console.log(error.response || error);
          dispatch(addServerError(AppErrors.project.saveFailure, error));
        }
      });
  };
};

/**
 * Archives or unarchives a project.
 */
export const archiveProject = (id, bool) => {
  return function (dispatch) {
    const saveEndpoint = new Endpoint(api.project.edit, {
      schema: projectSchema(),
      variables: { id },
      json: { isArchived: bool },
    });

    return saveEndpoint
      .execute()
      .then((normalizedResults) => {
        dispatch(receiveProjects(normalizedResults.entities));
        const project = normalizedResults?.entities?.projects?.[normalizedResults.result];

        return project;
      })
      .catch((error) => {
        if (isSecurityError(error)) {
          dispatch(ensureUserLoggedIn()).then(() =>
            dispatch(addError(AppErrors.user.unauthorized)),
          );
        } else {
          console.log(error.response || error);
          dispatch(addServerError(AppErrors.project.saveFailure, error));
        }
      });
  };
};

/**
 * Fetch activity timeline for the given project.
 */
export const fetchProjectActivity = function (projectId, startDate, endDate) {
  return function (dispatch) {
    const params = { projectList: projectId };
    if (startDate) {
      params.start = startOfDay(startDate).toISOString();
    }

    if (endDate) {
      params.end = startOfDay(endDate).toISOString();
    }

    const cachedProjectActivity = projectCache.get({}, params, PROJECT_ACTIVITY_CACHE);

    if (cachedProjectActivity) {
      return dispatch(receiveProjects(cachedProjectActivity));
    }

    return new Endpoint(api.project.activity, { params })
      .execute()
      .then((rawActivity) => {
        const normalizedResults = {
          entities: {
            projects: {
              [projectId]: { id: projectId, activity: rawActivity },
            },
          },
        };

        projectCache.set({}, params, normalizedResults, PROJECT_ACTIVITY_CACHE);

        return dispatch(receiveProjects(normalizedResults.entities));
      })
      .catch((error) => {
        if (isSecurityError(error)) {
          dispatch(ensureUserLoggedIn()).then(() =>
            dispatch(addError(AppErrors.user.unauthorized)),
          );
        } else {
          dispatch(addError(AppErrors.project.fetchFailure));
          console.log(error.response || error);
        }
      });
  };
};

/**
 * Fetch managers of the given project, both users and teams
 */
export const fetchProjectManagers = function (projectId) {
  return function (dispatch) {
    const normalizedResults = {
      entities: {
        projects: {
          [projectId]: { id: projectId },
        },
      },
    };

    return Promise.all([
      new Endpoint(api.project.managers, { variables: { projectId } })
        .execute()
        .then(
          (rawManagers) => (normalizedResults.entities.projects[projectId].managers = rawManagers),
        ),

      new Endpoint(api.teams.projectManagers, { variables: { projectId } }).execute().then(
        (rawManagers) =>
          (normalizedResults.entities.projects[projectId].teamManagers = _map(
            rawManagers,
            (managingTeam) =>
              Object.assign({}, managingTeam.team, {
                roles: _map(managingTeam.grants, "role"),
              }),
          )),
      ),
    ])
      .then(() => dispatch(receiveProjects(normalizedResults.entities)))
      .catch((error) => {
        if (isSecurityError(error)) {
          dispatch(ensureUserLoggedIn()).then(() =>
            dispatch(addError(AppErrors.user.unauthorized)),
          );
        } else {
          dispatch(addError(AppErrors.project.fetchFailure));
          console.log(error.response || error);
        }
      });
  };
};

/**
 * Set role for user on project
 */
export const setProjectManagerRole = function (projectId, userId, isOSMUserId, role) {
  return function (dispatch) {
    return new Endpoint(api.project.setManagerPermission, {
      variables: { userId, projectId, role },
      params: { isOSMUserId: isOSMUserId ? "true" : "false" },
    })
      .execute()
      .then((rawManagers) => {
        const normalizedResults = {
          entities: {
            projects: {
              [projectId]: { id: projectId, managers: rawManagers },
            },
          },
        };

        return dispatch(receiveProjects(normalizedResults.entities));
      })
      .catch((error) => {
        if (isSecurityError(error)) {
          dispatch(ensureUserLoggedIn()).then(() =>
            dispatch(addError(AppErrors.user.unauthorized)),
          );
        } else {
          dispatch(addError(AppErrors.project.saveFailure));
          console.log(error.response || error);
        }
      });
  };
};

/**
 * Add a user with the given OSM username to the given project with the given
 * role
 */
export const addProjectManager = function (projectId, username, role) {
  return function (dispatch) {
    return findUser(username)
      .then((matchingUsers) => {
        // We want an exact username match
        const osmId = _find(matchingUsers, (match) => match.displayName === username)?.osmId;

        if (Number.isFinite(osmId)) {
          return setProjectManagerRole(projectId, osmId, true, role)(dispatch);
        } else {
          dispatch(addError(AppErrors.user.notFound));
        }
      })
      .catch((error) => {
        dispatch(addError(AppErrors.user.saveFailure));
        console.log(error.response || error);
      });
  };
};

/**
 * Remove project manager from project
 */
export const removeProjectManager = function (projectId, userId, isOSMUserId) {
  return function (dispatch) {
    return new Endpoint(api.project.removeManager, {
      variables: { userId, projectId },
      params: { isOSMUserId: isOSMUserId ? "true" : "false" },
    })
      .execute()
      .then(() => fetchProjectManagers(projectId)(dispatch))
      .catch((error) => {
        if (isSecurityError(error)) {
          dispatch(ensureUserLoggedIn()).then(() =>
            dispatch(addError(AppErrors.user.unauthorized)),
          );
        } else {
          dispatch(addError(AppErrors.project.saveFailure));
          console.log(error.response || error);
        }
      });
  };
};

/**
 * Deletes the given project from the server.
 */
export const deleteProject = function (projectId, immediate = false) {
  return function (dispatch) {
    return new Endpoint(api.project.delete, {
      variables: { id: projectId },
      params: immediate ? { immediate: "true" } : undefined,
    })
      .execute()
      .then(() => dispatch(removeProject(projectId)))
      .catch((error) => {
        // Update with the latest project data.
        fetchProject(projectId)(dispatch);

        if (isSecurityError(error)) {
          dispatch(ensureUserLoggedIn()).then(() =>
            dispatch(addError(AppErrors.user.unauthorized)),
          );
        } else {
          dispatch(addError(AppErrors.project.deleteFailure));
          console.log(error.response || error);
        }
      });
  };
};

// redux reducers

const reduceProjectsFurther = function (mergedState, oldState, projectEntities) {
  // The generic reduction will merge arrays and objects, but for some
  // fields we want to simply overwrite with the latest data.
  for (const entity of projectEntities) {
    // Ignore deleted projects.
    if (entity.deleted) {
      delete mergedState[entity.id];
      return;
    }

    if (Array.isArray(entity.activity)) {
      mergedState[entity.id].activity = entity.activity;
    }

    if (Array.isArray(entity.managers)) {
      mergedState[entity.id].managers = entity.managers;
    }

    if (Array.isArray(entity.teamManagers)) {
      mergedState[entity.id].teamManagers = entity.teamManagers;
    }
  }
};

export const projectEntities = function (state, action) {
  if (action.type === REMOVE_PROJECT) {
    const mergedState = _cloneDeep(state);
    delete mergedState[action.projectId];
    return mergedState;
  } else {
    // Note that projects can also be nested within challenge responses, so we
    // need to process both project and challenge actions.
    return genericEntityReducer(
      [RECEIVE_PROJECTS, RECEIVE_CHALLENGES],
      "projects",
      reduceProjectsFurther,
    )(state, action);
  }
};
