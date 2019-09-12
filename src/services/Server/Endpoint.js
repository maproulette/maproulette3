import { fetchContent,
         sendContent,
         deleteContent } from './Server'

/**
 * Endpoint represents a single API endpoint on the server. It is capable of
 * interacting with the data at that endpoint, including fetching, submitting,
 * updating, or deleting as appropriate based on the route. Response data will
 * be automatically normalized before Promise resolution if a
 * normalizationSchema is provided (or resolved raw if not).
 */
export default class Endpoint {
  /**
   * Construct a new Endpoint. An options object can be provided that may
   * contain the following options:
   *
   * {object} variables - any named variables required by the endpoint
   * {object} params - named params to be added as URL parameters
   * {object|array} schema - normalization schema to be used to normalize
   *                response data
   * {object} json - JSON body to be sent with the request
   * {FormData} formData - form data to be sent with the request (alternative
   *            to json)
   *
   * @param route - the desired route for this endpoint
   * @param {object} [options] - optional options object: see above.
   */
  constructor(route, options={}) {
    this.route = route
    this.normalizationSchema = options.schema
    this.variables = options.variables
    this.params = options.params
    this.jsonBody = options.json
    this.formData = options.formData
    this.expectXMLResponse = options.expectXMLResponse
  }

  /**
   * Executes the endpoint request and returns a Promise.
   *
   * @returns {Promise} Promise that resolves to the response data (normalized
   *          if a normalization schema was provided) or rejects on error.
   */
  execute = () => {
    switch(this.route.method) {
      case 'POST':
      case 'PUT':
        return sendContent(this.route.method,
                           this.url(),
                           this.jsonBody,
                           this.formData,
                           this.normalizationSchema,
                           this.expectXMLResponse)
      case 'DELETE':
        return deleteContent(this.url())
      default:
        return fetchContent(this.url(),
                            this.normalizationSchema,
                            {noCache: !!this.route.options.noCache})
    }
  }

  /**
   * url generates an absolute url string for this API endpoint,
   *
   * @returns an url string
   */
  url = () => this.route.url(this.variables, this.params)
}
