import { ZoomIn } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Layer, Map as MapGL, Source } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/Map/MapControls'
import { MapStyleSwitcher } from '@/components/Map/MapStyleSwitcher'
import { calculateBoundingBox, fitMapToBounds, isWorldBounds } from '@/components/Map/mapUtils'
import { ClusterToggle } from '@/components/Map/TaskMarkers/ClusterSlider'
import { ClusterSource } from '@/components/Map/TaskMarkers/ClusterSource'
import { LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { SpiderMarkers } from '@/components/Map/TaskMarkers/SpiderMarkers'
import { TaskGeometryLayer } from '@/components/Map/TaskMarkers/TaskGeometryLayer'
import { useDrawerPortal } from '@/components/TaskInfoPanel/DrawerPortalContext'
import { TaskInfoDrawer } from '@/components/TaskInfoPanel/TaskInfoDrawer'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import { clusterLayer, useExploreChallengesMap } from './hooks'
import { LocationPolygonLayer } from './LocationPolygonLayer'

export const ExploreChallengesMap = () => {
  const {
    mapRef,
    mapLoaded,
    setMapLoaded,
    isStylePanelOpen,
    setIsStylePanelOpen,
    selectedTask,
    setSelectedTask,
    defaultStyle,
    tileUrl,
    selectedTaskGeoJSON,
    clusteredGeoJSONData,
    cluster,
    setCluster,
    handleMapMove,
    handleMapMoveEnd,
    handleMapClick,
    handleMapMouseMove,
    locationGeojson,
    spideredMarkers,
    spideredTaskData,
    setSpideredMarkers,
    setSpideredTaskData,
    filterZoomNotice,
    zoom,
  } = useExploreChallengesMap()

  const mvtSourceId = 'mvt-data'
  const mvtLayerId = 'mvt-hidden'
  const selectedTaskSourceId = 'selected-task'
  const selectedTaskLayerId = 'selected-task-layer'

  const { portalTarget } = useDrawerPortal()
  const { bounds } = useExploreChallengesSearchContext()

  const hasInitializedRef = useRef(false)
  const previousLocationGeojsonRef = useRef<typeof locationGeojson>(null)
  const initialBoundsFromUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (initialBoundsFromUrlRef.current === null) {
      initialBoundsFromUrlRef.current = bounds
    }
  }, [bounds])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      previousLocationGeojsonRef.current = locationGeojson
      return
    }

    if (previousLocationGeojsonRef.current === locationGeojson || !locationGeojson) {
      previousLocationGeojsonRef.current = locationGeojson
      return
    }

    const hasInitialBoundsFromUrl =
      initialBoundsFromUrlRef.current !== null && !isWorldBounds(initialBoundsFromUrlRef.current)

    if (
      hasInitialBoundsFromUrl &&
      previousLocationGeojsonRef.current === null &&
      locationGeojson !== null
    ) {
      previousLocationGeojsonRef.current = locationGeojson
      return
    }

    const map = mapRef.current.getMap()
    if (!map) return

    const geoBounds = calculateBoundingBox(locationGeojson)
    if (geoBounds) {
      fitMapToBounds(map, geoBounds, {
        padding: 50,
        duration: 1000,
      })
    }

    previousLocationGeojsonRef.current = locationGeojson
  }, [locationGeojson, mapLoaded, mapRef])

  return (
    <div className="relative isolate h-full w-full">
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <MapGL
          ref={mapRef}
          initialViewState={{
            longitude: 0,
            latitude: 0,
            zoom: 2,
          }}
          mapStyle={defaultStyle}
          onLoad={() => setMapLoaded(true)}
          onMove={handleMapMove}
          onMoveEnd={handleMapMoveEnd}
          onClick={(e: MapMouseEvent) => {
            handleMapClick(e)
          }}
          onMouseMove={handleMapMouseMove}
          interactiveLayerIds={
            clusterLayer.id
              ? [
                  clusterLayer.id,
                  LAYER_IDS.clusterCount,
                  LAYER_IDS.points,
                  'spidered-markers-layer',
                ]
              : [LAYER_IDS.points, 'spidered-markers-layer']
          }
        >
          <LocationPolygonLayer locationGeojson={locationGeojson} />

          {/* Hidden MVT source for efficient tile data fetching */}
          {/* key forces remount when URL changes so MapLibre re-fetches tiles */}
          <Source key={tileUrl} id={mvtSourceId} type="vector" tiles={[tileUrl]} maxzoom={14}>
            <Layer
              id={mvtLayerId}
              type="circle"
              source-layer="default"
              paint={{ 'circle-radius': 0, 'circle-opacity': 0 }}
            />
          </Source>

          {/* Visible clustered markers via Supercluster */}
          <ClusterSource clusteredData={clusteredGeoJSONData} />

          {/* Selected task overlay (GeoJSON) for highlighting */}
          {selectedTaskGeoJSON.features.length > 0 && (
            <Source id={selectedTaskSourceId} type="geojson" data={selectedTaskGeoJSON}>
              <Layer
                id={selectedTaskLayerId}
                type="symbol"
                source={selectedTaskSourceId}
                layout={{
                  'icon-image': [
                    'concat',
                    'marker-pin-',
                    ['to-string', ['coalesce', ['get', 'status'], 0]],
                    '-',
                    ['to-string', ['coalesce', ['get', 'difficulty'], 1]],
                    '-selected',
                  ],
                  'icon-size': 1.4,
                  'icon-anchor': 'bottom',
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                }}
              />
            </Source>
          )}

          <TaskGeometryLayer selectedTaskId={selectedTask?.id ?? null} />

          {spideredMarkers.size > 0 && (
            <SpiderMarkers
              markers={spideredTaskData}
              spiderPositions={spideredMarkers}
              selectedTaskId={selectedTask?.id}
            />
          )}
        </MapGL>
      </div>

      {portalTarget &&
        createPortal(
          <TaskInfoDrawer
            selectedTask={selectedTask}
            onClose={() => {
              setSelectedTask(null)
              setSpideredMarkers(new Map())
              setSpideredTaskData([])
            }}
            mapRef={mapRef}
          />,
          portalTarget
        )}

      <div className="absolute top-2 left-2 z-10 flex flex-col items-start gap-1">
        <div className="rounded bg-black/60 px-2 py-1 font-mono text-white text-xs backdrop-blur-sm">
          z{zoom}
        </div>
        {filterZoomNotice && (
          <div className="flex items-center gap-1.5 rounded border border-amber-300 bg-amber-50/95 px-2 py-1 shadow backdrop-blur-sm dark:border-amber-700 dark:bg-amber-950/95">
            <ZoomIn className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="font-medium text-amber-800 text-xs dark:text-amber-200">
              {filterZoomNotice}
            </p>
          </div>
        )}
      </div>

      <ClusterToggle isClustered={cluster} onChange={setCluster} />

      <MapControls
        map={mapRef}
        mapLoaded={mapLoaded}
        showZoom={true}
        showReset={true}
        showLayers={true}
        collapsible={true}
        defaultOpen={true}
        onLayersClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
        StyleSwitcherPanel={MapStyleSwitcher}
        styleSwitcherPanelProps={{
          map: mapRef,
          mapLoaded,
          isOpen: isStylePanelOpen,
          onClose: () => setIsStylePanelOpen(false),
        }}
      />
    </div>
  )
}
