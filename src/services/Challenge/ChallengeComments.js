import _values from "lodash/values";
import Endpoint from "../Server/Endpoint";
import AppErrors from "../Error/AppErrors";
import { addError } from "../Error/Error";
import { defaultRoutes as api } from "../Server/Server";

/**
 * Fetch challenge comments and task comments associated with the given challenge
 */
export const fetchChallengeComments = async function (challengeId) {
  return await new Endpoint(api.challenge.comments, {
    schema: {},
    variables: { id: challengeId },
  })
    .execute()
    .then(async (rawTaskComments) => {
      const taskComments = _values(rawTaskComments?.result);

      return await new Endpoint(api.challenge.challengeComments, {
        schema: {},
        variables: { id: challengeId },
      })
        .execute()
        .then((rawChallengeComments) => {
          const challengeComments = _values(rawChallengeComments?.result);
          const allComments = taskComments.concat(challengeComments);
          const sortedComments = allComments.sort(
            (a, b) => new Date(a.created) - new Date(b.created)
          );

          return sortedComments;
        })
        .catch((error) => {
          console.log(error.response || error);
        });
    })
    .catch((error) => {
      console.log(error.response || error);
    });
};

/**
 * Post challenge comment
 */
export const postChallengeComment = async function (challengeId, comment) {
  return await new Endpoint(api.challenge.addComment, {
    variables: { id: challengeId },
    json: { comment: comment },
  })
    .execute()
    .catch((error) => {
      dispatch(addError(AppErrors.task.addCommentFailure))
      console.log(error.response || error);
    });
};
