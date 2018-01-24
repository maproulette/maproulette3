/**
 * Utility functions for interacting with MapRoulette server data, including
 * fetchEndpoint, submitEndpoint, updateEndpoint, and deleteEndpoint functions
 * for retrieving and managing server content.
 *
 * @see See Server/Endpoints
 */

import { normalize } from 'normalizr'
import { isArray as _isArray } from 'lodash'
import RouteFactory from './RouteFactory'
import apiRoutes from './APIRoutes'

const baseURL = process.env.REACT_APP_MAP_ROULETTE_SERVER_URL

export const serverRouteFactory = new RouteFactory(baseURL)
export const defaultRoutes = Object.freeze(apiRoutes(serverRouteFactory))

/**
 * fetchContent fetches content from the given url, and return a promise that
 * resolves with the JSON response (pre-normalized with the optional
 * normalizationSchema if provided) or rejects on error.
 *
 * @param {string} url
 * @param [normalizationSchema] - optional schema for normalizing json response
 *
 * @returns {Promise} Promise that resolves with response data or rejects on
 *          error
 */
export const fetchContent = function(url, normalizationSchema) {
  return new Promise((resolve, reject) => {
    fetch(url, {credentials: 'same-origin'}).then(checkStatus).then(parseJSON).then(jsonData => {
      if (jsonData && normalizationSchema) {
        resolve(normalize(jsonData, normalizationSchema))
      }
      else {
        resolve(jsonData)
      }
    })
    .catch((error) => {
      // 404 is used by the scala server to indicate no results. Treat as
      // successful response with empty data.
      if (error.response && error.response.status === 404) {
        resolve(normalize(_isArray(normalizationSchema) ? [] : {}, normalizationSchema))
      }
      else {
        reject(error)
      }
    })
  })
}

/**
 * sendContent sends JSON content to the given url, and return a promise that
 * resolves with the JSON response (pre-normalized with the optional
 * normalizationSchema if provided) or rejects on error.
 *
 * @param {string} method - 'POST' or 'PUT'
 * @param {string} url
 * @param {Object} [jsonBody] - optional JSON data to include with request
 * @param [normalizationSchema] - optional schema for normalizing json response
 *
 * @returns {Promise} Promise that resolves with response data or rejects on
 *          error
 */
export const sendContent = function(method, url, jsonBody, normalizationSchema) {
  return new Promise((resolve, reject) => {
    const headers = new Headers()
    if (jsonBody) {
      headers.append('Content-Type', 'text/json')
    }

    fetch(url, {
      method,
      credentials: 'same-origin',
      headers,
      body: jsonBody ? JSON.stringify(jsonBody) : undefined,
    }).then(checkStatus).then(parseJSON).then(jsonData => {
      if (jsonData && normalizationSchema) {
        resolve(normalize(jsonData, normalizationSchema))
      }
      else {
        resolve(jsonData)
      }
    }).catch(error => reject(error))
  })
}

/**
 * deleteContent sends a DELETE to the given url. Returns a promise that
 * resolves to successful response or rejects if there is an error.
 *
 * @param {string} url
 *
 * @returns {Promise} Promise that resolves to the response or rejects on error
 */
export const deleteContent = function(url) {
  return new Promise((resolve, reject) => {
    fetch(url, {method: 'DELETE', credentials: 'same-origin'})
      .then(checkStatus)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}


/**
 * checkStatus evaluates the given response and throws an error for non-2xx
 * responses, or otherwise just returns the response on success.
 *
 * @param response
 *
 * @returns the given response on success
 */
const checkStatus = function(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  else {
    const error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

/**
 * parseJson retrieves the JSON payload from the given response.
 *
 * @param response
 *
 * @returns null if there is no content (204) or if the response content-type
 *          isn't json
 */
const parseJSON = function(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type')
  if (!contentType || contentType.indexOf('application/json') === -1) {
    return null
  }

  return response.json()
}
