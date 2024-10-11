import _isArray from 'lodash/isArray'
import _each from 'lodash/each'

const API_URI='https://openstreetcam.org/1.0'

/**
 * Returns true if OpenStreetCam support is enabled (an OpenStreetCam client id has been
 * configured), false if not
 */
export const isOpenStreetCamEnabled = function() {
  return window.env.REACT_APP_IMAGERY_OPENSTREETCAM === 'enabled'
}

/**
 * Fetch OpenStreetCam images of interest. Images are limited to the given WSEN
 * bbox and will start with imagery closest to the given point, if provided.
 * If a Lng,Lat point is given and then imagery closest to the point will be
 * loaded first. If lookAt is true, then images that include imagery of the
 * given point will be requested. Returns a result object with `geojson` and
 * `context` fields. If an additional page of results is needed, the context
 * will need to be passed to `nextOpenStreetCamPage`
 */
export const fetchOpenStreetCamImages = async function(bbox, pageSize=1000, page=1) {
  if (!isOpenStreetCamEnabled()) {
    throw new Error("OpenStreetCam is not enabled")
  }

  // bbox and point can be either arrays or strings with comma-separated coordinates
  const bounds = _isArray(bbox) ? bbox : bbox.split(',')
  const formData = new FormData()
  formData.append('bbBottomRight', `${bounds[1]},${bounds[2]}`)
  formData.append('bbTopLeft', `${bounds[3]},${bounds[0]}`)
  formData.append('pp', pageSize)
  formData.append('page', page)

  return executeOpenStreetCamImageFetch(formData)
}

/**
 * Returns true if an additional page of OpenStreetCam results is available based
 * on the given result context, false otherwise
 */
export const hasMoreOpenStreetCamResults = function(resultContext) {
  return parseInt(resultContext.params.page) * parseInt(resultContext.params.pp) <
         parseInt(resultContext.totalFilteredItems)
}

/**
 * Fetch the next page of OpenStreetCam images using the result context from a
 * prior retrieval. Returns a result object with `currentPageItems` and `context`
 * fields, or null if there was no additional page of results. If a subsequent
 * page of results is needed, the context in the result object will need to be
 * passed to this method on the subsequent call
 */
export const nextOpenStreetCamPage = async function(resultContext) {
  if (!hasMoreOpenStreetCamResults(resultContext)) {
    return null
  }

  const nextPageFormData = objectToFormData(resultContext.params)
  nextPageFormData.set('page', parseInt(nextPageFormData.get('page')) + 1)
  return executeOpenStreetCamImageFetch(nextPageFormData)
}

/**
 * Generates a OpenStreetCam URL for a specific image based on the given image
 * item and desired size. OpenStreetCam supports thumbnails in two sizes: '200'
 * and '1280'
 */
export const openStreetCamImageUrl = function(imageItem, size='200') {
  const name = (size === '1280' ? imageItem.th_name : imageItem.lth_name)
  // Format of thumbnail name is machine/path. For example, name:
  // `storage11/files/photo/2019/6/6/proc/1469233_ce36f_221.jpg`
  // should become URL:
  // `storage11.openstreetcam.org/files/photo/2019/6/6/proc/1469233_ce36f_221.jpg`
  const separator = name.indexOf('/')
  const machine = name.slice(0, separator)
  const path = name.slice(separator)
  return `https://${machine}.openstreetcam.org${path}`
}

/**
 * Fetches OpenStreetCam results from the given URL and returns a result object
 * with `currentPageItems` and `context` fields on success
 */
const executeOpenStreetCamImageFetch = async function(formData) {
  const url = `${API_URI}/list/nearby-photos/`
  const response = await fetch(url, { method: 'POST', body: formData })
  if (response.ok) {
    const responseBody = await response.json()
    return {
      context: {
        params: formDataToObject(formData),
        totalFilteredItems: responseBody.totalFilteredItems[0],
      },
      currentPageItems: responseBody.currentPageItems
    }
  }
  else {
    throw new Error("Failed to fetch data from OpenStreetCam")
  }
}

/**
 * Utility function that converts a simple FormData to a plain object
 */
const formDataToObject = function(formData) {
  const result = {}
  for (const [key, value] of formData.entries()) {
    result[key] = value
  }

  return result
}

/**
 * Utility function that converts a plain object to a FormData
 */
const objectToFormData = function(serialized) {
  const formData = new FormData()
  _each(serialized, (value, key) => formData.set(key, value))
  return formData
}
