import { fetchProjects } from '../Project/Project'

const SET_ADMIN_PROJECTS = 'SET_ADMIN_PROJECTS'

export const receiveAdminProjects = function (normalizedEntities, dispatch) {
  dispatch({
    type: SET_ADMIN_PROJECTS,
    payload: [],
    loadingCompleted: false,
  })

  const results = Object.keys(normalizedEntities.projects).map(
    (i) => normalizedEntities.projects[i]
  )

  return {
    type: SET_ADMIN_PROJECTS,
    payload: results || [],
    loadingCompleted: true,
  }
}

export const fetchAdminProjects = function () {
  return async function (dispatch) {
    try {
      const normalizedResults = await dispatch(fetchProjects(50000))
      return dispatch(receiveAdminProjects(normalizedResults.entities, dispatch))
    } catch (error) {
      console.error('Error loading admin projects:', error)
      throw error
    }
  }
}

const ADMIN_PROJECTS_INITIAL_STATE = {
  data: [],
  loadingCompleted: false,
}

export const adminProjectEntities = function (
  state = ADMIN_PROJECTS_INITIAL_STATE,
  action
) {
  switch (action.type) {
    case SET_ADMIN_PROJECTS:
      return { data: action.payload, loadingCompleted: action.loadingCompleted }
    default:
      return state
  }
}
