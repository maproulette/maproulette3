import { useEffect, useRef } from 'react'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { calculateBoundingBox, fitMapToBounds } from '@/utils/mapUtils'
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
  } = useExploreChallengesMap()


  const hasInitializedRef = useRef(false)
  const previousLocationGeojsonRef = useRef<typeof locationGeojson>(null)

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
  }, [locationGeojson])

  const handleOverlapTaskSelect = (taskId: number | null) => {
    if (popupInfo?.type === 'overlap') {
      setPopupInfo({
        ...popupInfo,
        selectedTaskId: taskId,
      })
    }
  }

  const handleSingleMarkerClick = (task: (typeof markersData.markers)[0]) => {
    setPopupInfo({ type: 'single', task })
  }

  const handleOverlapMarkerClick = (
    tasks: (typeof markersData.markers)[0][],
    center: [number, number]
  ) => {
    setPopupInfo({ type: 'overlap', tasks, center })
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
              ? [clusterLayer.id, LAYER_IDS.clusterCount, LAYER_IDS.points]
              : undefined
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

          <MapPopups
            popupInfo={popupInfo}
            onClose={() => {
              setPopupInfo(null)
            }}
            mapRef={mapRef}
            onOverlapTaskSelect={handleOverlapTaskSelect}
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
