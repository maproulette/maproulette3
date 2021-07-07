import _values from "lodash/values";
import Endpoint from "../Server/Endpoint";
import { defaultRoutes as api } from "../Server/Server";

/**
 * Fetch challenge comments
 */
export const fetchChallengeComments = function (
  challengeId,
  includeTaskLevel = false
) {
  return new Endpoint(api.challenge.comments, {
    schema: {},
    variables: { id: challengeId },
    params: { includeTaskLevel },
  })
    .execute()
    .then((rawComments) => {
      const comments = _values(rawComments?.result);
      return comments;
    })
    .catch((error) => {
      console.log(error.response || error);
    });
};

/**
 * Post challenge comment
 */
export const postChallengeComment = function (challengeId, comment) {
  return new Endpoint(api.challenge.addComment, {
    variables: { id: challengeId },
    params: { comment },
  })
    .execute()
    .catch((error) => {
      console.log(error.response || error);
    });
};
