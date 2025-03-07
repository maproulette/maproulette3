import _cloneDeep from "lodash/cloneDeep";
import _isString from "lodash/isString";
import _toInteger from "lodash/toInteger";
import _values from "lodash/values";
import queryString from "query-string";

export function buildSearchCriteria(searchParams, defaultCriteria) {
  if (searchParams) {
    let sortBy = searchParams?.sortBy;
    let direction = searchParams?.direction;
    let filters = searchParams?.filters ?? {};
    const page = searchParams?.page;
    const boundingBox = searchParams.boundingBox;
    const savedChallengesOnly = searchParams.savedChallengesOnly;
    const excludeOtherReviewers = searchParams.excludeOtherReviewers;

    if (_isString(filters)) {
      filters = JSON.parse(searchParams.filters);
    }

    if (searchParams.sortCriteria) {
      sortBy = searchParams?.sortCriteria?.sortBy;
      direction = searchParams?.sortCriteria?.direction;
    }

    return {
      sortCriteria: { sortBy, direction },
      filters,
      page,
      boundingBox,
      savedChallengesOnly,
      excludeOtherReviewers,
    };
  } else return _cloneDeep(defaultCriteria);
}

/**
 * Builds a string suitable to use on a URL using the search
 * criteria provided. If a nested objects is provided (eg. filters)
 * then they key on th url will be dottted (eg. 'filters.projectId=')
 * eg. ?filters.projectId=8&invert.project=true&includeTags=true
 **/
export function buildSearchURL(searchCriteria) {
  const params = {};

  for (const key of Object.keys(searchCriteria || [])) {
    if (typeof searchCriteria[key] === "object") {
      if (key === "boundingBox") {
        params.boundingBox = _values(searchCriteria.boundingBox).join();
      } else {
        for (const subkey of Object.keys(searchCriteria[key] || [])) {
          if (searchCriteria[key][subkey] !== undefined && searchCriteria[key][subkey] !== null) {
            // taskPropertySearch is a json object
            if (subkey === "taskPropertySearch") {
              params[`${key}.${subkey}`] = JSON.stringify(searchCriteria[key][subkey]);
            } else {
              params[`${key}.${subkey}`] = searchCriteria[key][subkey];
            }
          }
        }
      }
    } else if (searchCriteria[key] !== undefined && searchCriteria[key] !== null) {
      params[key] = searchCriteria[key];
    }
  }

  return "?" + new URLSearchParams(params).toString();
}

/**
 * Takes a search url and rebuilds the search criteria.
 */
export function buildSearchCriteriafromURL(searchURL) {
  const parsedURL = queryString.parse(searchURL);
  const searchCriteria = {};

  const massageValue = (value) => {
    if (value === "true") {
      return true;
    } else if (value === "false") {
      return false;
    } else if (!isNaN(value)) {
      return _toInteger(value);
    }
    return value;
  };

  for (const key of Object.keys(parsedURL || [])) {
    const result = key.match(/(\w+)\.(\w+)/);
    if (result) {
      const primaryKey = result[1];
      const subkey = result[2];
      searchCriteria[primaryKey] = searchCriteria[primaryKey] || {};

      if (subkey === "taskPropertySearch") {
        searchCriteria[primaryKey][subkey] = JSON.parse(parsedURL[key]);
      } else {
        searchCriteria[primaryKey][subkey] = massageValue(parsedURL[key]);
      }
    } else {
      searchCriteria[key] = massageValue(parsedURL[key]);
    }
  }

  return searchCriteria;
}
