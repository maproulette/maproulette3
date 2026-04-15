import { useEffect, useId, useRef, useState } from 'react'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from '@/components/Map/MapControls'
import { MapStyleSwitcher } from '@/components/Map/MapStyleSwitcher'
import { ClusterSource } from '@/components/Map/TaskMarkers/ClusterSource'
import { ClusterToggle } from '@/components/Map/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/Map/TaskMarkers/const'
import { SpiderMarkers } from '@/components/Map/TaskMarkers/SpiderMarkers'
import { useTaskBundleContext } from '@/components/Pages/TaskEditPage/contexts/TaskBundleContext'
import {
  EDITABLE_STATUSES,
  useTaskContext,
} from '@/components/Pages/TaskEditPage/contexts/TaskContext'
import { useTaskMapContext } from '@/components/Pages/TaskEditPage/contexts/TaskMapContext'
import { MapLoadingIndicator } from '@/components/shared/MapLoadingIndicator'
import type { TaskMarker } from '@/types/Task'
import { useEditorContext } from './contexts/EditorContext'
import { ClearBundleDialog } from './TaskMap/ClearBundleDialog'
import { LassoLayer } from './TaskMap/LassoLayer'
import { MultiTaskPanel } from './TaskMap/MultiTaskPanel'
import { useTaskEditMapContext } from './TaskMap/TaskEditMapContext'
import { TaskGeometryLayer } from './TaskMap/TaskGeometryLayer'
import { useAllMarkersMap } from './TaskMap/useAllMarkersMap'
import { useLassoBundleSync } from './TaskMap/useLassoBundleSync'
import { useMapControlButtons } from './TaskMap/useMapControlButtons'
import { DEFAULT_VIEW_STATE, useMapNavigation } from './TaskMap/useMapNavigation'
import { useMarkerVisibility } from './TaskMap/useMarkerVisibility'
import { useStyledClusteredData } from './TaskMap/useStyledClusteredData'
import { useTaskMapShortcuts } from './TaskMap/useTaskMapShortcuts'

export const TaskMap = () => {
  const mapId = useId()
  const { bundleEditsDisabled, activeBundle } = useTaskBundleContext()
  const { task } = useTaskContext()
  const { openIdEditor, idEditorMounted, idUnsavedCount, activeView, idViewportRef } =
    useEditorContext()
  const prevActiveView = useRef(activeView)
  const isEditableStatus = EDITABLE_STATUSES.includes(task.status ?? 0)
  const { selectedMarker, markersHidden, activeTaskId, drawingMode, selectedTaskIds } =
    useTaskMapContext()

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
    initialBoundsApplied,
  } = useTaskEditMapContext()

  // Sync task map to iD editor viewport when switching back
  useEffect(() => {
    const wasId = prevActiveView.current === 'id'
    prevActiveView.current = activeView
    if (wasId && activeView === 'map' && idViewportRef.current && mapRef.current) {
      const { lat, lng, zoom } = idViewportRef.current
      mapRef.current.jumpTo({ center: [lng, lat], zoom })
    }
  }, [activeView, idViewportRef, mapRef])

  // Extracted hooks
  useMarkerVisibility()
  useLassoBundleSync()
  useTaskMapShortcuts()

  const allMarkersMap = useAllMarkersMap(markersData.markers, overlapData.overlaps)
  const styledClusteredData = useStyledClusteredData(clusteredGeoJSONData)

  const { handleCenterToTask } = useMapNavigation(mapLoaded, markersData.markers, allMarkersMap)

  const mapControlButtons = useMapControlButtons(mapLoaded, handleCenterToTask)

  const [initialViewState] = useState(() => {
    const loc = task.location
    let lng: number | undefined
    let lat: number | undefined

    if (typeof loc === 'string') {
      try {
        const parsed = JSON.parse(loc) as { lng?: number; lat?: number }
        lng = parsed.lng
        lat = parsed.lat
      } catch {
        // ignore
      }
    } else if (typeof loc === 'object' && loc != null && 'lng' in loc && 'lat' in loc) {
      const l = loc as { lng: number; lat: number }
      lng = l.lng
      lat = l.lat
    }

    if (lng != null && lat != null && (lng !== 0 || lat !== 0)) {
      return { longitude: lng, latitude: lat, zoom: 15 }
    }
    return DEFAULT_VIEW_STATE
  })

  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0 transition-opacity duration-150"
        style={{ opacity: initialBoundsApplied ? 1 : 0 }}
      >
        <MapGL
          id={mapId}
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
              selectedTaskId={selectedMarker?.id ?? null}
              activeTaskId={activeTaskId}
              lassoSelectedTaskIds={selectedTaskIds}
            />
          )}

          <TaskGeometryLayer />
          <LassoLayer />
        </MapGL>
      </div>

      <MapLoadingIndicator isLoading={isLoadingMarkers || !initialBoundsApplied} centered />

      {/* Multi-task mode controls + iD Editor button */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
        {!bundleEditsDisabled && isEditableStatus && <MultiTaskPanel />}
        <button
          type="button"
          onClick={openIdEditor}
          className="relative flex items-center gap-1.5 rounded-lg bg-zinc-800/90 px-3 py-2 font-medium text-sm text-white shadow-md transition-colors hover:bg-zinc-700"
          title="Edit in iD (inline)"
        >
          Edit in iD
          {idEditorMounted && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              {idUnsavedCount > 0 && (
                <span className="rounded-full bg-yellow-500 px-1.5 py-0.5 font-bold text-[10px] text-white leading-none">
                  {idUnsavedCount}
                </span>
              )}
            </span>
          )}
        </button>
      </div>

      {/* Drawing mode indicator */}
      {drawingMode && (
        <div className="-translate-x-1/2 absolute top-14 left-1/2 rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white shadow-md">
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

      <ClusterToggle clusteringEnabled={isClustered} onToggle={setIsClustered} />

      <ClearBundleDialog />
    </div>
  )
}
