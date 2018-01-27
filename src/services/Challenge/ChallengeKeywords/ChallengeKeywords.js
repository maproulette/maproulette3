import { isArray as _isArray,
         map as _map,
         fromPairs as _fromPairs,
         flatten as _flatten,
         keys as _keys,
         values as _values,
         find as _find,
         intersection as _intersection } from 'lodash'
import messages from './Messages'

export const CHALLENGE_CATEGORY_NAVIGATION = "navigation"
export const CHALLENGE_CATEGORY_WATER = "water"
export const CHALLENGE_CATEGORY_POINTS_OF_INTEREST = "pointsOfInterest"
export const CHALLENGE_CATEGORY_BUILDINGS = "buildings"
export const CHALLENGE_CATEGORY_LAND_USE = "landUse"
export const CHALLENGE_CATEGORY_TRANSIT = "transit"
export const CHALLENGE_CATEGORY_OTHER = "other"

/**
 * Categories are groupings of one or more keywords that serve to
 * provide a high-level starting point for new users looking to
 * find challenges of interest. Rather than require users to know
 * which keywords to search for, they can instead select a
 * high-level category to narrow down challenges.
 *
 * Values should be arrays. Use empty array for no keywords.
 */
export const ChallengeCategoryKeywords = {
  [CHALLENGE_CATEGORY_NAVIGATION]: ["highway"],
  [CHALLENGE_CATEGORY_WATER]: ["natural", "water"],
  [CHALLENGE_CATEGORY_POINTS_OF_INTEREST]: ["amenity", "leisure"],
  [CHALLENGE_CATEGORY_BUILDINGS]: ["building"],
  [CHALLENGE_CATEGORY_LAND_USE]: ["landuse", "boundary"],
  [CHALLENGE_CATEGORY_TRANSIT]: ["railway", "public_transport"],
  [CHALLENGE_CATEGORY_OTHER]: [],
}

/**
 * Returns an object mapping difficulty values to raw internationalized
 * messages suitable for use with FormattedMessage or formatMessage.
 */
export const messagesByKeyword = _fromPairs(
  _map(messages, (message, key) => [ChallengeCategoryKeywords[key], message])
)

/** Returns object containing localized labels  */
export const keywordLabels = intl => _fromPairs(
  _map(messages, (message, key) => [key, intl.formatMessage(message)])
)

/** An array of all keywords referenced by a category */
export const rawCategoryKeywords = _flatten(_values(ChallengeCategoryKeywords))

/**
 * Returns the category containing keywords that match any of the given
 * keywords, or 'other' if none match.
 */
export const categoryMatchingKeywords = function(keywords) {
  const keywordArray = _isArray(keywords) ? keywords : [keywords]

  const matchingCategory =
    _find(_keys(ChallengeCategoryKeywords), category => {
      return _intersection(ChallengeCategoryKeywords[category],
                           keywordArray).length > 0
    })

  return matchingCategory ? matchingCategory : 'other'
}

/**
 * Determines if the given challenge passes the given keywords filter.
 */
export const challengePassesKeywordFilter = function(filter, challenge, props) {
  if (_isArray(filter.keywords)) {
    // Any matching keyword is a pass
    return _intersection(filter.keywords, challenge.tags).length > 0
  }

  return true
}
