import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskLoadMethod
 */
export default defineMessages({
  random: {
    id: 'Task.loadByMethod.random',
    defaultMessage: "Random",
  },

  proximity: {
    id: 'Task.loadByMethod.proximity',
    defaultMessage: "Nearby",
  },
})
