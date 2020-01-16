import _get from 'lodash/get'
import _isString from 'lodash/isString'

export function buildSearchCriteria(searchParams, defaultCriteria) {
  if (searchParams) {
    let sortBy = _get(searchParams, 'sortBy')
    let direction = _get(searchParams, 'direction')
    let filters = _get(searchParams, 'filters', {})
    const page = _get(searchParams, 'page')
    const boundingBox = searchParams.boundingBox
    const savedChallengesOnly = searchParams.savedChallengesOnly
    const excludeOtherReviewers = searchParams.excludeOtherReviewers

    if (_isString(filters)) {
      filters = JSON.parse(searchParams.filters)
    }

    if (searchParams.sortCriteria) {
      sortBy = _get(searchParams, 'sortCriteria.sortBy')
      direction = _get(searchParams, 'sortCriteria.direction')
    }

    return {sortCriteria: {sortBy, direction}, filters, page, boundingBox,
            savedChallengesOnly, excludeOtherReviewers}
  }
  else return defaultCriteria
}
