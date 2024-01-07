import { performChallengeSearch } from '../Challenge/Challenge'
import { SET_ADMIN_CHALLENGES } from '../Challenge/ChallengeActions'

export const receiveAdminChallenges = function (normalizedEntities, dispatch) {
  dispatch({
    type: SET_ADMIN_CHALLENGES,
    payload: [],
    loadingCompleted: false,
  })

  const results = Object.keys(normalizedEntities.challenges).map(
    (i) => normalizedEntities.challenges[i]
  )

  return {
    type: SET_ADMIN_CHALLENGES,
    payload: results || [],
    loadingCompleted: true,
  }
}

export const fetchAdminChallenges = function (query) {
    return async function (dispatch) {
      try {
        const normalizedResults = await dispatch(performChallengeSearch(query, 50000, true))
        return dispatch(receiveAdminChallenges(normalizedResults.entities, dispatch))
      } catch (error) {
        console.error('Error searching admin challenges:', error)
      }
    }
}
