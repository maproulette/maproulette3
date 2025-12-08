import { useCallback, useEffect, useState } from 'react'

export interface PlaceSuggestion {
  display_name: string
  place_id: string
  type?: string
  importance?: number
  boundingbox?: string[]
}

export interface PlaceDetail {
  display_name: string
  boundingbox?: string[]
  geojson?:
    | {
        type: 'Polygon'
        coordinates: number[][][]
      }
    | {
        type: 'MultiPolygon'
        coordinates: number[][][][]
      }
}

interface UseLocationSearchOptions {
  debounceMs?: number
  minQueryLength?: number
}

interface UseLocationSearchReturn {
  suggestions: PlaceSuggestion[]
  isSearching: boolean
  error: string
  searchLocations: (query: string) => void
  getLocationDetails: (suggestion: PlaceSuggestion) => Promise<PlaceDetail | null>
  getLocationById: (placeId: number) => Promise<PlaceDetail | null>
  clearSuggestions: () => void
  clearError: () => void
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'MapRoulette/4.0'

export const useLocationSearch = (
  options: UseLocationSearchOptions = {}
): UseLocationSearchReturn => {
  const { debounceMs = 400, minQueryLength = 3 } = options

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')

  useEffect(() => {
    if (currentQuery.length < minQueryLength) {
      setSuggestions([])
      setError('')
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true)
      setError('')

      try {
        const response = await fetch(
          `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(currentQuery)}&limit=8&addressdetails=1`,
          {
            headers: { 'User-Agent': USER_AGENT },
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.length === 0) {
            setError('No locations found. Try a different search term.')
          }
          setSuggestions(data)
        } else {
          setError('Failed to fetch locations. Please try again.')
        }
      } catch (err) {
        console.error('Error fetching location suggestions:', err)
        setError('Network error. Please check your connection.')
      } finally {
        setIsSearching(false)
      }
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [currentQuery, debounceMs, minQueryLength])

  const searchLocations = useCallback((query: string) => {
    setCurrentQuery(query)
  }, [])

  const getLocationDetails = useCallback(
    async (suggestion: PlaceSuggestion): Promise<PlaceDetail | null> => {
      try {
        const response = await fetch(
          `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(suggestion.display_name)}&polygon_geojson=1&format=jsonv2&limit=1`,
          {
            headers: { 'User-Agent': USER_AGENT },
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch location details')
        }

        const data: PlaceDetail[] = await response.json()
        return data[0] || null
      } catch (err) {
        console.error('Error fetching location details:', err)
        setError('Failed to load location geometry')
        return null
      }
    },
    []
  )

  const getLocationById = useCallback(async (placeId: number): Promise<PlaceDetail | null> => {
    try {
      const detailsResponse = await fetch(
        `${NOMINATIM_BASE_URL}/details?place_id=${placeId}&format=json`,
        {
          headers: { 'User-Agent': USER_AGENT },
        }
      )

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch location details')
      }

      const detailData = await detailsResponse.json()

      if (!detailData) {
        setError('Location not found')
        return null
      }

      const locationName = detailData.names?.name || detailData.localname || 'Unknown Location'

      if (detailData.osm_type && detailData.osm_id) {
        const osmTypePrefix =
          detailData.osm_type === 'node' ? 'N' : detailData.osm_type === 'way' ? 'W' : 'R'

        const lookupResponse = await fetch(
          `${NOMINATIM_BASE_URL}/lookup?osm_ids=${osmTypePrefix}${detailData.osm_id}&format=json&polygon_geojson=1`,
          {
            headers: { 'User-Agent': USER_AGENT },
          }
        )

        if (lookupResponse.ok) {
          const lookupData: PlaceDetail[] = await lookupResponse.json()
          const place = lookupData[0]

          if (place) {
            return {
              display_name: place.display_name || locationName,
              boundingbox: place.boundingbox,
              geojson: place.geojson,
            }
          }
        }
      }

      if (detailData.centroid?.geometry?.coordinates) {
        const [lon, lat] = detailData.centroid.geometry.coordinates
        const padding = 0.01

        return {
          display_name: locationName,
          boundingbox: [
            String(lat - padding),
            String(lat + padding),
            String(lon - padding),
            String(lon + padding),
          ],
        }
      }

      return { display_name: locationName }
    } catch (err) {
      console.error('Error loading location by ID:', err)
      setError('Failed to load location from URL')
      return null
    }
  }, [])

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setCurrentQuery('')
  }, [])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  return {
    suggestions,
    isSearching,
    error,
    searchLocations,
    getLocationDetails,
    getLocationById,
    clearSuggestions,
    clearError,
  }
}
