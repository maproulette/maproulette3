import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useDrawerPortal } from '@/components/shared/DrawerPortalContext'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterSlider'
import { ClusterSource } from '@/components/shared/TaskMarkers/ClusterSource'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { SpiderMarkers } from '@/components/shared/TaskMarkers/SpiderMarkers'
import { TaskGeometryLayer } from '@/components/shared/TaskMarkers/TaskGeometryLayer'
import { TaskInfoDrawer } from '@/components/shared/TaskMarkers/TaskInfoDrawer'
import { calculateBoundingBox, fitMapToBounds, isWorldBounds } from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import { clusterLayer, useExploreChallengesMap } from './hooks'
import { LoadingIndicator } from './LoadingIndicator'
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
    shouldCluster,
    markersData,
    isLoadingMarkers,
    handleMapMoveEnd,
    handleMapClick,
    handleMapMouseMove,
    setCluster,
    clusteredGeoJSONData,
    locationGeojson,
    spideredMarkers,
    setSpideredMarkers,
  } = useExploreChallengesMap()

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
    <div className="relative h-full w-full">
      <div className="absolute inset-0 overflow-hidden rounded-br-lg">
        <MapGL
          ref={mapRef}
          initialViewState={{
            longitude: 0,
            latitude: 0,
            zoom: 2,
          }}
          mapStyle={defaultStyle}
          onLoad={() => setMapLoaded(true)}
          onMoveEnd={handleMapMoveEnd}
          onClick={(e: MapMouseEvent) => {
            handleMapClick(e)
          }}
          onMouseMove={handleMapMouseMove}
          interactiveLayerIds={
            shouldCluster && clusterLayer.id
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

          <ClusterSource clusteredData={clusteredGeoJSONData} />

          <TaskGeometryLayer selectedTaskId={selectedTask?.id ?? null} />

          {spideredMarkers.size > 0 && (
            <SpiderMarkers
              markers={markersData.markers.filter((m) => spideredMarkers.has(m.id))}
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
            }}
            mapRef={mapRef}
          />,
          portalTarget
        )}

      <LoadingIndicator isLoading={isLoadingMarkers} />

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

      <ClusterToggle isClustered={shouldCluster} onChange={setCluster} />
    </div>
  )
}
