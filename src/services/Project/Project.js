import { schema } from 'normalizr'
import _get from 'lodash/get'
import _isNumber from 'lodash/isNumber'
import _isArray from 'lodash/isArray'
import _cloneDeep from 'lodash/cloneDeep'
import _find from 'lodash/find'
import _isFinite from 'lodash/isFinite'
import startOfDay from 'date-fns/start_of_day'
import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { RECEIVE_CHALLENGES } from '../Challenge/ChallengeActions'
import { addServerError,
         addError } from '../Error/Error'
import AppErrors from '../Error/AppErrors'
import { findUser, logoutUser } from '../User/User'

/** normalizr schema for projects */
export const projectSchema = function() {
  return new schema.Entity('projects')
}

// redux actions
const RECEIVE_PROJECTS = 'RECEIVE_PROJECTS'
const REMOVE_PROJECT = 'REMOVE_PROJECT'

// redux action creators

/**
 * Add or update project data in the redux store
 */
export const receiveProjects = function(normalizedEntities) {
  return {
    type: RECEIVE_PROJECTS,
    status: RequestStatus.success,
    entities: normalizedEntities,
    receivedAt: Date.now()
  }
}

/**
 * Remove project data from the redux store
 */
export const removeProject = function(projectId) {
  return {
    type: REMOVE_PROJECT,
    projectId,
    receivedAt: Date.now()
  }
}

// async action creators

/**
 * Fetch data on all projects (up to the given limit).
 */
