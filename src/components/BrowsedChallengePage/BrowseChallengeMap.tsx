import { Maximize2 } from 'lucide-react'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { ClusterSource } from './BrowseChallengeMap/ClusterSource'
import { clusterLayer, useBrowseChallengeMap } from './BrowseChallengeMap/hooks'
import { LoadingIndicator } from './BrowseChallengeMap/LoadingIndicator'
import { MapPopups } from './BrowseChallengeMap/MapPopups'
import { MarkerPins } from './BrowseChallengeMap/MarkerPins'
import { TaskGeometryLayer } from './BrowseChallengeMap/TaskGeometryLayer'

export const BrowseChallengeMap = () => {
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
    handleMapClick,
    handleMapMouseMove,
    handleMapMoveEnd,
    setCluster,
    geoJSONData,
    zoomToAllTags,
    hasAllTagsBounds,
  } = useBrowseChallengeMap()

  const initialViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 0,
  }

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
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={defaultStyle}
        onLoad={() => setMapLoaded(true)}
        onClick={(e: MapMouseEvent) => {
          handleMapClick(e)
        }}
        onMouseMove={handleMapMouseMove}
        onMoveEnd={handleMapMoveEnd}
        interactiveLayerIds={
          shouldCluster && clusterLayer.id
            ? [clusterLayer.id, LAYER_IDS.clusterCount, LAYER_IDS.points]
            : undefined
        }
      >
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
        customButtons={
          hasAllTagsBounds
            ? [
                {
                  icon: Maximize2,
                  onClick: zoomToAllTags,
                  tooltip: 'Zoom out to all tags',
                  disabled: !mapLoaded,
                },
              ]
            : []
        }
      />

      <ClusterToggle
        clusteringEnabled={shouldCluster}
        onToggle={setCluster}
        taskCount={taskCount}
        showWarnings={false}
      />
    </div>
  )
}
