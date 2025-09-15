import _fromPairs from "lodash/fromPairs";
import _map from "lodash/map";
import messages from "./Messages";

export const ChallengeFilter = {
  visible: "visible",
  pinned: "pinned",
  archived: "archived",
};

export const challengePassesFilters = function (challenge, manager, pins, challengeFilters) {
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
  _map(messages, (message, key) => [ChallengeFilter[key], message]),
);
