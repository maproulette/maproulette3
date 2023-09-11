import _isArray from 'lodash/isArray'
import _intersection from 'lodash/intersection'

/**
 * Determines if the given challenge passes the given categorization keywords filter.
 */
export const challengePassesCategorizationKeywordsFilter = function(filter, challenge) {
  let passing = true
    if (_isArray(filter.categorizationKeywords)) {
      filter.categorizationKeywords.map(key => {
        if(!challenge.tags.includes(key)){
          passing = false
        }
      })
    }
  
    return passing
  }