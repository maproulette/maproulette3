import _isArray from 'lodash/isArray'
import _intersection from 'lodash/intersection'

/**
 * Determines if the given challenge passes the given categorization keywords filter.
 */
export const challengePassesCategorizationKeywordsFilter = function(filter, challenge) {
    if (_isArray(filter.categorizationKeywords)) {
      // Any matching keyword is a pass
      return _intersection(filter.categorizationKeywords, challenge.tags).length > 0
    }
  
    return true
  }