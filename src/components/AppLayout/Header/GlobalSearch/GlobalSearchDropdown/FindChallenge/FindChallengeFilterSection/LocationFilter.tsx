import { AlertCircle, CheckCircle2, Loader2, MapPin, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { type BBox, geocodePlace } from '@/utils/locationService'

interface LocationFilterProps {
  onLocationChange?: (boundingBox: BBox | undefined) => void
}

interface PlaceSuggestion {
  display_name: string
  place_id: string
  type?: string
  importance?: number
}

export const LocationFilter = ({ onLocationChange }: LocationFilterProps) => {
  const [locationInput, setLocationInput] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [boundingBox, setBoundingBox] = useState<BBox | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const locationId = useId()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce for location search
  useEffect(() => {
    // Don't fetch if a location is already selected
    if (selectedLocation) {
      return
    }

    if (locationInput.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      setError('')
      return
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
  }, [locationInput, selectedLocation])

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

  const handleSelectLocation = async (suggestion: PlaceSuggestion) => {
    setLocationInput(suggestion.display_name)
    setSelectedLocation(suggestion.display_name)
    setShowSuggestions(false)
    setError('')

    // Convert to bounding box
    try {
      const bbox = await geocodePlace(suggestion.display_name)
      setBoundingBox(bbox)
      onLocationChange?.(bbox)
    } catch (err) {
      setError('Failed to get location bounds')
      console.error('Error geocoding:', err)
    }
  }

  const handleClearLocation = () => {
    setLocationInput('')
    setSelectedLocation('')
    setBoundingBox(undefined)
    setSuggestions([])
    setShowSuggestions(false)
    setError('')
    setHighlightedIndex(-1)
    onLocationChange?.(undefined)
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
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 font-medium text-xs text-zinc-500 dark:text-zinc-400">
        <MapPin className="h-3 w-3" />
        Location
      </div>
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            ref={inputRef}
            id={locationId}
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for a city, country, or region..."
            className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1 pr-9 text-sm text-zinc-900 transition-colors placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            aria-autocomplete="list"
            aria-controls={`${locationId}-listbox`}
          />
          <div className="-translate-y-1/2 absolute top-1/2 right-2 flex items-center gap-1">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
            )}
            {selectedLocation && !isLoading && (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="rounded-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  aria-label="Clear location"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div
            id={`${locationId}-listbox`}
            role="listbox"
            className="absolute top-full z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-lg border border-zinc-300 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                type="button"
                role="option"
                aria-selected={index === highlightedIndex}
                onClick={() => handleSelectLocation(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full cursor-pointer px-3 py-2.5 text-left transition-colors ${
                  index === highlightedIndex
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
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
          <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-red-50 px-2 py-1.5 text-red-700 text-xs dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && !selectedLocation && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Searching locations...</span>
          </div>
        )}

        {boundingBox && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium">Location bounds set</span>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 font-mono text-emerald-700 text-xs dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
              [{boundingBox[0].toFixed(4)}, {boundingBox[1].toFixed(4)}, {boundingBox[2].toFixed(4)}
              , {boundingBox[3].toFixed(4)}]
            </div>
          </div>
        )}
      </div>

      {!selectedLocation && !isLoading && locationInput.length > 0 && locationInput.length < 3 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Type at least 3 characters to search
        </p>
      )}
    </div>
  )
}
