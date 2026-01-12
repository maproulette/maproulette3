/**
 * OSM API functions for fetching OpenStreetMap data
 */

const OSM_API_SERVER = 'https://www.openstreetmap.org'

/**
 * Maximum allowed area for OSM data requests (0.25 square degrees)
 * This matches the OSM API 0.6 map endpoint limit
 */
const MAX_OSM_AREA = 0.25

/**
 * Validate bounding box area against OSM API limits
 * @param bbox Bounding box string in format "minLon,minLat,maxLon,maxLat"
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateBBoxArea = (bbox: string): { isValid: boolean; error?: string } => {
  const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number)

  if (
    Number.isNaN(minLon) ||
    Number.isNaN(minLat) ||
    Number.isNaN(maxLon) ||
    Number.isNaN(maxLat)
  ) {
    return { isValid: false, error: 'Invalid bounding box format' }
  }

  const width = maxLon - minLon
  const height = maxLat - minLat
  const area = width * height

  if (area > MAX_OSM_AREA) {
    return {
      isValid: false,
      error: `The selected area is too large to load OSM data. Please zoom in further to view OSM features. Maximum area: ${MAX_OSM_AREA} square degrees. Current area: ${area.toFixed(4)} square degrees.`,
    }
  }

  return { isValid: true }
}

/**
 * Fetch OSM XML data for a bounding box
 * @param bbox Bounding box string in format "minLon,minLat,maxLon,maxLat"
 * @returns Promise resolving to parsed XML Document
 * @throws Error if bounding box area exceeds limits or fetch fails
 */
export const fetchOSMData = async (bbox: string): Promise<Document> => {
  const validation = validateBBoxArea(bbox)
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid bounding box')
  }

  const uri = `${OSM_API_SERVER}/api/0.6/map?bbox=${bbox}`

  try {
    const response = await fetch(uri)
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(
          'The selected area is too large to load OSM data. Please zoom in further to view OSM features.'
        )
      }
      throw new Error(`Failed to fetch OSM data: ${response.status} ${response.statusText}`)
    }

    const rawXML = await response.text()
    const parser = new DOMParser()
    return parser.parseFromString(rawXML, 'application/xml')
  } catch (error) {
    console.error('Error fetching OSM data:', error)
    throw error
  }
}

/**
 * Convert map bounds to OSM API bbox string
 * @param bounds MapLibre bounds object
 * @returns Bounding box string "minLon,minLat,maxLon,maxLat"
 */
export const getBBoxString = (bounds: {
  getWest: () => number
  getSouth: () => number
  getEast: () => number
  getNorth: () => number
}): string => {
  return `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`
}
