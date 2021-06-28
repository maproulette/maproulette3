import _map from "lodash/map";
import _invert from "lodash/invert";
import _fromPairs from "lodash/fromPairs";
import messages, { subscriptionFrequencyMessages } from "./Messages";

// These statuses are defined on the server
export const NOTIFICATION_IGNORE = 0; // ignore notification
export const NOTIFICATION_EMAIL_NONE = 1; // no email desired
export const NOTIFICATION_EMAIL_IMMEDIATE = 2; // send email immediately
export const NOTIFICATION_EMAIL_DIGEST = 3; // include in daily digest

export const NOTIFICATION_DAILY = 5; // daily email
export const NOTIFICATION_WEEKLY = 6; // weekly email

export const SubscriptionType = Object.freeze({
  ignore: NOTIFICATION_IGNORE,
  noEmail: NOTIFICATION_EMAIL_NONE,
  immediateEmail: NOTIFICATION_EMAIL_IMMEDIATE,
  digestEmail: NOTIFICATION_EMAIL_DIGEST,
});

export const SubscriptionFrequencyType = Object.freeze({
  ignore: NOTIFICATION_IGNORE,
  dailyEmail: NOTIFICATION_DAILY,
  weeklyEmail: NOTIFICATION_WEEKLY,
});

export const keysBySubscriptionType = Object.freeze(_invert(SubscriptionType));
export const keysBySubscriptionFrequencyType = Object.freeze(
  _invert(SubscriptionFrequencyType)
);

/**
 * Returns an object mapping status values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesBySubscriptionType = _fromPairs(
  _map(messages, (message, key) => [SubscriptionType[key], message])
);

export const messagesBySubscriptionFrequencyType = _fromPairs(
  _map(subscriptionFrequencyMessages, (message, key) => [
    SubscriptionType[key],
    message,
  ])
);

/** Returns object containing localized labels  */
export const subscriptionTypeLabels = (intl) =>
  _fromPairs(
    _map(messages, (message, key) => [key, intl.formatMessage(message)])
  );

export const subscriptionFrequencyTypeLabels = (intl) =>
  _fromPairs(
    _map(subscriptionFrequencyMessages, (message, key) => [
      key,
      intl.formatMessage(message),
    ])
  );
