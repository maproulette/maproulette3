import { useCallback, useEffect, useRef, useState } from 'react'
import type { LocationGeojson } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { useExploreChallengesSearchContext } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { DEFAULT_WORLD_BOUNDS } from '@/utils/mapUtils'

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
  locationInput: string
  setLocationInput: (value: string) => void
  selectedLocation: string
  showSuggestions: boolean
  setShowSuggestions: (show: boolean) => void
  highlightedIndex: number
  setHighlightedIndex: (index: number) => void
  suggestions: PlaceSuggestion[]
  isSearching: boolean
  isLoading: boolean
  error: string
  handleSelectLocation: (suggestion: PlaceSuggestion) => Promise<void>
  handleClearLocation: () => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'MapRoulette/4.0'

export const useLocationSearch = (
  options: UseLocationSearchOptions = {}
): UseLocationSearchReturn => {
  const { debounceMs = 400, minQueryLength = 3 } = options

  const {
    locationId,
    isLocationLoading,
    setBounds,
    setLocationId,
    setIsLocationLoading,
    setLocationGeojson,
    requestFitBounds,
  } = useExploreChallengesSearchContext()

  const [locationInput, setLocationInput] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [initialLocationLoaded, setInitialLocationLoaded] = useState(false)

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [currentQuery, setCurrentQuery] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const prevLocationIdRef = useRef(locationId)

  useEffect(() => {
    if (currentQuery.length < minQueryLength) {
      setSuggestions([])
      setError('')
      return
    }

    const timeoutId = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsSearching(true)
      setError('')

      try {
        const response = await fetch(
          `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(currentQuery)}&limit=8&addressdetails=1`,
          {
            headers: { 'User-Agent': USER_AGENT },
            signal: controller.signal,
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
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Error fetching location suggestions:', err)
        setError('Network error. Please check your connection.')
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, debounceMs)

    return () => {
      clearTimeout(timeoutId)

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
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

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  // Handle locationId changes - clear input when locationId is cleared
  useEffect(() => {
    if (prevLocationIdRef.current !== undefined && locationId === undefined) {
      setLocationInput('')
      setSelectedLocation('')
      clearSuggestions()
    }
    prevLocationIdRef.current = locationId
  }, [locationId, clearSuggestions])

  // Load initial location when locationId is set
  useEffect(() => {
    const loadInitialLocation = async () => {
      if (!locationId || initialLocationLoaded) return

      setInitialLocationLoaded(true)
      setIsLocationLoading(true)

      try {
        const place = await getLocationById(locationId)

        if (place) {
          setLocationInput(place.display_name)
          setSelectedLocation(place.display_name)

          if (place.boundingbox) {
            const [minLat, maxLat, minLon, maxLon] = place.boundingbox.map(Number)
            const boundsString = `${minLon},${minLat},${maxLon},${maxLat}`

            setBounds(boundsString)
            requestFitBounds(boundsString)

            if (place.geojson) {
              setLocationGeojson(place.geojson as LocationGeojson)
            }
          }
        }
      } catch (err) {
        console.error('Error loading initial location:', err)
      } finally {
        setIsLocationLoading(false)
      }
    }

    loadInitialLocation()
  }, [
    locationId,
    initialLocationLoaded,
    setIsLocationLoading,
    setBounds,
    getLocationById,
    setLocationGeojson,
    requestFitBounds,
  ])

  // Search locations when input changes
  useEffect(() => {
    if (selectedLocation && locationInput === selectedLocation) return
    if (selectedLocation && locationInput !== selectedLocation) {
      setSelectedLocation('')
    }
    searchLocations(locationInput)
  }, [locationInput, selectedLocation, searchLocations])

  // Show suggestions when they're available
  useEffect(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
      setHighlightedIndex(-1)
    }
  }, [suggestions])

  const handleSelectLocation = useCallback(
    async (suggestion: PlaceSuggestion) => {
      setLocationInput(suggestion.display_name)
      setSelectedLocation(suggestion.display_name)
      setShowSuggestions(false)
      clearError()
      clearSuggestions()

      const locationIdNum = Number(suggestion.place_id)
      setLocationId(locationIdNum)

      const place = await getLocationDetails(suggestion)
      if (!place) return

      if (place.boundingbox) {
        const [minLat, maxLat, minLon, maxLon] = place.boundingbox.map(Number)
        const boundsString = `${minLon},${minLat},${maxLon},${maxLat}`

        setBounds(boundsString)
        requestFitBounds(boundsString)

        if (place.geojson) {
          setLocationGeojson(place.geojson as LocationGeojson)
        }
      }
    },
    [
      clearError,
      clearSuggestions,
      setLocationId,
      getLocationDetails,
      setBounds,
      requestFitBounds,
      setLocationGeojson,
    ]
  )

  const handleClearLocation = useCallback(() => {
    setLocationInput('')
    setSelectedLocation('')
    setShowSuggestions(false)
    setHighlightedIndex(-1)
    clearSuggestions()
    clearError()

    setLocationId(undefined)
    setBounds(DEFAULT_WORLD_BOUNDS)
    setLocationGeojson(null as LocationGeojson)

    inputRef.current?.focus()
  }, [clearSuggestions, clearError, setLocationId, setBounds, setLocationGeojson])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            handleSelectLocation(suggestions[highlightedIndex])
          }
          break
        case 'Escape':
          setShowSuggestions(false)
          setHighlightedIndex(-1)
          break
      }
    },
    [showSuggestions, suggestions, highlightedIndex, handleSelectLocation]
  )

  return {
    locationInput,
    setLocationInput,
    selectedLocation,
    showSuggestions,
    setShowSuggestions,
    highlightedIndex,
    setHighlightedIndex,
    suggestions,
    isSearching,
    isLoading: isSearching || isLocationLoading,
    error,
    handleSelectLocation,
    handleClearLocation,
    handleKeyDown,
    inputRef,
  }
}
