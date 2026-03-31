import { useEffect, useMemo, useRef, useState } from 'react'
import type { MapMouseEvent } from 'react-map-gl/maplibre'
import { Map as MapGL } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import {
  ChevronDown,
  Crosshair,
  Eye,
  EyeOff,
  Filter,
  Lasso,
  RotateCcw,
  Trash2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/api'
import type { MapControlButton } from '@/components/shared/Map/MapControls'
import { MapControls } from '@/components/shared/Map/MapControls'
import { MapStyleSwitcher } from '@/components/shared/Map/MapStyleSwitcher'
import { ClusterToggle } from '@/components/shared/TaskMarkers/ClusterSlider'
import { ClusterSource } from '@/components/shared/TaskMarkers/ClusterSource'
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import type { TaskMarker } from '@/types/Task'
import { type KeyboardShortcut, useRegisterShortcuts } from '@/components/TaskEditPage/KeyboardShortcutsContext'
import { useTaskBundleContext } from '@/components/TaskEditPage/TaskBundleContext'
import { EDITABLE_STATUSES, useTaskContext } from '@/components/TaskEditPage/TaskContext'
import { useTaskMapContext } from '@/components/TaskEditPage/TaskMapContext'
import { useTaskEditMap } from './TaskMap/hooks'
import { LassoLayer } from './TaskMap/LassoLayer'
import { LoadingIndicator } from './TaskMap/LoadingIndicator'
import { TaskGeometryLayer } from './TaskMap/TaskGeometryLayer'
import { MAX_SELECTED_TASKS, useLassoSelection } from './TaskMap/useLassoSelection'

export const TaskMap = () => {
  const {
    activeBundle,
    setActiveBundle,
    bundleEditsDisabled,
    clearBundle,
    initialBundle,
    resetBundle,
    showBundleOnly,
    setShowBundleOnly,
  } = useTaskBundleContext()
  const { task } = useTaskContext()
  const isEditableStatus = EDITABLE_STATUSES.includes(task.status ?? 0)
  const { selectedMarker, setSelectedMarker, markersHidden, setMarkersHidden, activeTaskId } =
    useTaskMapContext()

  // Delete bundle state and mutation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [multiTaskPanelOpen, setMultiTaskPanelOpen] = useState(true)
  const handleClearBundle = () => {
    if (!activeBundle) return

    // Clear the bundle completely - work on only the primary task
    clearBundle()
    toast.success('Now working on only the primary task')
    setShowDeleteDialog(false)
  }

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
    handleMapClick,
    handleMapMouseMove,
    isClustered,
    setIsClustered,
    clusteredGeoJSONData,
    primaryTaskId,
    spideredMarkers,
  } = useTaskEditMap(showBundleOnly, activeBundle)

  // Track previous selectedMarker to detect when it's cleared
  const prevSelectedMarkerRef = useRef<typeof selectedMarker>(null)

  // Reset markersHidden only when selectedMarker transitions from non-null to null
  // (i.e., when a popup is closed, not when it was already null)
  useEffect(() => {
    const hadMarker = prevSelectedMarkerRef.current !== null
    const hasMarker = selectedMarker !== null

    // Only reset if we had a marker before and now we don't
    if (hadMarker && !hasMarker && markersHidden) {
      setMarkersHidden(false)
    }

    prevSelectedMarkerRef.current = selectedMarker
  }, [selectedMarker, markersHidden, setMarkersHidden])

  const { data: primaryTaskData } = api.task.getTask(primaryTaskId)

  const {
    drawingMode,
    selectedTaskIds,
    lassoPolygon,
    startDrawing,
    cancelDrawing,
    clearSelection,
  } = useLassoSelection(
    mapRef,
    markersData.markers as TaskMarker[],
    primaryTaskId,
    activeBundle?.taskIds
  )

  // When lasso selection changes, directly add tasks to bundle (or create new bundle)
  useEffect(() => {
    if (selectedTaskIds.size === 0) return

    const selectedArray = Array.from(selectedTaskIds)

    if (!activeBundle) {
      // Create new bundle with primary task and selected tasks
      const newTaskIds = [primaryTaskId, ...selectedArray].slice(0, MAX_SELECTED_TASKS)
      const newBundle = {
        bundleId: 0,
        taskIds: newTaskIds,
        tasks: primaryTaskData ? [primaryTaskData] : [],
        name: 'Bundle (pending)',
      }
      setActiveBundle(newBundle)
      // Note: Don't clear initialBundle here - it should persist based on the primary task's original bundle
    } else {
      // Add to existing bundle
      const newTaskIds = selectedArray.filter((id) => !activeBundle.taskIds.includes(id))

      if (newTaskIds.length > 0) {
        const updatedTaskIds = [...activeBundle.taskIds, ...newTaskIds].slice(0, MAX_SELECTED_TASKS)
        setActiveBundle({
          ...activeBundle,
          taskIds: updatedTaskIds,
          tasks: activeBundle.tasks,
        })
      }
    }

    // Clear selection after adding to bundle
    clearSelection()
  }, [
    selectedTaskIds,
    activeBundle,
    setActiveBundle,
    clearSelection,
    primaryTaskId,
    primaryTaskData,
  ])

  // Register keyboard shortcuts with handlers
  const taskMapShortcuts: KeyboardShortcut[] = useMemo(
    () => [
      {
        key: 'D',
        description: 'Start drawing to add tasks',
        category: 'Multi-task',
        handler: () => {
          if (!drawingMode) {
            startDrawing('select')
          }
        },
        enabled: !drawingMode,
      },
      {
        key: 'F',
        description: 'Toggle filter (show bundled tasks only)',
        category: 'Map',
        handler: () => setShowBundleOnly(!showBundleOnly),
        enabled: !!activeBundle,
      },
      {
        key: 'H',
        description: 'Toggle all markers visibility',
        category: 'Map',
        handler: () => setMarkersHidden(!markersHidden),
        enabled: true,
      },
      {
        key: 'Delete',
        description: 'Exit multi-task mode',
        category: 'Multi-task',
        handler: () => setShowDeleteDialog(true),
        enabled: !!activeBundle,
      },
      {
        key: 'Esc',
        description: 'Cancel drawing',
        category: 'Map',
        handler: () => cancelDrawing(),
        enabled: !!drawingMode,
      },
    ],
    [
      activeBundle,
      showBundleOnly,
      setShowBundleOnly,
      markersHidden,
      setMarkersHidden,
      drawingMode,
      cancelDrawing,
      startDrawing,
    ]
  )
  useRegisterShortcuts('task-map', taskMapShortcuts)

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

  // Apply lasso selection and active task styling to clustered data
  const styledClusteredData = useMemo((): GeoJSON.FeatureCollection => {
    if (selectedTaskIds.size === 0 && activeTaskId == null) {
      return clusteredGeoJSONData
    }

    return {
      type: 'FeatureCollection',
      features: clusteredGeoJSONData.features.map((feature) => {
        // Skip cluster features
        if (feature.properties?.point_count != null) {
          return feature
        }
        const taskId = feature.properties?.id as number | undefined
        if (taskId == null) {
          return feature
        }
        const isLassoSelected = selectedTaskIds.has(taskId)
        const isActive = taskId === activeTaskId
        if (!isLassoSelected && !isActive) {
          return feature
        }
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...(isLassoSelected && { isLassoSelected: true }),
            ...(isActive && { isActive: true }),
          },
        }
      }),
    }
  }, [clusteredGeoJSONData, selectedTaskIds, activeTaskId])

  const initialViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 2,
  }

  // Track if we've already zoomed to the primary task for this task ID
  const lastZoomedTaskIdRef = useRef<number | null>(null)

  // Zoom to primary task when task changes or markers initially load
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    if (markersData.markers.length === 0) return

    // Only zoom if we haven't already zoomed to this task
    if (lastZoomedTaskIdRef.current === primaryTaskId) return

    const primaryMarker = markersData.markers.find((m) => m.id === primaryTaskId)
    if (primaryMarker?.location) {
      mapRef.current.flyTo({
        center: [primaryMarker.location.lng, primaryMarker.location.lat],
        zoom: 16,
        duration: 1000,
      })
      lastZoomedTaskIdRef.current = primaryTaskId
    }
  }, [mapLoaded, primaryTaskId, markersData.markers])

  const handleCenterToTask = () => {
    if (!mapRef.current) return

    if (activeBundle && activeBundle.taskIds.length > 1) {
      // Center to bundle bounds
      const bundleMarkers = activeBundle.taskIds
        .map((id) => allMarkersMap.get(id))
        .filter((m): m is TaskMarker => m !== undefined && m.location !== undefined)

      if (bundleMarkers.length > 0) {
        // Calculate bounding box
        let minLng = Infinity
        let maxLng = -Infinity
        let minLat = Infinity
        let maxLat = -Infinity

        for (const marker of bundleMarkers) {
          if (marker.location) {
            minLng = Math.min(minLng, marker.location.lng)
            maxLng = Math.max(maxLng, marker.location.lng)
            minLat = Math.min(minLat, marker.location.lat)
            maxLat = Math.max(maxLat, marker.location.lat)
          }
        }

        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 80, duration: 1000, maxZoom: 16 }
        )
        return
      }
    }

    // Center to primary task
    const primaryMarker = markersData.markers.find((m) => m.id === primaryTaskId)
    if (primaryMarker?.location) {
      mapRef.current.flyTo({
        center: [primaryMarker.location.lng, primaryMarker.location.lat],
        zoom: 16,
        duration: 1000,
      })
    }
  }

  // Custom buttons for MapControls
  const mapControlButtons: MapControlButton[] = useMemo(
    () => [
      {
        id: 'center-to-task',
        icon: Crosshair,
        onClick: handleCenterToTask,
        tooltip:
          activeBundle && activeBundle.taskIds.length > 1 ? 'Center to Bundle' : 'Center to Task',
        disabled: !mapLoaded,
      },
      {
        id: 'toggle-markers',
        icon: markersHidden ? EyeOff : Eye,
        onClick: () => setMarkersHidden(!markersHidden),
        tooltip: markersHidden ? 'Show all markers' : 'Hide all markers',
        disabled: !mapLoaded,
        isActive: markersHidden,
      },

      {
        id: 'toggle-bundle-only',
        icon: Filter,
        onClick: () => setShowBundleOnly(!showBundleOnly),
        tooltip: showBundleOnly
          ? 'Show all tasks (F)'
          : activeBundle
            ? 'Show selected tasks only (F)'
            : 'Show primary task only (F)',
        disabled: !mapLoaded,
        isActive: showBundleOnly,
      },
    ],
    [
      mapLoaded,
      handleCenterToTask,
      markersHidden,
      setMarkersHidden,
      activeBundle,
      showBundleOnly,
      setShowBundleOnly,
    ]
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

        <TaskGeometryLayer
          selectedMarker={selectedMarker}
          primaryTaskId={primaryTaskId}
          activeBundle={activeBundle}
        />

        <LassoLayer polygon={lassoPolygon} mode={drawingMode} />
      </MapGL>

      <LoadingIndicator isLoading={isLoadingMarkers} />

      {/* Multi-task mode controls */}
      <div className="absolute top-2 left-2 z-10">
        {!bundleEditsDisabled && isEditableStatus && (
          <Collapsible
            open={multiTaskPanelOpen}
            onOpenChange={setMultiTaskPanelOpen}
            className="rounded-lg bg-white/90 shadow-lg backdrop-blur-sm dark:bg-zinc-800/90"
          >
            {/* Header - always visible, clickable to expand/collapse */}
            <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm text-zinc-700 dark:text-zinc-200">
                  {activeBundle ? (
                    <>
                      Working on {activeBundle.taskIds.length} task
                      {activeBundle.taskIds.length !== 1 ? 's' : ''}
                      <span className="ml-1 text-zinc-400">({MAX_SELECTED_TASKS} max)</span>
                    </>
                  ) : (
                    'Work on multiple tasks'
                  )}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform ${multiTaskPanelOpen ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>

            {/* Expandable content */}
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand">
              <div className="flex flex-col gap-2 border-zinc-200 border-t px-3 pt-2 pb-3 dark:border-zinc-700">
                {/* Lasso tool */}
                <button
                  type="button"
                  onClick={() => {
                    if (drawingMode === 'select') {
                      cancelDrawing()
                    } else {
                      startDrawing('select')
                    }
                  }}
                  disabled={
                    !mapLoaded ||
                    (activeBundle ? activeBundle.taskIds.length >= MAX_SELECTED_TASKS : false)
                  }
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors ${
                    drawingMode === 'select'
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                  title={
                    activeBundle && activeBundle.taskIds.length >= MAX_SELECTED_TASKS
                      ? 'Maximum tasks reached'
                      : 'Draw to add tasks (D)'
                  }
                >
                  <Lasso className="h-4 w-4" />
                  {drawingMode === 'select' ? 'Drawing...' : 'Draw to add tasks'}
                </button>

                {/* Clear all - only show when there's a bundle */}
                {activeBundle && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-red-600 text-sm transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Work on only the primary task
                  </button>
                )}

                {/* Reset to initial bundle - show when there was an initial bundle and current state differs */}
                {initialBundle &&
                  (!activeBundle ||
                    activeBundle.bundleId !== initialBundle.bundleId ||
                    activeBundle.taskIds.length !== initialBundle.taskIds.length ||
                    !activeBundle.taskIds.every((id) => initialBundle.taskIds.includes(id))) && (
                    <button
                      type="button"
                      onClick={() => resetBundle()}
                      className="flex items-center justify-center gap-2 rounded-md px-3 py-2 font-medium text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset to initial bundle
                    </button>
                  )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
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

      {/* Clear Bundle Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Task Bundle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unbundle all {activeBundle?.taskIds.length ?? 0} tasks. The tasks themselves
              will not be deleted, only separated. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearBundle}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
            >
              Clear Bundle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
