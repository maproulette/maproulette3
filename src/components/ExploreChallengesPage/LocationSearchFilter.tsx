import { AlertCircle, CheckCircle2, Loader2, MapPin, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchContext } from '@/contexts/exploreChallenges/SearchContext'
import { useMapContext } from '@/contexts/MapContext'
import { fitMapToBounds, removeLayer, removeSource } from '@/utils/mapUtils'

interface PlaceSuggestion {
  display_name: string
  place_id: string
  type?: string
  importance?: number
  boundingbox?: string[]
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
  const {
    extendedFindParams,
    setExtendedFindParams,
    setTaskMarkerParams,
    isLocationLoading,
    setIsLocationLoading,
  } = useSearchContext()
  const [locationInput, setLocationInput] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [initialLocationLoaded, setInitialLocationLoaded] = useState(false)
  const [pendingGeojson, setPendingGeojson] = useState<PlaceDetail['geojson'] | null>(null)
  const locationId = useId()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const addPolygonToMap = (geojson: PlaceDetail['geojson']) => {
    if (!map.current || !mapLoaded || !geojson) return

    removeLayer(map.current, 'location-polygon-outline')
    removeLayer(map.current, 'location-polygon-fill')
    removeSource(map.current, 'location-polygon')

    const feature = {
      type: 'Feature' as const,
      geometry: geojson,
      properties: {},
    }

    map.current.addSource('location-polygon', {
      type: 'geojson',
      data: feature,
    })

    map.current.addLayer({
      id: 'location-polygon-fill',
      type: 'fill',
      source: 'location-polygon',
      paint: {
        'fill-color': '#10b981',
        'fill-opacity': 0.15,
      },
    })

    map.current.addLayer({
      id: 'location-polygon-outline',
      type: 'line',
      source: 'location-polygon',
      paint: {
        'line-color': '#10b981',
        'line-width': 2.5,
        'line-dasharray': [3, 2],
      },
    })
  }

  const removePolygonFromMap = () => {
    if (!map.current) return

    removeLayer(map.current, 'location-bbox-outline')
    removeLayer(map.current, 'location-bbox-fill')
    removeSource(map.current, 'location-bbox')

    removeLayer(map.current, 'location-polygon-outline')
    removeLayer(map.current, 'location-polygon-fill')
    removeSource(map.current, 'location-polygon')
  }

  useEffect(() => {
    const loadInitialLocation = async () => {
      if (!extendedFindParams.location_id || initialLocationLoaded) {
        return
      }

      setInitialLocationLoaded(true)
      setIsLocationLoading(true)

      try {
        const detailsResponse = await fetch(
          `https://nominatim.openstreetmap.org/details?place_id=${extendedFindParams.location_id}&format=json`,
          {
            headers: {
              'User-Agent': 'MapRoulette/4.0',
            },
          }
        )

        if (!detailsResponse.ok) {
          throw new Error('Failed to fetch location details')
        }

        const detailData = await detailsResponse.json()

        if (!detailData) {
          setError('Location not found')
          setIsLocationLoading(false)
          return
        }

        const locationName = detailData.names?.name || detailData.localname || 'Unknown Location'
        setLocationInput(locationName)
        setSelectedLocation(locationName)

        if (detailData.osm_type && detailData.osm_id) {
          const osmTypePrefix =
            detailData.osm_type === 'node' ? 'N' : detailData.osm_type === 'way' ? 'W' : 'R'
          const lookupResponse = await fetch(
            `https://nominatim.openstreetmap.org/lookup?osm_ids=${osmTypePrefix}${detailData.osm_id}&format=json&polygon_geojson=1`,
            {
              headers: {
                'User-Agent': 'MapRoulette/4.0',
              },
            }
          )

          if (lookupResponse.ok) {
            const lookupData: PlaceDetail[] = await lookupResponse.json()
            const place = lookupData[0]

            console.log('Lookup response:', place)
            console.log('Has geojson?', !!place?.geojson)
            console.log('Map loaded?', mapLoaded)
            console.log('Map current?', !!map.current)

            if (place) {
              if (place.display_name) {
                setLocationInput(place.display_name)
                setSelectedLocation(place.display_name)
              }

              if (place.boundingbox) {
                const [minLat, maxLat, minLon, maxLon] = place.boundingbox.map(Number)
                const bounds: [[number, number], [number, number]] = [
                  [minLon, minLat],
                  [maxLon, maxLat],
                ]

                const boundsString = `${minLon},${minLat},${maxLon},${maxLat}`
                setExtendedFindParams((prev) => ({ ...prev, bounds: boundsString }))
                setTaskMarkerParams((prev) => ({ ...prev, bounds: boundsString }))

                if (map.current && mapLoaded) {
                  console.log('Map ready, adding polygon and zooming immediately')
                  if (place.geojson) {
                    addPolygonToMap(place.geojson)
                  }
                  fitMapToBounds(map.current, bounds, {
                    padding: { top: 50, bottom: 50, left: 50, right: 50 },
                    duration: 1000,
                  })
                } else {
                  console.warn('Map not ready yet, storing for later')
                  if (place.geojson) {
                    setPendingGeojson(place.geojson)
                  }
                }
              }
            }
          }
        } else if (detailData.centroid) {
          const geometry = detailData.centroid.geometry
          if (geometry?.coordinates) {
            const [lon, lat] = geometry.coordinates

            const padding = 0.01
            const boundsString = `${lon - padding},${lat - padding},${lon + padding},${lat + padding}`
            setExtendedFindParams((prev) => ({ ...prev, bounds: boundsString }))
            setTaskMarkerParams((prev) => ({ ...prev, bounds: boundsString }))

            if (map.current && mapLoaded) {
              fitMapToBounds(
                map.current,
                [
                  [lon - padding, lat - padding],
                  [lon + padding, lat + padding],
                ],
                {
                  padding: { top: 50, bottom: 50, left: 50, right: 50 },
                  duration: 1000,
                }
              )
            }
          }
        }
      } catch (err) {
        console.error('Error loading initial location:', err)
        setError('Failed to load location from URL')
      } finally {
        setIsLocationLoading(false)
      }
    }

    loadInitialLocation()
  }, [
    extendedFindParams.location_id,
    initialLocationLoaded,
    map,
    mapLoaded,
    setIsLocationLoading,
    setExtendedFindParams,
    setTaskMarkerParams,
  ])

