/**
 * Location Service
 *
 * Provides geocoding functionality to convert location names to bounding boxes using Nominatim
 */

export type BBox = [number, number, number, number] // [minLon, minLat, maxLon, maxLat]

interface NominatimResponse {
  boundingbox?: string[]
  display_name?: string
  lat?: string
  lon?: string
}

/**
 * Geocode a place name using Nominatim (OpenStreetMap)
 *
 * @param place - The name of the location to geocode
 * @returns BBox [minLon, minLat, maxLon, maxLat] or undefined if not found
 */
export const geocodePlace = async (place: string): Promise<BBox | undefined> => {
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=5`
    )

    if (!resp.ok) {
      console.warn(`Nominatim geocoding failed for "${place}": ${resp.status}`)
      return undefined
    }

    const data: NominatimResponse[] = await resp.json()
    if (!data?.[0]?.boundingbox) return undefined

    const [minLat, maxLat, minLon, maxLon] = data[0].boundingbox.map(Number)
    return [minLon, minLat, maxLon, maxLat] as BBox
  } catch (error) {
    console.error(`Error geocoding "${place}":`, error)
    return undefined
  }
}
