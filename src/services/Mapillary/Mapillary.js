import _isEmpty from 'lodash/isEmpty'
import _isArray from 'lodash/isArray'
import _isFinite from 'lodash/isFinite'

const EMBED_URI_V4='https://www.mapillary.com/embed'
const IMAGES_URI_V4='https://graph.mapillary.com/images'
export const imageCache = new Map()

/**
 * Returns true if Mapillary support is enabled (a Mapillary client token has been
 * configured), false if not
 */
export const isMapillaryEnabled = function() {
  return !_isEmpty(window.env.REACT_APP_MAPILLARY_CLIENT_TOKEN)
}

/**
 * Fetch Mapillary images of interest. Images are limited to the given WSEN
 * bbox and will start with imagery closest to the given point, if provided.
 * If a Lng,Lat point is given and then imagery closest to the point will be
 * loaded first. If lookAt is true, then images that include imagery of the
 * given point will be requested. Returns a result object with `geojson` and
 * `context` fields. If an additional page of results is needed, the context
 * will need to be passed to `nextMapillaryPage`
 */
export const fetchMapillaryImages = async function(bbox, point=null, radius=250, lookAt=false, pageSize=100) {
  if (!isMapillaryEnabled()) {
    throw new Error("Missing Mapillary client token")
  }

  const cacheKey = JSON.stringify({ bbox, point, radius, lookAt, pageSize })
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)
  }

  try {
    // bbox and point can be either arrays or strings with comma-separated coordinates
    const params = [`bbox=${_isArray(bbox) ? bbox.join(',') : bbox}`]
    if (point) {
      params.push(`closeto=${_isArray(point) ? point.join(',') : point}`)

      if (_isFinite(radius)) {
        params.push(`radius=${radius}`)
      }

      if (lookAt) {
        params.push(`lookat=${_isArray(point) ? point.join(',') : point}`)
      }
    }
    params.push(`limit=${pageSize}`)
    params.push(`access_token=${window.env.REACT_APP_MAPILLARY_CLIENT_TOKEN}`)

    const result = await executeMapillaryImageFetch(`${IMAGES_URI_V4}?${params.join('&')}`)
    imageCache.set(cacheKey, result) // Cache the result
    return result
  } catch (error) {
    console.error('Error fetching Mapillary images:', error)
    throw new Error('Unable to fetch Mapillary images. Please try again.')
  }
}

/**
 * Returns true if an additional page of Mapillary results is available based
 * on the given result context, false otherwise
 */
export const hasMoreMapillaryResults = function(resultContext) {
  return !!nextMapillaryPageUrl(resultContext)
}

/**
 * Fetch the next page of Mapillary images using the result context from a
 * prior retrieval, if available. Returns a result object with `geojson` and `context`
 * fields, or null if there was no additional page of results. If a subsequent
 * page of results is needed, the context in the result object will need to be
 * passed to this method on the subsequent call
 */
export const nextMapillaryPage = async function(resultContext) {
  try {
    const nextPageUrl = nextMapillaryPageUrl(resultContext);
    if (!nextPageUrl) {
      return null;
    }

    return await executeMapillaryImageFetch(nextPageUrl);
  } catch (error) {
    console.error('Error fetching next Mapillary page:', error);
    throw new Error('Unable to fetch next page of Mapillary images.');
  }
}

/**
 * Generates a Mapillary URL for a specific image based on the given image key
 * and desired size. Acceptable image sizes are 320, 640, 1024, and 2048
 */
export const mapillaryImageUrl = function(imageId) {
  return `${EMBED_URI_V4}?image_key=${imageId}`
}

/**
 * Extract the URL for the next page of Mapillary results from the given result
 * context object and return it, or null if there is no next page of results
 */
export const nextMapillaryPageUrl = function(resultContext) {
  try {
    if (!resultContext || !resultContext.link) {
      return null;
    }

    const parseLinkHeader = (linkHeader) => {
      const links = {};
      console.log('Link Header:', linkHeader);

      if (linkHeader) {
        linkHeader.split(',').forEach(link => {
          const match = link.match(/<([^>]+)>\s*rel="([^"]+)"/);
          if (match) {
            const url = match[1];
            const rel = match[2];
            links[rel] = { url };
          }
        });
      }

      console.log('Parsed Links:', links);
      return links;
    };

    const linkHeader = resultContext.link;
    const links = parseLinkHeader(linkHeader);

    if (!links.next) {
      return null;
    }

    return links.next.url;
  } catch (error) {
    console.error('Error extracting next Mapillary page URL:', error);
    return null;
  }
}

/**
 * Retrieve the active access token
 */
export const getAccessToken = function() {
  return window.env.REACT_APP_MAPILLARY_CLIENT_TOKEN
}

/**
 * Fetches Mapillary results from the given URL and returns a result object
 * with `geojson` and `context` fields on success
 */
const executeMapillaryImageFetch = async function(mapillaryUrl) {
  try {
    const response = await fetch(mapillaryUrl)
    if (!response.ok) {
      const errorDetails = await response.text()
      console.error(`Failed to fetch data from Mapillary: ${response.status} - ${errorDetails}`)
      throw new Error(`Failed to fetch data from Mapillary: ${response.status}`)
    }
    const result = {
      context: {
        link: response.headers.get('link'), // used for pagination
      },
      geojson: await response.json(),
    }
    return result
  } catch (error) {
    console.error('Error executing Mapillary image fetch:', error)
    throw new Error('Unable to fetch data from Mapillary. Please check the URL or your network connection.')
  }
}
