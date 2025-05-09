import _fromPairs from "lodash/fromPairs";
import _invert from "lodash/invert";
import _map from "lodash/map";
import messages from "./Messages";

// Constants defined on the server
export const ITEM_TYPE_PROJECT = 0;
export const ITEM_TYPE_CHALLENGE = 1;
export const ITEM_TYPE_TASK = 2;
export const ITEM_TYPE_TAG = 3;
export const ITEM_TYPE_SURVEY = 4;
export const ITEM_TYPE_USER = 5;
export const ITEM_TYPE_GROUP = 6;
export const ITEM_TYPE_VIRTUAL_CHALLENGE = 7;
export const ITEM_TYPE_BUNDLE = 8;
export const ITEM_TYPE_GRANT = 9;

export const ActivityItemType = Object.freeze({
  project: ITEM_TYPE_PROJECT,
  challenge: ITEM_TYPE_CHALLENGE,
  task: ITEM_TYPE_TASK,
  tag: ITEM_TYPE_TAG,
  survey: ITEM_TYPE_SURVEY,
  user: ITEM_TYPE_USER,
  group: ITEM_TYPE_GROUP,
  virtualChallenge: ITEM_TYPE_VIRTUAL_CHALLENGE,
  bundle: ITEM_TYPE_BUNDLE,
  grant: ITEM_TYPE_GRANT,
});

export const keysByType = Object.freeze(_invert(ActivityItemType));

/**
 * Returns an object mapping difficulty values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByType = _fromPairs(
  _map(messages, (message, key) => [ActivityItemType[key], message]),
);

/** Returns object containing localized labels  */
export const typeLabels = (intl) =>
  _fromPairs(_map(messages, (message, key) => [key, intl.formatMessage(message)]));
