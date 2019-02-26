import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with SubscriptionType
 */
export default defineMessages({
  ignore: {
    id: "Subscription.type.ignore",
    defaultMessage: "Ignore"
  },

  noEmail: {
    id: "Subscription.type.noEmail",
    defaultMessage: "Receive but do not email"
  },

  immediateEmail: {
    id: "Subscription.type.immediateEmail",
    defaultMessage: "Receive and email immediately"
  },

  digestEmail: {
    id: "Subscription.type.dailyEmail",
    defaultMessage: "Receive and email daily"
  },
})
