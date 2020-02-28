import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with Sort.
 */
export default defineMessages({
  name: {
    id: "Challenge.sort.name",
    defaultMessage: "Name",
  },
  created: {
    id: "Challenge.sort.created",
    defaultMessage: "Newest",
  },
  Created: {
    id: "Challenge.sort.oldest",
    defaultMessage: "Oldest",
  },
  popularity: {
    id: "Challenge.sort.popularity",
    defaultMessage: "Popular",
  },
  has_suggested_fixes: {
    id: "Challenge.sort.suggestedFix",
    defaultMessage: "Quick Fix",
  },
  default: {
    id: "Challenge.sort.default",
    defaultMessage: "Default",
  },
})
