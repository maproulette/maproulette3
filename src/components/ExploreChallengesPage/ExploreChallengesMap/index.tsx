import { useEffect, useRef } from 'react'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { SpiderMarkers } from '@/components/shared/TaskMarkers/SpiderMarkers'
import { createSpiderGroup } from '@/components/shared/TaskMarkers/spiderUtils'
import type { TaskMarker } from '@/types/Task'
import { calculateBoundingBox, fitMapToBounds, isWorldBounds } from '@/utils/mapUtils'
import { useExploreChallengesSearchContext } from '../ExploreChallengesSearchContext'
import { ClusterSource } from './ClusterSource'
import { clusterLayer, useExploreChallengesMap } from './hooks'
import { LoadingIndicator } from './LoadingIndicator'
import { LocationPolygonLayer } from './LocationPolygonLayer'
import { MapPopups } from './MapPopups'
import { MarkerPins } from './MarkerPins'
import { TaskGeometryLayer } from './TaskGeometryLayer'

export const ExploreChallengesMap = () => {
  const {
    mapRef,
    mapLoaded,
    setMapLoaded,
    isStylePanelOpen,
    setIsStylePanelOpen,
    popupInfo,
    setPopupInfo,
    defaultStyle,
    taskCount,
    shouldCluster,
    markersData,
    overlapData,
    isLoadingMarkers,
    handleMapMoveEnd,
    handleMapClick,
    handleMapMouseMove,
    setCluster,
    geoJSONData,
    locationGeojson,
    spideredMarkers,
    setSpideredMarkers,
  } = useExploreChallengesMap()

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

    const bounds = calculateBoundingBox(locationGeojson)
    if (bounds) {
      fitMapToBounds(map, bounds, {
        padding: 50,
        duration: 1000,
      })
    }

    previousLocationGeojsonRef.current = locationGeojson
  }, [locationGeojson, mapLoaded, mapRef])

  const handleSingleMarkerClick = (task: (typeof markersData.markers)[0]) => {
    setPopupInfo({ type: 'single', task })
  }

  const handleOverlapMarkerClick = (tasks: TaskMarker[], center: [number, number]) => {
    if (!mapRef.current) return
    const map = mapRef.current.getMap()
    if (!map) return

    // Create spider markers from the overlapping tasks
    const spiderGroup = createSpiderGroup(tasks, center, map)
    setSpideredMarkers(spiderGroup)
    setPopupInfo(null)
  }

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
              ? [clusterLayer.id, LAYER_IDS.clusterCount, LAYER_IDS.points, 'spidered-markers-layer']
              : [LAYER_IDS.points, 'spidered-markers-layer']
          }
        >
          <LocationPolygonLayer locationGeojson={locationGeojson} />

          {shouldCluster && <ClusterSource geoJSONData={geoJSONData} />}

          <MarkerPins
            shouldCluster={shouldCluster}
            nonOverlapping={overlapData.nonOverlapping}
            overlaps={overlapData.overlaps}
            onSingleMarkerClick={handleSingleMarkerClick}
            onOverlapMarkerClick={handleOverlapMarkerClick}
          />

          <TaskGeometryLayer popupInfo={popupInfo} />

          {/* Spider markers for overlapping tasks */}
          {spideredMarkers.size > 0 && (
            <SpiderMarkers
              markers={markersData.markers.filter((m) => spideredMarkers.has(m.id))}
              spiderPositions={spideredMarkers}
              selectedTaskId={popupInfo?.type === 'single' ? popupInfo.task.id : undefined}
            />
          )}

          <MapPopups
            popupInfo={popupInfo}
            onClose={() => {
              setPopupInfo(null)
              setSpideredMarkers(new Map())
            }}
            mapRef={mapRef}
          />
        </MapGL>
      </div>

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

      <ClusterToggle
        clusteringEnabled={shouldCluster}
        onToggle={setCluster}
        taskCount={taskCount}
        showWarnings={true}
      />
    </div>
  )
}
