import _get from 'lodash/get'
import _isUndefined from 'lodash/isUndefined'
import WithSearch from '../WithSearch/WithSearch'
import { extendedFind } from '../../../services/Challenge/Challenge'

const SEARCH_GROUP = 'challenges'

/**
 * Adapts the query object passed from WithSearch to the object
 * expected by extendedFind functions
 */
const buildCriteria = query => {
  const sortCriteria = _get(query, "sort", {})
  const filters = _get(query, "filters", {})
  const queryString = _get(query, "query")
  let bounds = null

  if (filters && !_isUndefined(filters.location)) {
    bounds = _get(query, "mapBounds.bounds")
  }

  return {searchQuery: queryString, filters, sortCriteria, bounds}
}

const performChallengeSearch = query => {
  return extendedFind(buildCriteria(query))
}

export default (WrappedComponent) => {
  return WithSearch(WrappedComponent, SEARCH_GROUP, performChallengeSearch)
}