export const fetchProjects = function(limit=50) {
  return function(dispatch) {
    return new Endpoint(
      api.projects.all, {schema: [ projectSchema() ], params: {limit}}
    ).execute().then(normalizedResults => {
      dispatch(receiveProjects(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.project.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Fetch data on projects the current user has permission to manage (up to the
 * given limit).
 */
export const fetchManageableProjects = function(limit=50) {
  return function(dispatch) {
    return new Endpoint(
      api.projects.managed, {schema: [ projectSchema() ], params: {limit}}
    ).execute().then(normalizedResults => {
      dispatch(receiveProjects(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server).
        dispatch(logoutUser())
        dispatch(addError(AppErrors.user.unauthorized))
      }
      else {
        dispatch(addError(AppErrors.project.fetchFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Fetch data for the given project.
 */
export const fetchProject = function(projectId) {
  return function(dispatch) {
    return new Endpoint(
      api.project.single, {schema: projectSchema(), variables: {id: projectId}}
    ).execute().then(normalizedResults => {
      dispatch(receiveProjects(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.project.fetchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Search projects by name using the given search string
 *
 * @param {string} query - the search string
 */
export const searchProjects = function(query, onlyEnabled=false, limit=50) {
  return function(dispatch) {
    return new Endpoint(api.projects.search, {
        schema: [ projectSchema() ],
        params: {
          q: `%${query}%`,
          onlyEnabled: onlyEnabled ? 'true' : 'false',
          limit,
        }
    }).execute().then(normalizedResults => {
      dispatch(receiveProjects(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(AppErrors.project.searchFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Save the given project (either creating it or updating it, depending on
 * whether it already has an id) and update the redux store with the latest
 * version from the server.
 */
export const saveProject = function(projectData) {
  return function(dispatch) {
    // Setup the save endpoint to either edit or create the project depending
    // on whether it has an id.
    const saveEndpoint = new Endpoint(
      _isNumber(projectData.id) ? api.project.edit : api.project.create,
      {
        schema: projectSchema(),
        variables: {id: projectData.id},
        json: projectData,
      }
    )

    return saveEndpoint.execute().then(normalizedResults => {
      dispatch(receiveProjects(normalizedResults.entities))
      return _get(normalizedResults, `entities.projects.${normalizedResults.result}`)
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server).
        dispatch(logoutUser())
        dispatch(addError(AppErrors.user.unauthorized))
      }
      else {
        console.log(error.response || error)
        dispatch(addServerError(AppErrors.project.saveFailure, error))
      }
    })
  }
}

/**
 * Fetch activity timeline for the given project.
 */
export const fetchProjectActivity = function(projectId, startDate, endDate) {
  return function(dispatch) {
    const params = {projectList: projectId}
    if (startDate) {
      params.start = startOfDay(startDate).toISOString()
    }

    if (endDate) {
      params.end = startOfDay(endDate).toISOString()
    }

    return new Endpoint(
      api.project.activity, {params}
    ).execute().then(rawActivity => {
      const normalizedResults = {
        entities: {
          projects: {
            [projectId]: {id: projectId, activity: rawActivity},
          }
        }
      }

      return dispatch(receiveProjects(normalizedResults.entities))
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server). There's nothing to
        // do for this request except ensure we know the user is logged out.
        dispatch(logoutUser())
      }
      else {
        dispatch(addError(AppErrors.project.fetchFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Fetch managers of the given project.
 */
export const fetchProjectManagers = function(projectId) {
  return function(dispatch) {
    return new Endpoint(
      api.project.managers, {variables: {projectId}}
    ).execute().then(rawManagers => {
      const normalizedResults = {
        entities: {
          projects: {
            [projectId]: {id: projectId, managers: rawManagers},
          }
        }
      }

      return dispatch(receiveProjects(normalizedResults.entities))
    }).catch(error => {
      if (error.response && error.response.status === 401) {
        dispatch(addError(AppErrors.project.notManager))
      }
      else {
        dispatch(addError(AppErrors.project.fetchFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Set group type (permissions) for user on project.
 */
export const setProjectManagerPermissions = function(projectId, userId, groupType) {
  return function(dispatch) {
    return new Endpoint(
      api.project.setManagerPermission, {variables: {userId, projectId, groupType}}
    ).execute().then(rawManagers => {
      const normalizedResults = {
        entities: {
          projects: {
            [projectId]: {id: projectId, managers: rawManagers},
          }
        }
      }

      return dispatch(receiveProjects(normalizedResults.entities))
    }).catch((error) => {
      if (error.response && error.response.status === 401) {
        dispatch(addError(AppErrors.project.notManager))
      }
      else {
        dispatch(addError(AppErrors.project.saveFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Add a user with the given OSM username to the given project with the given
 * group type (permissions).
 */
export const addProjectManager = function(projectId, username, groupType) {
  return function(dispatch) {
    return findUser(username).then(matchingUsers => {
      // We want an exact username match
      const osmId =
        _get(_find(matchingUsers, match => match.displayName === username), 'osmId')

      if (_isFinite(osmId)) {
        return setProjectManagerPermissions(projectId, osmId, groupType)(dispatch)
      }
      else {
        dispatch(addError(AppErrors.user.notFound))
      }
    }).catch(error => {
      dispatch(addError(AppErrors.user.saveFailure))
      console.log(error.response || error)
    })
  }
}

/**
 * Remove project manager from project
 */
export const removeProjectManager = function(projectId, userId) {
  return function(dispatch) {
    return new Endpoint(
      api.project.removeManager, {variables: {userId, projectId}}
    ).execute().then(
      () => fetchProjectManagers(projectId)(dispatch)
    ).catch((error) => {
      if (error.response && error.response.status === 401) {
        dispatch(addError(AppErrors.project.notManager))
      }
      else {
        dispatch(addError(AppErrors.project.saveFailure))
        console.log(error.response || error)
      }
    })
  }
}

/**
 * Deletes the given project from the server.
 */
export const deleteProject = function(projectId, immediate=false) {
  return function(dispatch) {
    return new Endpoint(
      api.project.delete, {
        variables: {id: projectId},
        params: immediate ? {immediate: 'true'} : undefined
      }
    ).execute().then(() =>
      dispatch(removeProject(projectId))
    ).catch((error) => {
      // Update with the latest project data.
      fetchProject(projectId)(dispatch)

      if (error.response && error.response.status === 401) {
        // If we get an unauthorized, we assume the user is not logged
        // in (or no longer logged in with the server).
        dispatch(logoutUser())
        dispatch(addError(AppErrors.user.unauthorized))
      }
      else {
        dispatch(addError(AppErrors.project.deleteFailure))
        console.log(error.response || error)
      }
    })
  }
}

// redux reducers

const reduceProjectsFurther = function(mergedState, oldState, projectEntities) {
  // The generic reduction will merge arrays and objects, but for some
  // fields we want to simply overwrite with the latest data.
  projectEntities.forEach(entity => {
    // Ignore deleted projects.
    if (entity.deleted) {
      delete mergedState[entity.id]
      return
    }

    if (_isArray(entity.activity)) {
      mergedState[entity.id].activity = entity.activity
    }

    if (_isArray(entity.managers)) {
      mergedState[entity.id].managers = entity.managers
    }
  })
}

export const projectEntities = function(state, action) {
  if (action.type === REMOVE_PROJECT) {
    const mergedState = _cloneDeep(state)
    delete mergedState[action.projectId]
    return mergedState
  }
  else {
    // Note that projects can also be nested within challenge responses, so we
    // need to process both project and challenge actions.
    return genericEntityReducer([RECEIVE_PROJECTS, RECEIVE_CHALLENGES],
                                'projects',
                                reduceProjectsFurther)(state, action)
  }
}
