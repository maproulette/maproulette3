import { X } from 'lucide-react'
import type { StyleSpecification } from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { cn } from '@/lib/utils'
import { mapStyles } from './mapStyles'

interface MapStyleSwitcherProps {
  map: React.RefObject<MapRef | null>
  mapLoaded: boolean
  isOpen: boolean
  onClose: () => void
}

export const MapStyleSwitcher = ({ map, mapLoaded, isOpen, onClose }: MapStyleSwitcherProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleStyleChange = (style: StyleSpecification, index: number) => {
    if (!map.current || !mapLoaded) return
    map.current.getMap().setStyle(style)
    setSelectedIndex(index)
  }

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Add event listener with a small delay to avoid immediate close on open
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className="absolute top-4 right-14 z-10 w-72 overscroll-contain rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between border-zinc-200 border-b p-4 dark:border-slate-700">
        <h3 className="font-semibold text-sm">Map Style</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-zinc-300"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ScrollArea className="max-h-96 overflow-auto">
        <div className="p-2">
          {mapStyles.map((style, index) => (
            <button
              key={style.name ?? index}
              type="button"
              onClick={() => handleStyleChange(style, index)}
              className={cn(
                'mb-2 block w-full rounded-lg border p-3 text-left transition-colors',
                selectedIndex === index
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-zinc-200 hover:bg-zinc-50 dark:border-slate-700 dark:hover:bg-slate-800'
              )}
            >
              <div className="font-medium text-sm">{style.name}</div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
