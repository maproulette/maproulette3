import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/shared/Map/MapControls'
import { MapStyleSwitcher } from '@/components/shared/Map/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterSlider'
import { ClusterSource } from '@/components/shared/TaskMarkers/ClusterSource'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { SpiderMarkers } from '@/components/shared/TaskMarkers/SpiderMarkers'
import { useTaskBundleContext } from '@/components/TaskEditPage/TaskBundleContext'
import { EDITABLE_STATUSES, useTaskContext } from '@/components/TaskEditPage/TaskContext'
import { useTaskMapContext } from '@/components/TaskEditPage/TaskMapContext'
import type { TaskMarker } from '@/types/Task'
import { ClearBundleDialog } from './TaskMap/ClearBundleDialog'
import { LassoLayer } from './TaskMap/LassoLayer'
import { LoadingIndicator } from './TaskMap/LoadingIndicator'
import { MultiTaskPanel } from './TaskMap/MultiTaskPanel'
import { useTaskEditMapContext } from './TaskMap/TaskEditMapContext'
import { TaskGeometryLayer } from './TaskMap/TaskGeometryLayer'
import { useAllMarkersMap } from './TaskMap/useAllMarkersMap'
import { useLassoBundleSync } from './TaskMap/useLassoBundleSync'
import { useMapControlButtons } from './TaskMap/useMapControlButtons'
import { initialViewState, useMapNavigation } from './TaskMap/useMapNavigation'
import { useMarkerVisibility } from './TaskMap/useMarkerVisibility'
import { useStyledClusteredData } from './TaskMap/useStyledClusteredData'
import { useTaskMapShortcuts } from './TaskMap/useTaskMapShortcuts'

export const TaskMap = () => {
  const { bundleEditsDisabled, activeBundle } = useTaskBundleContext()
  const { task } = useTaskContext()
  const isEditableStatus = EDITABLE_STATUSES.includes(task.status ?? 0)
  const {
    selectedMarker,
    setSelectedMarker,
    markersHidden,
    activeTaskId,
    drawingMode,
    selectedTaskIds,
  } = useTaskMapContext()

  const {
    mapRef,
    mapLoaded,
    setMapLoaded,
    isStylePanelOpen,
    setIsStylePanelOpen,
    defaultStyle,
    markersData,
    overlapData,
    isLoadingMarkers,
    onMapClick,
    onMouseMove,
    isClustered,
    setIsClustered,
    primaryTaskId,
    spideredMarkers,
    clusteredGeoJSONData,
  } = useTaskEditMapContext()

  // Extracted hooks
  useMarkerVisibility()
  useLassoBundleSync()
  useTaskMapShortcuts()

  const allMarkersMap = useAllMarkersMap(markersData.markers, overlapData.overlaps)
  const styledClusteredData = useStyledClusteredData(clusteredGeoJSONData)

  const { handleCenterToTask } = useMapNavigation(mapLoaded, markersData.markers, allMarkersMap)

  const mapControlButtons = useMapControlButtons(mapLoaded, handleCenterToTask)

  return (
    <div className="relative h-full w-full">
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={defaultStyle}
        onLoad={() => setMapLoaded(true)}
        onClick={onMapClick}
        onMouseMove={onMouseMove}
        interactiveLayerIds={
          spideredMarkers.size > 0
            ? [
                LAYER_IDS.clusters,
                LAYER_IDS.clusterCount,
                LAYER_IDS.points,
                'spidered-markers-layer',
              ]
            : [LAYER_IDS.clusters, LAYER_IDS.clusterCount, LAYER_IDS.points]
        }
        cursor={drawingMode ? 'crosshair' : undefined}
      >
        {!markersHidden && <ClusterSource clusteredData={styledClusteredData} />}

        {!markersHidden && spideredMarkers.size > 0 && (
          <SpiderMarkers
            markers={Array.from(spideredMarkers.keys())
              .map((id) => allMarkersMap.get(id))
              .filter((m): m is TaskMarker => m !== undefined)}
            spiderPositions={spideredMarkers}
            primaryTaskId={primaryTaskId}
            activeBundle={activeBundle}
            onMarkerClick={(task) => {
              if (task.id !== primaryTaskId) {
                setSelectedMarker(task)
              }
            }}
            selectedTaskId={selectedMarker?.id ?? null}
            activeTaskId={activeTaskId}
            lassoSelectedTaskIds={selectedTaskIds}
          />
        )}

        <TaskGeometryLayer />
        <LassoLayer />
      </MapGL>

      <LoadingIndicator isLoading={isLoadingMarkers} />

      {/* Multi-task mode controls */}
      <div className="absolute top-2 left-2 z-10">
        {!bundleEditsDisabled && isEditableStatus && <MultiTaskPanel />}
      </div>

      {/* Drawing mode indicator */}
      {drawingMode && (
        <div className="-translate-x-1/2 absolute top-14 left-1/2 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-white shadow-md">
          Click and drag to select tasks • ESC to cancel
        </div>
      )}

      <MapControls
        map={mapRef}
        mapLoaded={mapLoaded}
        showZoom={true}
        showReset={true}
        showLayers={true}
        collapsible={true}
        defaultOpen={true}
        customButtons={mapControlButtons}
        onLayersClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
        StyleSwitcherPanel={MapStyleSwitcher}
        styleSwitcherPanelProps={{
          map: mapRef,
          mapLoaded,
          isOpen: isStylePanelOpen,
          onClose: () => setIsStylePanelOpen(false),
        }}
      />

      <ClusterToggle isClustered={isClustered} onChange={setIsClustered} />

      <ClearBundleDialog />
    </div>
  )
}
