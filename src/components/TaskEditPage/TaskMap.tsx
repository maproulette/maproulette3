import { useEffect, useMemo, useState } from 'react'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Crosshair, Lasso, Package, Trash2, XSquare } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/api'
import type { MapControlButton } from '@/components/shared/MapControls'
import { MapControls } from '@/components/shared/MapControls'
import { MapStyleSwitcher } from '@/components/shared/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterSlider'
import { LAYER_IDS } from '@/components/shared/TaskMarkers/const'
import { SpiderMarkers } from '@/components/shared/TaskMarkers/SpiderMarkers'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Task, TaskMarker } from '@/types/Task'
import { useTaskBundleContext } from './contexts/TaskBundleContext'
import { useTaskContext } from './contexts/TaskContext'
import { useTaskMapContext } from './contexts/TaskMapContext'
import { ClusterSource } from './TaskMap/ClusterSource'
import { useTaskEditMap } from './TaskMap/hooks'
import { LassoLayer } from './TaskMap/LassoLayer'
import { LoadingIndicator } from './TaskMap/LoadingIndicator'
import { TaskGeometryLayer } from './TaskMap/TaskGeometryLayer'
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
    setShowBundleOnly,
  } = useTaskBundleContext()
  const { selectedMarker, setSelectedMarker, markersHidden, setMarkersHidden, activeTaskId } =
    useTaskMapContext()

  // Delete bundle state and mutation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteBundleMutation = api.taskBundle.useDeleteTaskBundle()

  const handleDeleteBundle = () => {
    if (!activeBundle) return
    // If bundleId is 0, it's an unsaved bundle - just clear it locally
    if (activeBundle.bundleId === 0) {
      clearBundle()
      setShowDeleteDialog(false)
      toast.success('Bundle cleared')
      return
    }
    deleteBundleMutation.mutate(activeBundle.bundleId, {
      onSuccess: () => {
        setShowDeleteDialog(false)
      },
    })
  }

  const {
    mapRef,
    mapLoaded,
    setMapLoaded,
    isStylePanelOpen,
    setIsStylePanelOpen,
    defaultStyle,
    taskCount,
    markersData,
    overlapData,
    isLoadingMarkers,
    handleMapClick,
    handleMapMouseMove,
    isClustered,
    setIsClustered,
    clusteredGeoJSONData,
    primaryTaskId,
    spideredMarkers,
    isClusteringForced,
    visibleTaskCount,
  } = useTaskEditMap(showBundleOnly, activeBundle)

  // Reset markersHidden when selected marker is cleared
  useEffect(() => {
    if (!selectedMarker && markersHidden) {
      setMarkersHidden(false)
    }
  }, [selectedMarker, markersHidden, setMarkersHidden])

  const { data: primaryTaskData } = api.task.getTask(primaryTaskId)

  const {
    drawingMode,
    selectedTaskIds,
    isAtSelectionLimit,
    lassoPolygon,
    startDrawing,
    cancelDrawing,
    deselectAllInView,
    clearSelection,
  } = useLassoSelection(
    mapRef,
    markersData.markers as TaskMarker[],
    primaryTaskId,
    activeBundle?.taskIds
  )

  // Create a combined lookup for all markers (regular + overlap tasks)
  const allMarkersMap = useMemo(() => {
    const map = new Map<number, TaskMarker>()
    // Add regular markers
    markersData.markers.forEach((m) => {
      map.set(m.id, m)
    })
    // Add overlap task markers (these aren't in regular markers)
    overlapData.overlaps.forEach((overlap) => {
      overlap.tasks.forEach((task) => {
        if (!map.has(task.id)) {
          map.set(task.id, task)
        }
      })
    })
    return map
  }, [markersData.markers, overlapData.overlaps])

  // Apply lasso selection styling to clustered data
  const styledClusteredData = useMemo((): GeoJSON.FeatureCollection => {
    if (selectedTaskIds.size === 0) {
      return clusteredGeoJSONData
    }

    return {
      type: 'FeatureCollection',
      features: clusteredGeoJSONData.features.map((feature) => {
        const taskId = feature.properties?.id as number | undefined
        if (taskId == null || feature.properties?.cluster) {
          return feature
        }
        const isLassoSelected = selectedTaskIds.has(taskId)
        if (!isLassoSelected) {
          return feature
        }
        return {
          ...feature,
          properties: {
            ...feature.properties,
            isLassoSelected: true,
          },
        }
      }),
    }
  }, [clusteredGeoJSONData, selectedTaskIds])

  const initialViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 2,
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

  // Custom buttons for MapControls (only center to task)
  const mapControlButtons: MapControlButton[] = useMemo(
    () => [
      {
        id: 'center-to-task',
        icon: Crosshair,
        onClick: handleCenterToTask,
        tooltip: 'Center to Task',
        disabled: !mapLoaded,
      },
    ],
    [mapLoaded, handleCenterToTask]
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
        {!markersHidden && (
          <ClusterSource clusteredData={styledClusteredData} showBundleOnly={showBundleOnly} />
        )}

        {!markersHidden && spideredMarkers.size > 0 && (
          <SpiderMarkers
            markers={Array.from(spideredMarkers.keys())
              .map((id) => allMarkersMap.get(id))
              .filter((m): m is TaskMarker => m !== undefined)}
            spiderPositions={spideredMarkers}
            primaryTaskId={primaryTaskId}
            activeBundle={activeBundle}
            onMarkerClick={(task) => {
              setSelectedMarker(task)
            }}
            selectedTaskId={selectedMarker?.id ?? null}
            activeTaskId={activeTaskId}
            lassoSelectedTaskIds={selectedTaskIds}
          />
        )}

        <TaskGeometryLayer
          selectedMarker={selectedMarker}
          primaryTaskId={primaryTaskId}
          activeBundle={activeBundle}
        />

        <LassoLayer polygon={lassoPolygon} mode={drawingMode} />
      </MapGL>

      <LoadingIndicator isLoading={isLoadingMarkers} />

      {/* Top bar controls - always visible */}
      <div className="absolute top-2 left-2 z-10 flex flex-wrap items-center gap-2">
        {/* Selection indicator and actions */}
        <div
          className={`rounded-md px-3 py-1.5 font-medium text-sm text-white shadow-md ${
            selectedTaskIds.size === 0
              ? 'bg-zinc-400'
              : isAtSelectionLimit
                ? 'bg-amber-500'
                : 'bg-blue-500'
          }`}
        >
          {selectedTaskIds.size}/{MAX_SELECTED_TASKS} task
          {selectedTaskIds.size !== 1 ? 's' : ''} selected
          {isAtSelectionLimit && ' (limit reached)'}
        </div>
        <div className="flex items-center gap-1 rounded-md bg-white p-1 shadow-md dark:bg-zinc-800">
          <button
            type="button"
            onClick={() => {
              if (drawingMode === 'select') {
                cancelDrawing()
              } else {
                startDrawing('select')
              }
            }}
            disabled={!mapLoaded || isAtSelectionLimit}
            className={`rounded p-1.5 transition-colors ${
              drawingMode === 'select'
                ? 'bg-blue-500 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'
            } disabled:cursor-not-allowed disabled:opacity-50`}
            title={isAtSelectionLimit ? 'Selection limit reached (50)' : 'Lasso Select'}
          >
            <Lasso className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={deselectAllInView}
            disabled={!mapLoaded || selectedTaskIds.size === 0}
            className="rounded p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-700"
            title="Deselect All"
          >
            <XSquare className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleBundleSelectedTasks}
          disabled={bundleEditsDisabled || selectedTaskIds.size === 0}
          className="rounded-md bg-green-600 px-3 py-1.5 font-medium text-sm text-white shadow-md transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Bundle Selected
        </button>
        {/* Bundle controls */}
        {activeBundle && (
          <>
            <button
              type="button"
              onClick={() => setShowBundleOnly(!showBundleOnly)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 font-medium text-sm shadow-md transition-colors ${
                showBundleOnly
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
              }`}
              title={showBundleOnly ? 'Show all tasks' : 'Show only bundled tasks'}
            >
              <Package className="h-4 w-4" />
              {showBundleOnly
                ? 'Show All Tasks'
                : `Show Bundle Only (${activeBundle.taskIds.length})`}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 font-medium text-sm text-white shadow-md transition-colors hover:bg-red-700"
              title="Delete bundle"
            >
              <Trash2 className="h-4 w-4" />
              Delete Bundle
            </button>
          </>
        )}
      </div>

      {/* Drawing mode indicator */}
      {drawingMode && (
        <div className="-translate-x-1/2 absolute top-2 left-1/2 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-white shadow-md">
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

      <ClusterToggle
        isClustered={isClustered}
        onChange={setIsClustered}
        taskCount={taskCount}
        visibleCount={visibleTaskCount}
        isForced={isClusteringForced}
      />

      {/* Delete Bundle Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task Bundle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the bundle association from all {activeBundle?.taskIds.length ?? 0}{' '}
              tasks. The tasks themselves will not be deleted, only unbundled. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBundle}
              disabled={deleteBundleMutation.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
            >
              {deleteBundleMutation.isPending ? 'Deleting...' : 'Delete Bundle'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
