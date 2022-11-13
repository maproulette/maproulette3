import _each from "lodash/each";
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import { fetchProjects } from "../Project/Project";

const SET_ADMIN_PROJECTS = 'SET_ADMIN_PROJECTS'

export const receiveAdminProjects = function (
  normalizedEntities,
  dispatch
) {
  dispatch({
    type: SET_ADMIN_PROJECTS,
    payload: [],
    loading: true
  })

  const results = Object.keys(normalizedEntities.projects).map(i => normalizedEntities.projects[i]);

  return {
    type: SET_ADMIN_PROJECTS,
    payload: results || [],
    loading: false
  };
};

export const fetchAdminProjects = function() {
  return function(dispatch) {
    return (
      dispatch(fetchProjects(50000)).then(normalizedResults => {
        return dispatch(receiveAdminProjects(normalizedResults.entities, dispatch))
      })
    )
  }
}

const ADMIN_PROJECTS_INITIAL_STATE = {
  data: [],
  loading: false
}

export const adminProjectEntities = function(state = ADMIN_PROJECTS_INITIAL_STATE, action) {
  switch (action.type) {
    case SET_ADMIN_PROJECTS:
      return { data: action.payload, loading: action.loading };
    default:
      return state;
  }
}
