import _each from "lodash/each";
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import { performChallengeSearch } from '../Challenge/Challenge'
import { SET_ADMIN_CHALLENGES } from '../Challenge/ChallengeActions'

export const receiveAdminChallenges = function (
  normalizedEntities,
  dispatch
) {
  dispatch({
    type: SET_ADMIN_CHALLENGES,
    payload: [],
    loading: true
  })

  _each(normalizedEntities.challenges, (c) => {
    if (c.dataOriginDate) {
      c.dataOriginDate = format(parse(c.dataOriginDate), "YYYY-MM-DD");
    }
  });

  const results = Object.keys(normalizedEntities.challenges).map(i => normalizedEntities.challenges[i]);

  return {
    type: SET_ADMIN_CHALLENGES,
    payload: results || [],
    loading: false
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
