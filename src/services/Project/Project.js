import { schema } from 'normalizr'
import { defaultRoutes as api } from '../Server/Server'
import Endpoint from '../Server/Endpoint'
import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import { RECEIVE_CHALLENGES } from '../Challenge/ChallengeActions'
import { buildError,
         buildServerError,
         addError } from '../Error/Error'
import { logoutUser } from '../User/User'
import { get as _get,
         isNumber as _isNumber } from 'lodash'

/** normalizr schema for projects */
export const projectSchema = function() {
  return new schema.Entity('projects')
}

// redux actions
const RECEIVE_PROJECTS = 'RECEIVE_PROJECTS'

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
      dispatch(addError(buildError(
        "Project.fetchFailure", "Unable to retrieve latest project data from server."
      )))

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
        dispatch(addError(buildError(
          "User.unauthorized", "Please sign in to continue."
        )))
      }
      else {
        dispatch(addError(buildError(
          "Project.fetchFailure", "Unable to retrieve latest project data from server."
        )))

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
      dispatch(addError(buildError(
        "Project.fetchFailure", "Unable to retrieve latest project data from server."
      )))

      console.log(error.response || error)
    })
  }
}

/**
 * Search projects by name using the given search string
 *
 * @param {string} query - the search string
 */
export const searchProjects = function(query) {
  return function(dispatch) {
    return new Endpoint(
      api.projects.search, {schema: [ projectSchema() ], params: {q: `%${query}%`}}
    ).execute().then(normalizedResults => {
      dispatch(receiveProjects(normalizedResults.entities))
      return normalizedResults
    }).catch((error) => {
      dispatch(addError(buildError(
        "Project.fetchFailure", "Unable to search projects."
      )))

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
        dispatch(addError(buildError(
          "User.unauthorized", "Please sign in to continue."
        )))
      }
      else {
        console.log(error.response || error)
        buildServerError(
          "Project.saveFailure", "Unable to save your changes", error
        ).then(errorObject => dispatch(addError(errorObject)))
      }
    })
  }
}

// redux reducers

// Note that projects can also be nested within challenge responses, so we need
// to process both project and challenge actions.
export const projectEntities =
  genericEntityReducer([RECEIVE_PROJECTS, RECEIVE_CHALLENGES], 'projects')
