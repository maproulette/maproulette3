import { useVisibleLayers } from '@/contexts/VisibleLayersContext'
import { CustomLayersPanel } from './CustomLayers/CustomLayersPanel'
import { LayerToggleButton } from './LayerToggleButton'
import { overlayRegistry } from './overlayRegistry'

export const LayerControl = () => {
  const { overlays, toggleOverlay } = useVisibleLayers()

  return (
    <div className="w-64 space-y-3 rounded-md bg-white p-3 shadow-lg dark:bg-slate-900">
      <div>
        <span className="font-medium text-xs text-zinc-500 uppercase tracking-wide dark:text-slate-400">
          Overlays
        </span>
        <div className="mt-1">
          {overlayRegistry.map((o) => (
            <LayerToggleButton
              key={o.id}
              id={o.id}
              label={o.label}
              description={o.description}
              checked={!!overlays[o.id]}
              onToggle={() => toggleOverlay(o.id)}
            />
          ))}
        </div>
      </div>
      <CustomLayersPanel />
    </div>
  )
}
