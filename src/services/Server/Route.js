import { routeMatcher } from 'route-matcher'
import QueryString from 'query-string'
import _isEmpty from 'lodash/isEmpty'

/**
 * Represents a single API route. Variable substitution in route paths is
 * handled by the route-matcher package.
 *
 * @param {string} baseURL - the base url of the API server
 * @param {string} apiVersion - version of the API this route corresponds with
 * @param {string} routePath - the route path, which can include named
 *        variables. Should *not* begin with a leading slash.
 * @param {string} [method=GET] - request method, defaults to 'GET'
 *
 * @see See [route-matcher](https://github.com/cowboy/javascript-route-matcher)
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class Route {
  constructor(baseURL, apiVersion, routePath, method='GET', options={}) {
    this.rawPath = routePath
    this.baseURL = baseURL
    this.route = routeMatcher(`/api/${apiVersion}${routePath}`)
    this.method = method
    this.options = options
  }

  /**
   * generates an absolute url string for this route, substituting in any
   * given named variables (as defined by the route path) and adding on
   * any given named parameters.
   *
   * @param {object} [variables] - named variables required by this route
   * @param {object} [params] - named params to be added as url parameters
   *
   * @returns {string} an url string
   */
  url = (variables, params) => {
    const urlString = this.baseURL + this.route.stringify(variables)

    return _isEmpty(params) ?
           urlString :
           `${urlString}?${QueryString.stringify(params)}`
  }
}
