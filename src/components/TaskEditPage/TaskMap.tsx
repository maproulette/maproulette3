import { useMemo } from 'react'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Crosshair, Lasso, XSquare } from 'lucide-react'
import { api } from '@/api'
import type { MapControlButton } from '@/components/shared/MapControls'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterToggle'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import type { Task, TaskMarker } from '@/types/Task'
import { useTaskBundleContext } from './contexts/TaskBundleContext'
import { useTaskContext } from './contexts/TaskContext'
import { BundleFilterToggle } from './TaskMap/BundleFilterToggle'
import { ClusterSource } from './TaskMap/ClusterSource'
import { clusterLayer, useTaskEditMap } from './TaskMap/hooks'
import { LassoLayer } from './TaskMap/LassoLayer'
import { LoadingIndicator } from './TaskMap/LoadingIndicator'
import { MapPopups } from './TaskMap/MapPopups'
import { SpiderMarkers } from './TaskMap/SpiderMarkers'
import { TaskGeometryLayer } from './TaskMap/TaskGeometryLayer'
import { UnclusteredSource } from './TaskMap/UnclusteredSource'
import { MAX_SELECTED_TASKS, useLassoSelection } from './TaskMap/useLassoSelection'

export const TaskMap = () => {
  const { task } = useTaskContext()
  const {
    activeBundle,
    setActiveBundle,
    bundleEditsDisabled,
    clearBundle,
    setInitialBundle,
    showBundleOnly,
  } = useTaskBundleContext()

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
    isLoadingMarkers,
    handleMapClick,
    handleMapMouseMove,
    setCluster,
    geoJSONData,
    primaryTaskId,
    spideredMarkers,
    setSpideredMarkers,
  } = useTaskEditMap(showBundleOnly, activeBundle)

  const { data: primaryTaskData } = useQuery(api.task.getTask(primaryTaskId))

  const {
    drawingMode,
    selectedTaskIds,
    isAtSelectionLimit,
    lassoPolygon,
    startDrawing,
    cancelDrawing,
    selectAllInView,
    deselectAllInView,
    clearSelection,
  } = useLassoSelection(mapRef, markersData.markers as TaskMarker[], primaryTaskId, activeBundle?.taskIds)

  const initialViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 2,
  }

  const handleAddToBundle = (taskId: number) => {
    if (bundleEditsDisabled) return

    const taskToAddMarker = markersData.markers.find((m) => m.id === taskId)
    if (!taskToAddMarker) {
      console.error('Task not found in markers data')
      return
    }

    if (!activeBundle) {
      const primaryTask = (primaryTaskData as Task | undefined) || task
      const newBundle = {
        bundleId: 0,
        taskIds: [primaryTaskId, taskId],
        tasks: [primaryTask].filter(Boolean),
        name: `Bundle (pending)`,
      }
      setActiveBundle(newBundle)
      setInitialBundle(null)
    } else {
      if (activeBundle.taskIds.includes(taskId)) {
        return
      }

      const updatedTaskIds = [...activeBundle.taskIds, taskId]

      setActiveBundle({
        ...activeBundle,
        taskIds: updatedTaskIds,
        tasks: activeBundle.tasks,
      })
    }
  }

  const handleRemoveFromBundle = (taskId: number) => {
    if (!activeBundle || bundleEditsDisabled) return

    if (taskId === primaryTaskId) {
      return
    }

    if (!activeBundle.taskIds.includes(taskId)) {
      return
    }

    const updatedTasks = (activeBundle.tasks || []).filter((t) => t.id !== taskId)
    const updatedTaskIds = activeBundle.taskIds.filter((id) => id !== taskId)

    if (updatedTaskIds.length <= 1) {
      clearBundle()
      return
    }

    setActiveBundle({
      ...activeBundle,
      taskIds: updatedTaskIds,
      tasks: updatedTasks,
    })
  }

  const handleOverlapTaskSelect = (taskId: number | null) => {
    if (popupInfo?.type === 'overlap') {
      setPopupInfo({
        ...popupInfo,
        selectedTaskId: taskId,
      })
    }
  }

  const handleCenterToTask = () => {
    if (!mapRef.current) return

    const primaryMarker = markersData.markers.find((m) => m.id === primaryTaskId)
    if (primaryMarker?.location) {
      mapRef.current.flyTo({
        center: [primaryMarker.location.lng, primaryMarker.location.lat],
        zoom: 16,
        duration: 1000,
      })
    }
  }

  const handleBundleSelectedTasks = () => {
    if (bundleEditsDisabled || selectedTaskIds.size === 0) return

    const selectedArray = Array.from(selectedTaskIds)

    if (!activeBundle) {
      // Create new bundle with primary task and selected tasks
      const primaryTask = (primaryTaskData as Task | undefined) || task
      const allTaskIds = [primaryTaskId, ...selectedArray.filter((id) => id !== primaryTaskId)]
      const newBundle = {
        bundleId: 0,
        taskIds: allTaskIds,
        tasks: [primaryTask].filter(Boolean),
        name: `Bundle (pending)`,
      }
      setActiveBundle(newBundle)
      setInitialBundle(null)
    } else {
      // Add selected tasks to existing bundle
      const newTaskIds = selectedArray.filter((id) => !activeBundle.taskIds.includes(id))
      if (newTaskIds.length === 0) return

      const updatedTaskIds = [...activeBundle.taskIds, ...newTaskIds]
      setActiveBundle({
        ...activeBundle,
        taskIds: updatedTaskIds,
        tasks: activeBundle.tasks,
      })
    }

    // Clear the lasso selection after bundling
    clearSelection()
  }

  // Custom buttons for lasso selection
  const lassoButtons: MapControlButton[] = useMemo(
    () => [
      {
        id: 'lasso-select',
        icon: Lasso,
        onClick: () => {
          if (drawingMode === 'select') {
            cancelDrawing()
          } else {
            startDrawing('select')
          }
        },
        tooltip: isAtSelectionLimit ? 'Selection limit reached (50)' : 'Lasso Select',
        isActive: drawingMode === 'select',
        disabled: !mapLoaded || isAtSelectionLimit,
      },
      {
        id: 'lasso-deselect',
        icon: ({ className }: { className?: string }) => (
          <div className={className} style={{ position: 'relative' }}>
            <Lasso className="h-4 w-4" />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'currentColor',
              }}
            >
              -
            </span>
          </div>
        ),
        onClick: () => {
          if (drawingMode === 'deselect') {
            cancelDrawing()
          } else {
            startDrawing('deselect')
          }
        },
        tooltip: 'Lasso Deselect',
        isActive: drawingMode === 'deselect',
        disabled: !mapLoaded,
      },
      {
        id: 'select-all-in-view',
        icon: CheckSquare,
        onClick: selectAllInView,
        tooltip: isAtSelectionLimit ? 'Selection limit reached (50)' : 'Select All in View',
        disabled: !mapLoaded || isAtSelectionLimit,
      },
      {
        id: 'deselect-all-in-view',
        icon: XSquare,
        onClick: deselectAllInView,
        tooltip: 'Deselect All in View',
        disabled: !mapLoaded,
      },
      {
        id: 'center-to-task',
        icon: Crosshair,
        onClick: handleCenterToTask,
        tooltip: 'Center to Task',
        disabled: !mapLoaded,
      },
    ],
    [drawingMode, mapLoaded, isAtSelectionLimit, startDrawing, cancelDrawing, selectAllInView, deselectAllInView, handleCenterToTask]
  )

  // Handle map click - only for non-lasso interactions
  const onMapClick = (e: MapMouseEvent) => {
    if (!drawingMode) {
      handleMapClick(e)
    }
  }

  // Handle mouse move - only for non-lasso interactions
  const onMouseMove = (e: MapMouseEvent) => {
    if (!drawingMode) {
      handleMapMouseMove(e)
    }
  }

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
          shouldCluster && clusterLayer.id
            ? [clusterLayer.id, LAYER_IDS.clusterCount, LAYER_IDS.points]
            : spideredMarkers.size > 0
              ? [LAYER_IDS.points, 'spidered-markers-layer']
              : [LAYER_IDS.points]
        }
        cursor={drawingMode ? 'crosshair' : undefined}
      >
        {shouldCluster ? (
          <ClusterSource
            geoJSONData={geoJSONData}
            showBundleOnly={showBundleOnly}
            primaryTaskId={primaryTaskId}
            activeBundle={activeBundle}
            selectedTaskId={popupInfo?.type === 'single' ? popupInfo.task.id : null}
            lassoSelectedTaskIds={selectedTaskIds}
          />
        ) : (
          <>
            <UnclusteredSource
              geoJSONData={geoJSONData}
              showBundleOnly={showBundleOnly}
              primaryTaskId={primaryTaskId}
              activeBundle={activeBundle}
              mapRef={mapRef}
              spideredMarkers={spideredMarkers}
              selectedTaskId={popupInfo?.type === 'single' ? popupInfo.task.id : null}
              lassoSelectedTaskIds={selectedTaskIds}
            />
            {spideredMarkers.size > 0 && (
              <SpiderMarkers
                markers={Array.from(spideredMarkers.keys())
                  .map((id) => markersData.markers.find((m) => m.id === id))
                  .filter((m): m is (typeof markersData.markers)[0] => m !== undefined)}
                spiderPositions={spideredMarkers}
                primaryTaskId={primaryTaskId}
                activeBundle={activeBundle}
                onMarkerClick={(task) => {
                  setPopupInfo({ type: 'single', task })
                }}
                selectedTaskId={popupInfo?.type === 'single' ? popupInfo.task.id : null}
                lassoSelectedTaskIds={selectedTaskIds}
              />
            )}
          </>
        )}

        <TaskGeometryLayer
          popupInfo={popupInfo}
          primaryTaskId={primaryTaskId}
          activeBundle={activeBundle}
        />

        <LassoLayer polygon={lassoPolygon} mode={drawingMode} />

        <MapPopups
          popupInfo={popupInfo}
          onClose={() => {
            setPopupInfo(null)
            setSpideredMarkers(new Map())
          }}
          mapRef={mapRef}
          onOverlapTaskSelect={handleOverlapTaskSelect}
          showBundleButtons={true}
          activeBundle={activeBundle}
          primaryTaskId={primaryTaskId}
          onAddToBundle={handleAddToBundle}
          onRemoveFromBundle={handleRemoveFromBundle}
          bundleEditsDisabled={bundleEditsDisabled}
        />
      </MapGL>

      <LoadingIndicator isLoading={isLoadingMarkers} />

      {/* Selection count indicator and bundle button */}
      {selectedTaskIds.size > 0 && (
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <div
            className={`rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-md ${
              isAtSelectionLimit ? 'bg-amber-500' : 'bg-blue-500'
            }`}
          >
            {selectedTaskIds.size}/{MAX_SELECTED_TASKS} task{selectedTaskIds.size !== 1 ? 's' : ''} selected
            {isAtSelectionLimit && ' (limit reached)'}
          </div>
          <button
            type="button"
            onClick={handleBundleSelectedTasks}
            disabled={bundleEditsDisabled}
            className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bundle Selected
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="rounded-md bg-zinc-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-zinc-700"
          >
            Clear
          </button>
        </div>
      )}

      {/* Drawing mode indicator */}
      {drawingMode && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-white shadow-md">
          {drawingMode === 'select' ? 'Lasso Select' : 'Lasso Deselect'} • Click and drag to draw •
          ESC to cancel
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
        customButtons={lassoButtons}
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

      <BundleFilterToggle />
    </div>
  )
}
