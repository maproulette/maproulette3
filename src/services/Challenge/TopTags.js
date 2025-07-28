import _values from "lodash/values";
import _map from "lodash/map";
import Endpoint from "../Server/Endpoint";
import { defaultRoutes as api } from "../Server/Server";

/**
 * Fetch top tags for a challenge
 */
export const fetchTopTags = function (challengeId) {
  return new Endpoint(api.challenge.topTags, {
    schema: {},
    variables: { id: challengeId },
  })
    .execute()
    .then((response) => {
      // The API returns an object with numeric keys, convert to array
      return response?.result ? Object.values(response.result) : [];
    })
    .catch((error) => {
      console.log(error.response || error);
      return [];
    });
};
