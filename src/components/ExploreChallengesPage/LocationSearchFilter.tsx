import { AlertCircle, CheckCircle2, Loader2, MapPin, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'
import { useMapContext } from '@/contexts/MapContext'
import { fitMapToBounds, removeLayer, removeSource } from '@/utils/mapUtils'

interface PlaceSuggestion {
  display_name: string
  place_id: string
  type?: string
  importance?: number
  boundingbox?: string[] // [minLat, maxLat, minLon, maxLon]
}

interface PlaceDetail {
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

export const LocationSearchFilter = () => {
  const { map, mapLoaded } = useMapContext()
  const { setExtendedFindParams, setTaskMarkerParams } = useSearchContext()
  const [locationInput, setLocationInput] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const locationId = useId()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce for location search
  useEffect(() => {
    if (locationInput.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      setError('')
      return
    }

    if (selectedLocation && locationInput !== selectedLocation) {
      setSelectedLocation('')
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=8&addressdetails=1`
        )
        if (response.ok) {
          const data = await response.json()
          if (data.length === 0) {
            setError('No locations found. Try a different search term.')
          }
          setSuggestions(data)
          setShowSuggestions(true)
          setHighlightedIndex(-1)
        } else {
          setError('Failed to fetch locations. Please try again.')
        }
      } catch (error) {
        console.error('Error fetching location suggestions:', error)
        setError('Network error. Please check your connection.')
      } finally {
        setIsLoading(false)
      }
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [locationInput])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup: Remove polygon when component unmounts
  useEffect(() => {
    return () => {
      removePolygonFromMap()
    }
  }, [])

  const addPolygonToMap = (geojson: PlaceDetail['geojson']) => {
    if (!map.current || !mapLoaded || !geojson) return

    // Remove existing polygon if present
    removeLayer(map.current, 'location-polygon-outline')
    removeLayer(map.current, 'location-polygon-fill')
    removeSource(map.current, 'location-polygon')

    // Create a GeoJSON feature from the Nominatim geojson
    const feature = {
      type: 'Feature' as const,
      geometry: geojson,
      properties: {},
    }

    // Add source
    map.current.addSource('location-polygon', {
      type: 'geojson',
      data: feature,
    })

    // Add fill layer (semi-transparent)
    map.current.addLayer({
      id: 'location-polygon-fill',
      type: 'fill',
      source: 'location-polygon',
      paint: {
        'fill-color': '#10b981', // emerald-500
        'fill-opacity': 0.15,
      },
    })

    // Add outline layer
    map.current.addLayer({
      id: 'location-polygon-outline',
      type: 'line',
      source: 'location-polygon',
      paint: {
        'line-color': '#10b981', // emerald-500
        'line-width': 2.5,
        'line-dasharray': [3, 2],
      },
    })
  }

  const removePolygonFromMap = () => {
    if (!map.current) return

    // Remove old bbox layers (for backwards compatibility)
    removeLayer(map.current, 'location-bbox-outline')
    removeLayer(map.current, 'location-bbox-fill')
    removeSource(map.current, 'location-bbox')

    // Remove polygon layers
    removeLayer(map.current, 'location-polygon-outline')
    removeLayer(map.current, 'location-polygon-fill')
    removeSource(map.current, 'location-polygon')
  }

  const handleSelectLocation = async (suggestion: PlaceSuggestion) => {
    setLocationInput(suggestion.display_name)
    setSelectedLocation(suggestion.display_name)
    setShowSuggestions(false)
    setError('')

    // Set the location_id in the search context (convert string place_id to number)
    const locationId = Number(suggestion.place_id)
    setExtendedFindParams((prev) => ({ ...prev, location_id: locationId }))
    setTaskMarkerParams((prev) => ({ ...prev, location_id: locationId }))

    try {
      // Make a second request to get the detailed polygon geometry
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(suggestion.display_name)}&polygon_geojson=1&format=jsonv2&limit=1`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch location details')
      }

      const data: PlaceDetail[] = await response.json()
      const place = data[0]

      if (!place) {
        setError('Location details not found')
        return
      }

      // Add the polygon to the map for visual feedback
      if (place.geojson) {
        addPolygonToMap(place.geojson)
      }

      // Zoom to fit the bounding box
      if (place.boundingbox && map.current && mapLoaded) {
        // Parse Nominatim boundingbox format: [minLat, maxLat, minLon, maxLon]
        const [minLat, maxLat, minLon, maxLon] = place.boundingbox.map(Number)

        // fitBounds expects [[minLng, minLat], [maxLng, maxLat]]
        fitMapToBounds(
          map.current,
          [
            [minLon, minLat], // SW corner
            [maxLon, maxLat], // NE corner
          ],
          {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            duration: 1000,
          }
        )
      }
    } catch (err) {
      setError('Failed to load location geometry')
      console.error('Error fetching location details:', err)
    }
  }

  const handleClearLocation = () => {
    setLocationInput('')
    setSelectedLocation('')
    setSuggestions([])
    setShowSuggestions(false)
    setError('')
    setHighlightedIndex(-1)
    removePolygonFromMap()

    // Clear the location_id from the search context
    setExtendedFindParams((prev) => ({ ...prev, location_id: undefined }))
    setTaskMarkerParams((prev) => ({ ...prev, location_id: undefined }))

    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  }

  return (
    <div className="relative w-full md:w-56" ref={dropdownRef}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
        <input
          ref={inputRef}
          id={locationId}
          type="text"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search location..."
          className="h-9 w-full rounded-md border border-zinc-300 bg-white py-2 pr-9 pl-9 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          aria-autocomplete="list"
          aria-controls={`${locationId}-listbox`}
        />
        <div className="absolute right-2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
          )}
          {selectedLocation && !isLoading && (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          )}
          {locationInput && (
            <button
              type="button"
              onClick={handleClearLocation}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur
              className="rounded-sm p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Clear location"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          id={`${locationId}-listbox`}
          role="listbox"
          className="absolute top-full z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-zinc-300 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id}
              type="button"
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelectLocation(suggestion)}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full cursor-pointer px-3 py-2.5 text-left transition-colors ${
                index === highlightedIndex
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-start gap-2">
                <MapPin
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    index === highlightedIndex
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {suggestion.display_name.split(',')[0]}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {suggestion.display_name.split(',').slice(1).join(',').trim()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute top-full mt-1 flex w-full items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-xs shadow-md dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
