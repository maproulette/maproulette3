import { performChallengeSearch } from '../Challenge/Challenge'
import { SET_ADMIN_CHALLENGES } from '../Challenge/ChallengeActions'

export const receiveAdminChallenges = function (
  normalizedEntities,
  dispatch
) {
  dispatch({
    type: SET_ADMIN_CHALLENGES,
    payload: [],
    loading: false
  })

  const results = Object.keys(normalizedEntities.challenges).map(i => normalizedEntities.challenges[i]);

  return {
    type: SET_ADMIN_CHALLENGES,
    payload: results || [],
    loading: true
  };
};

export const fetchAdminChallenges = function(query) {
  return function(dispatch) {
    return (
      dispatch(performChallengeSearch(query, 50000, true)).then(normalizedResults => {
        return dispatch(receiveAdminChallenges(normalizedResults.entities, dispatch))
      })
    )
  }
}
