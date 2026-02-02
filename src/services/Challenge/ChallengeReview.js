import Endpoint from "../Server/Endpoint";
import { defaultRoutes as api } from "../Server/Server";

/**
 * Submit or update a review for a challenge (1-5 star rating with optional feedback)
 */
export const submitChallengeReview = function (challengeId, reviewData) {
  return new Endpoint(api.challenge.submitReview, {
    variables: { id: challengeId },
    json: reviewData,
  })
    .execute()
    .catch((error) => {
      console.log(error.response || error);
    });
};

/**
 * Remove the current user's review from a challenge
 */
export const removeChallengeReview = function (challengeId) {
  return new Endpoint(api.challenge.removeReview, {
    variables: { id: challengeId },
  })
    .execute()
    .catch((error) => {
      console.log(error.response || error);
    });
};

/**
 * Fetch the current user's review for a challenge
 */
export const fetchUserChallengeReview = function (challengeId) {
  return new Endpoint(api.challenge.getUserReview, {
    variables: { id: challengeId },
  })
    .execute()
    .catch((error) => {
      // 404 means no review exists, which is fine
      if (error?.response?.status !== 404) {
        console.log(error.response || error);
      }
      return null;
    });
};

/**
 * Fetch all reviews for a challenge
 */
export const fetchChallengeReviews = function (challengeId, limit = 10, offset = 0) {
  return new Endpoint(api.challenge.getReviews, {
    variables: { id: challengeId },
    params: { limit, offset },
  })
    .execute()
    .catch((error) => {
      console.log(error.response || error);
      return [];
    });
};

/**
 * Fetch the aggregate review summary for a challenge
 */
export const fetchChallengeReviewSummary = function (challengeId) {
  return new Endpoint(api.challenge.getReviewSummary, {
    variables: { id: challengeId },
  })
    .execute()
    .catch((error) => {
      console.log(error.response || error);
      return null;
    });
};
