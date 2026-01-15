import { AlertCircle, CheckCircle2, Loader2, MapPin, X } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { useLocationSearch } from '../hooks/useLocationSearch'

export const LocationSearchFilter = () => {
  const {
    locationInput,
    setLocationInput,
    selectedLocation,
    showSuggestions,
    setShowSuggestions,
    highlightedIndex,
    setHighlightedIndex,
    suggestions,
    isLoading,
    error,
    handleSelectLocation,
    handleClearLocation,
    handleKeyDown,
    inputRef,
  } = useLocationSearch()

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
              {selectedLocation && !isLoading && (
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
            {suggestions.map((suggestion, index) => (
              <Button
                key={suggestion.place_id}
                variant="ghost"
                role="option"
                aria-selected={index === highlightedIndex}
                onClick={() => {
                  handleSelectLocation(suggestion)
                }}
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
                      {suggestion.display_name.split(',')[0]}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {suggestion.display_name.split(',').slice(1).join(',').trim()}
                    </p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
