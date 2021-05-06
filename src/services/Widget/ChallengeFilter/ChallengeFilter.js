import _fromPairs from "lodash/fromPairs";
import _map from "lodash/map";
import messages from "./Messages";

export const CHALLENGE_FILTER_VISIBLE = "visible";
export const CHALLENGE_FILTER_PINNED = "pinned";
export const CHALLENGE_FILTER_ARCHIVED = "archived";

export const ChallengeFilter = {
  visible: CHALLENGE_FILTER_VISIBLE,
  pinned: CHALLENGE_FILTER_PINNED,
  archived: CHALLENGE_FILTER_ARCHIVED,
};

export const defaultChallengeFilters = function () {
  return {
    [CHALLENGE_FILTER_VISIBLE]: false,
    [CHALLENGE_FILTER_PINNED]: false,
    [CHALLENGE_FILTER_ARCHIVED]: false,
  };
};

export const challengePassesFilters = function (
  challenge,
  manager,
  pins,
  challengeFilters
) {
  if (challengeFilters.visible && !challenge.enabled) {
    return false;
  }

  if (challengeFilters.pinned && pins.indexOf(challenge.id) === -1) {
    return false;
  }

  if (Boolean(challengeFilters.archived) !== Boolean(challenge.isArchived)) {
    return false;
  }

  return true;
};

/**
 * Returns an object mapping challenge filters to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByFilter = _fromPairs(
  _map(messages, (message, key) => [ChallengeFilter[key], message])
);
