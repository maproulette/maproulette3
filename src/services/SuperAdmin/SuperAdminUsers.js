import { fetchUsers } from '../User/User'

const SET_ADMIN_USERS = 'SET_ADMIN_USERS'

export const receiveAdminUsers = function (normalizedEntities, dispatch) {
  dispatch({
    type: SET_ADMIN_USERS,
    payload: [],
    loadingCompleted: false,
  })

  const results = Object.keys(normalizedEntities.users).map(
    (i) => normalizedEntities.users[i]
  )

  return {
    type: SET_ADMIN_USERS,
    payload: results || [],
    loadingCompleted: true,
  }
}

export const fetchAdminUsers = async function (dispatch) {
  try {
    const normalizedResults = await dispatch(fetchUsers(50000))
    return dispatch(receiveAdminUsers(normalizedResults.entities, dispatch))
  } catch (error) {
    console.error('Error fetching admin users:', error)
  }
}

const ADMIN_USERS_INITIAL_STATE = {
  data: [],
  loadingCompleted: false,
}

export const adminUserEntities = function (
  state = ADMIN_USERS_INITIAL_STATE,
  action
) {
  switch (action.type) {
    case SET_ADMIN_USERS:
      return { data: action.payload, loadingCompleted: action.loadingCompleted }
    default:
      return state
  }
}