  useEffect(() => {
    if (locationInput.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      setError('')
      return
    }

    if (selectedLocation && locationInput === selectedLocation) {
      return
    }

    if (selectedLocation && locationInput !== selectedLocation) {
      setSelectedLocation('')
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchLoading(true)
      setError('')
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}&limit=8&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'MapRoulette/4.0',
            },
          }
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
        setIsSearchLoading(false)
      }
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [locationInput])

  useEffect(() => {
    const updatePosition = () => {
      if ((showSuggestions || error) && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        })
      }
    }

    updatePosition()

    if (showSuggestions || error) {
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)

      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [showSuggestions, error])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (pendingGeojson && map.current && mapLoaded) {
      console.log('Map is ready, adding pending polygon')
      addPolygonToMap(pendingGeojson)
      setPendingGeojson(null)
    }
  }, [pendingGeojson, map, mapLoaded])

  useEffect(() => {
    return () => {
      removePolygonFromMap()
    }
  }, [])

  const handleSelectLocation = async (suggestion: PlaceSuggestion) => {
    setLocationInput(suggestion.display_name)
    setSelectedLocation(suggestion.display_name)
    setShowSuggestions(false)
    setError('')

    const locationId = Number(suggestion.place_id)
    setExtendedFindParams((prev) => ({ ...prev, location_id: locationId }))
    setTaskMarkerParams((prev) => ({ ...prev, location_id: locationId }))

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(suggestion.display_name)}&polygon_geojson=1&format=jsonv2&limit=1`,
        {
          headers: {
            'User-Agent': 'MapRoulette/4.0',
          },
        }
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

      if (place.boundingbox) {
        const [minLat, maxLat, minLon, maxLon] = place.boundingbox.map(Number)
        const bounds: [[number, number], [number, number]] = [
          [minLon, minLat],
          [maxLon, maxLat],
        ]

        const boundsString = `${minLon},${minLat},${maxLon},${maxLat}`
        setExtendedFindParams((prev) => ({ ...prev, bounds: boundsString }))
        setTaskMarkerParams((prev) => ({ ...prev, bounds: boundsString }))

        if (map.current && mapLoaded) {
          if (place.geojson) {
            addPolygonToMap(place.geojson)
          }
          fitMapToBounds(map.current, bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            duration: 1000,
          })
        } else {
          if (place.geojson) {
            setPendingGeojson(place.geojson)
          }
        }
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

    setExtendedFindParams((prev) => ({
      ...prev,
      location_id: undefined,
      bounds: '-180,-90,180,90',
    }))
    setTaskMarkerParams((prev) => ({ ...prev, location_id: undefined, bounds: '-180,-90,180,90' }))

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
    <div className="relative w-full md:w-56" ref={containerRef}>
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
          {(isSearchLoading || isLocationLoading) && (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
          )}
          {selectedLocation && !isSearchLoading && !isLocationLoading && (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          )}
          {locationInput && (
            <button
              type="button"
              onClick={handleClearLocation}
              onMouseDown={(e) => e.preventDefault()}
              className="rounded-sm p-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Clear location"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {showSuggestions &&
        suggestions.length > 0 &&
        createPortal(
          <div
            ref={dropdownRef}
            id={`${locationId}-listbox`}
            role="listbox"
            style={{
              position: 'absolute',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
            className="z-[9999] mt-1 max-h-64 overflow-auto rounded-md border border-zinc-300 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                type="button"
                role="option"
                aria-selected={index === highlightedIndex}
                onClick={() => handleSelectLocation(suggestion)}
                onMouseDown={(e) => e.preventDefault()}
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
          </div>,
          document.body
        )}

      {error &&
        createPortal(
          <div
            style={{
              position: 'absolute',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
            className="z-[9999] mt-1 flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-xs shadow-md dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </div>,
          document.body
        )}
    </div>
  )
}
