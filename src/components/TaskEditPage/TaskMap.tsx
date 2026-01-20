import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { ClusterSource } from './TaskMap/ClusterSource'
import { clusterLayer, useTaskEditMap } from './TaskMap/hooks'
import { LoadingIndicator } from './TaskMap/LoadingIndicator'
import { MapPopups } from './TaskMap/MapPopups'
import { MarkerPins } from './TaskMap/MarkerPins'
import { TaskGeometryLayer } from './TaskMap/TaskGeometryLayer'

export const TaskMap = () => {
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
    setCluster,
    geoJSONData,
    primaryTaskId,
  } = useTaskEditMap()

  const initialViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 2,
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
          primaryTaskId={primaryTaskId}
          onSingleMarkerClick={handleSingleMarkerClick}
          onOverlapMarkerClick={handleOverlapMarkerClick}
        />

        <TaskGeometryLayer popupInfo={popupInfo} primaryTaskId={primaryTaskId} />

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
