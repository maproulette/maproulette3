import _isArray from 'lodash/isArray'
import _get from 'lodash/get'
import _map from 'lodash/map'
import _fromPairs from 'lodash/fromPairs'
import _flatten from 'lodash/flatten'
import _keys from 'lodash/keys'
import _values from 'lodash/values'
import _find from 'lodash/find'
import _intersection from 'lodash/intersection'
import _isEmpty from 'lodash/isEmpty'
import _startCase from 'lodash/startCase'
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
 * Custom keyword categories setup in .env
 *
 * Expected format is: {
 *   customCategory1: {
 *     keywords: [keyword1, keyword2, ..., keywordN],
 *     label: "Category1 Display Name", // optional label
 *   },
 *   customCategory2: {
 *     keywords: [keyword], // array expected even for single keyword
 *     label: "Category2 Display Name",
 *   }
 * }
 */
export let customCategoryKeywords = {}
const customCategoryJson = _get(process.env, 'REACT_APP_CUSTOM_KEYWORD_CATEGORIES')
if (!_isEmpty(customCategoryJson)) {
  try {
    customCategoryKeywords = JSON.parse(customCategoryJson)
  }
  catch(error) {
    console.log(error)
  }
}

/**
 * Object representing combination of standard keyword categories and any custom categories.
 */
export const combinedCategoryKeywords =
  Object.assign(
    {},
    _fromPairs(_map(customCategoryKeywords, (category, key) => [key, category.keywords])),
    ChallengeCategoryKeywords
  )

/**
 * Returns object containing localized labels for standard keyword categories.
 * Set includeCustom=true to also include custom keyword labels.
 */
export const keywordLabels = (intl, includeCustom=false) => {
  let labels = _map(messages, (message, key) => [key, intl.formatMessage(message)])

  if (includeCustom) {
    labels = labels.concat(
      _map(customCategoryKeywords,
           (customCategory, key) => [key, customCategory.label || _startCase(key)]
      )
    )
  }

  return _fromPairs(labels)
}

/**
 * Returns object containing localized labels for custom keyword categories
 */
export const customKeywordLabels = intl => _fromPairs(
  _map(customCategoryKeywords, (customCategory, key) =>
    [key, customCategory.label || _startCase(key)]
  )
)

/** An array of all keywords referenced by a category */
export const rawCategoryKeywords = _flatten(_values(ChallengeCategoryKeywords))

/**
 * Returns the category containing keywords that match any of the given
 * keywords, or 'other' if none match. Set includeCustom=true to include any
 * custom keyword categories in the search as well.
 */
export const categoryMatchingKeywords = function(keywords, includeCustom=false) {
  const keywordArray = _isArray(keywords) ? keywords : [keywords]

  let matchingCategory =
    _find(_keys(ChallengeCategoryKeywords), category =>
      _intersection(ChallengeCategoryKeywords[category],
                    keywordArray).length > 0
    )

  // Search custom keywords as well, if needed and requested. They have a slightly
  // different structure to support customization.
  if (!matchingCategory && includeCustom) {
    matchingCategory = _find(_keys(customCategoryKeywords), category =>
      _intersection(customCategoryKeywords[category].keywords,
                    keywordArray).length > 0
    )
  }

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
