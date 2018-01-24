import Route from './Route'

/**
 * Factory for generating Route instances that share a common base URL and API
 * version.
 *
 * @param {string} baseURL - the base url of the API server
 * @param {string} apiVersion - version of the API this route corresponds with
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export default class RouteFactory {
  /**
   * Construct a new factory with the given base URL and API version. All
   * generates routes with populated with these.
   *
   * @param {string} baseURL - the base url of the API server
   * @param {string} apiVersion - version of the API the routes corresponds
   *        with
   */
  constructor(baseURL, apiVersion) {
    this.baseURL = baseURL
    this.apiVersion = apiVersion
  }

  setAPIVersion = (apiVersion) => this.apiVersion = apiVersion

  /**
   * Generates a Route instance for the given path
   *
   * @param {string} path - the route path
   * @param {string} [method=GET] - request method, defaults to 'GET'
   *
   * @returns {APIRoute} an APIRoute instance
   */
  route = (path, method='GET') =>
    new Route(this.baseURL, this.apiVersion, path, method)

  get = path => this.route(path, 'GET')

  post = path => this.route(path, 'POST')

  put = path => this.route(path, 'PUT')

  delete = path => this.route(path, 'DELETE')
}
