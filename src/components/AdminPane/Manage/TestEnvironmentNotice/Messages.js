import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with TaskUploadingProgress
 */
export default defineMessages({
  title: {
    id: 'Admin.testEnvironmentNotice.title',
    defaultMessage: "Testing Something?",
  },

  description: {
    id: 'Admin.testEnvironmentNotice.description',
    defaultMessage: "Consider using the [MapRoulette Staging Website](https://staging.maproulette.org), a clone of MapRoulette often used for development, where you can create test challenges, projects, and similar tasks."
  },  
})
