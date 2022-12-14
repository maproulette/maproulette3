import { fetchUsers } from "../User/User";

const SET_ADMIN_USERS = 'SET_ADMIN_USERS'

export const receiveAdminUsers = function (
  normalizedEntities,
  dispatch
) {
  dispatch({
    type: SET_ADMIN_USERS,
    payload: [],
    loading: false
  })

  const results = Object.keys(normalizedEntities.users).map(i => normalizedEntities.users[i]);

  return {
    type: SET_ADMIN_USERS,
    payload: results || [],
    loading: true
  };
};

export const fetchAdminUsers = function() {
  return function(dispatch) {
    return (
      dispatch(fetchUsers(50000)).then(normalizedResults => {
        return dispatch(receiveAdminUsers(normalizedResults.entities, dispatch))
      })
    )
  }
}

const ADMIN_USERS_INITIAL_STATE = {
  data: [],
  loading: false
}

export const adminUserEntities = function(state = ADMIN_USERS_INITIAL_STATE, action) {
  switch (action.type) {
    case SET_ADMIN_USERS:
      return { data: action.payload, loading: action.loading };
    default:
      return state;
  }
}