import type { StyleSpecification } from 'maplibre-gl'
import { useState } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import { cn } from '@/lib/utils'
import { mapStyles } from './mapStyles'

interface MapStyleSwitcherProps {
  map: React.RefObject<MapRef | null>
  mapLoaded: boolean
}

export const MapStyleSwitcher = ({ map, mapLoaded }: MapStyleSwitcherProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleStyleChange = (style: StyleSpecification, index: number) => {
    if (!map.current || !mapLoaded) return
    map.current.getMap().setStyle(style)
    setSelectedIndex(index)
  }

  return (
    <div className="p-2">
      {mapStyles.map((style, index) => (
        <button
          key={style.name ?? index}
          type="button"
          onClick={() => handleStyleChange(style, index)}
          className={cn(
            'mb-2 block w-full rounded-lg border p-3 text-left transition-colors last:mb-0',
            selectedIndex === index
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-zinc-200 hover:bg-zinc-50 dark:border-slate-700 dark:hover:bg-slate-800'
          )}
        >
          <div className="font-medium text-sm">{style.name}</div>
        </button>
      ))}
    </div>
  )
}
