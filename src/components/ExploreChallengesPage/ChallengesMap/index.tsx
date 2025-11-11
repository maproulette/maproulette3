import { MapControls } from '@/components/shared'
import { useChallengeTaskMarkersContext } from '@/contexts/exploreChallenges/ChallengeTaskMarkersContext'
import { useMapContext } from '@/contexts/MapContext'
import { ChallengeTaskMarkersLayer } from '../ChallengeTaskMarkersLayer'
import { LocationSearchControl } from './LocationSearchControl'
import { StyleSwitcherPanel } from './StyleSwitcherPanel'

export const ChallengeMap = () => {
  const { dataLoading } = useChallengeTaskMarkersContext()
  const { mapContainer, mapLoaded } = useMapContext()

  return (
    <div className="relative h-full w-full flex-1">
      <div
        ref={mapContainer}
        data-mapgrab-map-id="mainMap"
        className="absolute inset-0 h-full w-full overflow-hidden md:rounded-br-lg"
      />

      <div
        className={`-translate-x-1/2 absolute top-3 left-1/2 z-[1000] transform transition-all duration-500 ease-in-out md:top-4 ${
          dataLoading || !mapLoaded
            ? 'translate-y-0 opacity-100'
            : '-translate-y-4 pointer-events-none opacity-0'
        }`}
      >
        <div className="relative overflow-hidden rounded-lg border border-zinc-300 bg-white px-3 py-2 shadow-xl md:px-5 md:py-3 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="whitespace-nowrap font-semibold text-xs text-zinc-900 md:text-sm dark:text-zinc-100">
              {!mapLoaded ? 'Loading map...' : 'Loading markers...'}
            </span>
          </div>

          <div className="absolute right-0 bottom-0 left-0 h-0.5 overflow-hidden bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </div>
        </div>
      </div>

      <LocationSearchControl />
      <ChallengeTaskMarkersLayer />
      <MapControls
        variant="full"
        collapsible={true}
        showZoom={true}
        showReset={true}
        showLayers={true}
        StyleSwitcherPanel={StyleSwitcherPanel}
      />
    </div>
  )
}
