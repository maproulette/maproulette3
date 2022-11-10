import RequestStatus from '../Server/RequestStatus'
import genericEntityReducer from '../Server/GenericEntityReducer'
import _map from 'lodash/map'
import _each from "lodash/each";
import _isArray from "lodash/isArray";
import _isObject from "lodash/isObject"
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import { performChallengeSearch } from '../Challenge/Challenge'
import { RECEIVE_CHALLENGES } from '../Challenge/ChallengeActions';
import _get from "lodash/get";
import _compact from "lodash/compact";
import _pick from "lodash/pick";
import _keys from "lodash/keys";
import _values from "lodash/values";
import _flatten from "lodash/flatten";
import _clone from "lodash/clone";
import _cloneDeep from "lodash/cloneDeep";
import _isEmpty from "lodash/isEmpty";
import _isString from "lodash/isString";
import _isFinite from "lodash/isFinite";
import _fromPairs from "lodash/fromPairs";
import _isUndefined from "lodash/isUndefined";
import _groupBy from "lodash/groupBy";
import _join from "lodash/join";
import { defaultRoutes as api, isSecurityError } from "../Server/Server";
import Endpoint from "../Server/Endpoint";
import { toLatLngBounds } from "../MapBounds/MapBounds";
import { addError, addServerError } from "../Error/Error";
import AppErrors from "../Error/AppErrors";
import { ChallengeStatus } from '../Challenge/ChallengeStatus/ChallengeStatus';
import { zeroTaskActions } from "../Task/TaskAction/TaskAction";
import {
  parseQueryString,
  RESULTS_PER_PAGE,
  SortOptions,
  generateSearchParametersString,
  PARAMS_MAP,
} from "../Search/Search";


// redux actions
export const SET_ADMIN_CHALLENGES = 'SET_SUPER_ADMIN_CHALLENGES'

// redux action creators

/**
 * Add or update place data in the redux store
 */

export const receiveAdminChallenges = function (
  normalizedEntities,
  status = RequestStatus.success
) {
  _each(normalizedEntities.challenges, (c) => {
    if (c.dataOriginDate) {
      c.dataOriginDate = format(parse(c.dataOriginDate), "YYYY-MM-DD");
    }
  });

  return {
    type: SET_ADMIN_CHALLENGES,
    status,
    entities: normalizedEntities,
    receivedAt: Date.now(),
  };
};

/**
 * Retrieve a description of the place at the given latititude and longitude.
 */
export const fetchAdminChallenges = function() {

  return function(dispatch) {
    return dispatch(performChallengeSearch({onlyEnabled: false, archived: false}, 50000)).then(normalizedResults => {
      dispatch(receiveAdminChallenges(normalizedResults.entities))
      console.log(normalizedResults)
      return normalizedResults
    })
  }
}

// redux reducers
export const adminChallengeEntities = function (state, action) {
console.log(state, action)  
      return genericEntityReducer(
      RECEIVE_CHALLENGES,
      "challenges"
    )(state, action);
};