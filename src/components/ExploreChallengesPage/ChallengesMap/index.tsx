import { useCallback, useEffect, useRef } from 'react'
import { useMapBoundsSync } from '@/components/ExploreChallengesPage/hooks/useMapBoundsSync'
import { useMapPolygon } from '@/components/ExploreChallengesPage/hooks/useMapPolygon'
import { MapControls } from '@/components/shared/MapControls'
import { fitMapToBounds, parseBoundsString } from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import {
  ChallengeTaskMarkersProvider,
  useChallengeTaskMarkersContext,
} from './ChallengeTaskMarkersContext'
import { ChallengeTaskMarkersLayer } from './ChallengeTaskMarkersLayer'
import {
  ExploreChallengesMapContextProvider,
  useExploreChallengesMapContext,
} from './ExploreChallengesMapContext'
import { StyleSwitcherPanel } from './StyleSwitcherPanel'

const ChallengeMapContent = () => {
  const { mapContainer, map, mapLoaded } = useExploreChallengesMapContext()
  const { dataLoading } = useChallengeTaskMarkersContext()
  const { searchParams, setBounds, locationGeojson, pendingFitBounds, clearPendingFitBounds } =
    useExploreChallengesSearchContext()

  const { addPolygon, removePolygon } = useMapPolygon({ map, mapLoaded })
  const prevLocationGeojsonRef = useRef(locationGeojson)
  const hasRestoredPolygonRef = useRef(false)

  const handleBoundsChange = useCallback(
    (bounds: string) => {
      setBounds(bounds)
    },
    [setBounds]
  )

  useMapBoundsSync({
    map,
    mapLoaded,
    initialBounds: searchParams?.bounds ?? undefined,
    onBoundsChange: handleBoundsChange,
  })

  useEffect(() => {
    if (mapLoaded && locationGeojson && !hasRestoredPolygonRef.current) {
      addPolygon(locationGeojson)
      hasRestoredPolygonRef.current = true
    }
  }, [mapLoaded, locationGeojson, addPolygon])

  useEffect(() => {
    if (locationGeojson !== prevLocationGeojsonRef.current) {
      if (locationGeojson) {
        addPolygon(locationGeojson)
      } else {
        removePolygon()
      }
      prevLocationGeojsonRef.current = locationGeojson
      hasRestoredPolygonRef.current = true
    }
  }, [locationGeojson, addPolygon, removePolygon])

  useEffect(() => {
    if (!pendingFitBounds || !map.current || !mapLoaded) return

    const parsed = parseBoundsString(pendingFitBounds)
    if (parsed) {
      const bounds: [[number, number], [number, number]] = [
        [parsed[0], parsed[1]],
        [parsed[2], parsed[3]],
      ]
      fitMapToBounds(map.current, bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
      })
    }
    clearPendingFitBounds()
  }, [pendingFitBounds, map, mapLoaded, clearPendingFitBounds])

  return (
    <div className="relative h-full w-full flex-1">
      <div
        ref={mapContainer}
        data-mapgrab-map-id="exploreChallengesMap"
        className="absolute inset-0 h-full w-full overflow-hidden md:rounded-br-lg"
      />

      <div
        className={`-translate-x-1/2 absolute top-3 left-1/2 z-[1000] transform transition-all duration-500 ease-in-out md:top-4 ${
          dataLoading || !mapLoaded
            ? 'translate-y-0 opacity-100'
            : '-translate-y-4 pointer-events-none opacity-0'
        }`}
      >
        <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-medium text-xs text-zinc-900 dark:text-zinc-100">
              {!mapLoaded ? 'Loading map...' : 'Loading markers...'}
            </span>
          </div>
        </div>
      </div>

      <ChallengeTaskMarkersLayer />
      <MapControls
        map={map}
        mapLoaded={mapLoaded}
        collapsible={true}
        defaultOpen={true}
        showZoom={true}
        showReset={true}
        showLayers={true}
        StyleSwitcherPanel={StyleSwitcherPanel}
      />
    </div>
  )
}

export const ChallengeMap = () => {
  return (
    <ExploreChallengesMapContextProvider>
      <ChallengeTaskMarkersProvider>
        <ChallengeMapContent />
      </ChallengeTaskMarkersProvider>
    </ExploreChallengesMapContextProvider>
  )
}
