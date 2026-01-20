import type maplibregl from 'maplibre-gl'
import { useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { getStyleSpecification, mapStyleItems } from '@/utils/mapStyles'

interface MapStyleSwitcherProps {
  map: React.RefObject<MapRef | null>
  mapLoaded: boolean
  isOpen: boolean
  onClose: () => void
}

export const MapStyleSwitcher = ({ map, mapLoaded, isOpen, onClose }: MapStyleSwitcherProps) => {
  const [selectedStyle, setSelectedStyle] = useState('osm-us-vector')

  const handleStyleChange = (styleUrl: string) => {
    if (!map.current || !mapLoaded) return

    const maplibreMap = map.current.getMap()
    const styleSpec = getStyleSpecification(styleUrl)

    if (styleSpec) {
      maplibreMap.setStyle(styleSpec as maplibregl.StyleSpecification)
      setSelectedStyle(styleUrl)
    } else if (styleUrl.startsWith('http')) {
      // Handle URL-based styles (like Carto styles)
      maplibreMap.setStyle(styleUrl)
      setSelectedStyle(styleUrl)
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-4 right-14 z-10 w-80 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-zinc-200 border-b p-4 dark:border-zinc-800">
        <h3 className="font-semibold text-sm">Map Style</h3>
      </div>
      <ScrollArea className="max-h-96">
        <div className="p-2">
          {mapStyleItems.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                handleStyleChange(style.styleUrl)
                onClose()
              }}
              className={`mb-2 flex w-full items-center gap-3 rounded-md border p-3 text-left transition-colors ${
                selectedStyle === style.styleUrl || selectedStyle === style.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800'
              }`}
            >
              <img
                src={style.image}
                alt={style.name}
                className="h-12 w-12 rounded border border-zinc-200 object-cover dark:border-zinc-700"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
              <div className="flex-1">
                <div className="font-medium text-sm">{style.name}</div>
                {style.description && (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {style.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
