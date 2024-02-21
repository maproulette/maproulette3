import _get from 'lodash/get'
import _isString from 'lodash/isString'
import _cloneDeep from 'lodash/cloneDeep'
import _keys from 'lodash/keys'
import _values from 'lodash/values'
import _each from 'lodash/each'
import _isUndefined from 'lodash/isUndefined'
import _toInteger from 'lodash/toInteger'
import queryString from 'query-string'

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
  else return _cloneDeep(defaultCriteria)
}

/**
 * Builds a string suitable to use on a URL using the search
 * criteria provided. If a nested objects is provided (eg. filters)
 * then they key on th url will be dottted (eg. 'filters.projectId=')
 * eg. ?filters.projectId=8&invert.project=true&includeTags=true
 **/
export function buildSearchURL(searchCriteria) {
  const params = {}

  _each(_keys(searchCriteria), (key) => {
    if (typeof searchCriteria[key] === "object") {
      if (key === "boundingBox") {
        params.boundingBox = _values(searchCriteria.boundingBox).join()
      }
      else {
        _each(_keys(searchCriteria[key]), (subkey) => {
          if (!_isUndefined(searchCriteria[key][subkey]) &&
              searchCriteria[key][subkey] !== null) {
            // taskPropertySearch is a json object
            if (subkey === "taskPropertySearch") {
              params[`${key}.${subkey}`] =
                JSON.stringify(searchCriteria[key][subkey])
            }
            else {
              params[`${key}.${subkey}`] = searchCriteria[key][subkey]
            }
          }
        })
      }
    }
    else if (!_isUndefined(searchCriteria[key]) && searchCriteria[key] !== null) {
      params[key] = searchCriteria[key]
    }
  })

  return "?" + new URLSearchParams(params).toString()
}

/**
 * Takes a search url and rebuilds the search criteria.
 */
export function buildSearchCriteriafromURL(searchURL) {
  const parsedURL = queryString.parse(searchURL)
  const searchCriteria = {}

  const massageValue = value => {
    if (value === "true") {
      return true
    }
    else if (value === "false") {
      return false
    }
    else if (!isNaN(value)) {
      return _toInteger(value)
    }
    return value
  }

  _each(_keys(parsedURL), key => {
    const result = key.match(/(\w+)\.(\w+)/)
    if (result) {
      const primaryKey = result[1]
      const subkey = result[2]
      searchCriteria[primaryKey] = searchCriteria[primaryKey] || {}

      if (subkey === "taskPropertySearch") {
        searchCriteria[primaryKey][subkey] = JSON.parse(parsedURL[key])
      }
      else {
        searchCriteria[primaryKey][subkey] = massageValue(parsedURL[key])
      }
    }
    else {
      searchCriteria[key] = massageValue(parsedURL[key])
    }
  })

  return searchCriteria
}
