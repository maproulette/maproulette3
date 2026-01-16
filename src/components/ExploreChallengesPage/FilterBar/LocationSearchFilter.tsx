import { AlertCircle, CheckCircle2, Loader2, MapPin, X } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { LocationGeojson } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { useExploreChallengesSearchContext } from '@/components/ExploreChallengesPage/ExploreChallengesSearchContext'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
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

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'MapRoulette/4.0'
const DEBOUNCE_MS = 400
const MIN_QUERY_LENGTH = 3

const fetchNominatim = async (url: string, signal?: AbortSignal) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal,
  })
  if (!response.ok) throw new Error('Failed to fetch')
  return response.json()
}

const boundsToString = (bbox: string[]): string => {
  const [minLat, maxLat, minLon, maxLon] = bbox.map(Number)
  return `${minLon},${minLat},${maxLon},${maxLat}`
}

const applyLocation = (
  place: PlaceDetail,
  setBounds: (bounds: string) => void,
  requestFitBounds: (bounds: string) => void,
  setLocationGeojson: (geojson: LocationGeojson) => void
) => {
  if (place.boundingbox) {
    const boundsString = boundsToString(place.boundingbox)
    setBounds(boundsString)
    requestFitBounds(boundsString)
    if (place.geojson) {
      setLocationGeojson(place.geojson as LocationGeojson)
    }
  }
}

export const LocationSearchFilter = () => {
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
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const initialLocationLoadedRef = useRef(false)
  const selectedLocationRef = useRef('')

  useEffect(() => {
    if (locationInput.length < MIN_QUERY_LENGTH || locationInput === selectedLocationRef.current) {
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
        const data = await fetchNominatim(
          `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(locationInput)}&limit=8&addressdetails=1`,
          controller.signal
        )

        if (data.length === 0) {
          setError('No locations found. Try a different search term.')
        }
        setSuggestions(data)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error fetching suggestions:', err)
          setError('Network error. Please check your connection.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timeoutId)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [locationInput])

  useEffect(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
      setHighlightedIndex(-1)
    }
  }, [suggestions])

  useEffect(() => {
    if (!locationId || initialLocationLoadedRef.current) return

    const loadLocation = async () => {
      initialLocationLoadedRef.current = true
      setIsLocationLoading(true)

      try {
        const detailData = await fetchNominatim(
          `${NOMINATIM_BASE_URL}/details?place_id=${locationId}&format=json`
        )

        if (!detailData) {
          setError('Location not found')
          return
        }

        const locationName = detailData.names?.name || detailData.localname || 'Unknown Location'
        let place: PlaceDetail | null = null

        if (detailData.osm_type && detailData.osm_id) {
          const prefix =
            detailData.osm_type === 'node' ? 'N' : detailData.osm_type === 'way' ? 'W' : 'R'
          const lookupData = await fetchNominatim(
            `${NOMINATIM_BASE_URL}/lookup?osm_ids=${prefix}${detailData.osm_id}&format=json&polygon_geojson=1`
          )
          place = lookupData[0] || null
        }

        if (!place && detailData.centroid?.geometry?.coordinates) {
          const [lon, lat] = detailData.centroid.geometry.coordinates
          const padding = 0.01
          place = {
            display_name: locationName,
            boundingbox: [
              String(lat - padding),
              String(lat + padding),
              String(lon - padding),
              String(lon + padding),
            ],
          }
        }

        if (place) {
          setLocationInput(place.display_name)
          selectedLocationRef.current = place.display_name
          applyLocation(place, setBounds, requestFitBounds, setLocationGeojson)
        }
      } catch (err) {
        console.error('Error loading location:', err)
        setError('Failed to load location')
      } finally {
        setIsLocationLoading(false)
      }
    }

    loadLocation()
  }, [locationId, setIsLocationLoading, setBounds, requestFitBounds, setLocationGeojson])

  useEffect(() => {
    if (locationId === undefined && selectedLocationRef.current) {
      setLocationInput('')
      selectedLocationRef.current = ''
      setSuggestions([])
    }
  }, [locationId])

  const getLocationDetails = useCallback(
    async (suggestion: PlaceSuggestion): Promise<PlaceDetail | null> => {
      try {
        const data = await fetchNominatim(
          `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(suggestion.display_name)}&polygon_geojson=1&format=jsonv2&limit=1`
        )
        return data[0] || null
      } catch (err) {
        console.error('Error fetching location details:', err)
        setError('Failed to load location geometry')
        return null
      }
    },
    []
  )

  const handleSelectLocation = useCallback(
    async (suggestion: PlaceSuggestion) => {
      setLocationInput(suggestion.display_name)
      selectedLocationRef.current = suggestion.display_name
      setShowSuggestions(false)
      setError('')
      setSuggestions([])
      setLocationId(Number(suggestion.place_id))

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const place = await getLocationDetails(suggestion)
      if (place) {
        applyLocation(place, setBounds, requestFitBounds, setLocationGeojson)
      }
    },
    [getLocationDetails, setLocationId, setBounds, requestFitBounds, setLocationGeojson]
  )

  const handleClearLocation = useCallback(() => {
    setLocationInput('')
    selectedLocationRef.current = ''
    setShowSuggestions(false)
    setHighlightedIndex(-1)
    setSuggestions([])
    setError('')
    setLocationId(undefined)
    setBounds(DEFAULT_WORLD_BOUNDS)
    setLocationGeojson(null as LocationGeojson)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    inputRef.current?.focus()
  }, [setLocationId, setBounds, setLocationGeojson])

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

  const isLoading = isSearching || isLocationLoading
  const hasSelection = selectedLocationRef.current && locationInput === selectedLocationRef.current
  const inputId = useId()

  return (
    <Popover open={showSuggestions || !!error} onOpenChange={setShowSuggestions}>
      <PopoverTrigger asChild>
        <div className="relative w-full md:w-56">
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
              placeholder="Search location..."
              className="h-9 w-full rounded-md border border-zinc-300 bg-white py-2 pr-9 pl-9 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              aria-autocomplete="list"
              aria-controls={`${inputId}-listbox`}
            />
            <div className="absolute right-2 flex items-center gap-1">
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              )}
              {hasSelection && !isLoading && (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              )}
              {locationInput && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClearLocation}
                  onMouseDown={(e) => e.preventDefault()}
                  className="h-6 w-6 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  aria-label="Clear location"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {error ? (
          <div className="flex items-center gap-1.5 px-3 py-2 text-red-700 text-xs dark:text-red-400">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div id={`${inputId}-listbox`} role="listbox" className="max-h-64 overflow-auto">
            {suggestions.map((suggestion, index) => {
              const [primary, ...secondary] = suggestion.display_name.split(',')
              return (
                <Button
                  key={suggestion.place_id}
                  variant="ghost"
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onClick={() => handleSelectLocation(suggestion)}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`h-auto w-full justify-start rounded-none px-3 py-2.5 text-left ${
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
                        {primary}
                      </p>
                      {secondary.length > 0 && (
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                          {secondary.join(',').trim()}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
